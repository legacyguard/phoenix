import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";
import { classifyDocument } from "@/functions/document-classifier";
import { extractTextFromFile } from "@/functions/text-extractor";
import { extractMetadata } from "@/functions/metadata-extractor";
import { suggestCategory } from "@/functions/category-suggester";
import { detectRelationships } from "@/functions/relationship-detector";
import { logActivity } from "@/services/loggingService";
import type {
  DocumentCategory,
  ExtractedMetadata,
  UserInventory,
  RelationshipResult,
} from "@/types/document-ai";

// Initialize Supabase client with service role key for server-side operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
);

interface ProcessedDocument {
  id: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  category: DocumentCategory;
  confidence: number;
  extractedText: string;
  metadata: ExtractedMetadata;
  suggestedArea: string;
  areaConfidence: number;
  relationships: RelationshipResult;
  processedAt: Date;
}

export async function POST(request: NextRequest) {
  try {
    // Get the authenticated user
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Extract user token and verify
    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: "Invalid authentication" },
        { status: 401 },
      );
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file size (20MB limit)
    const maxSizeInBytes = 20 * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      return NextResponse.json(
        { error: "File size exceeds 20MB limit" },
        { status: 400 },
      );
    }

    // Validate file type
    const allowedMimeTypes = [
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/tiff",
      "image/webp",
    ];

    if (!allowedMimeTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error: "Invalid file type. Supported: PDF, JPEG, PNG, TIFF, WebP",
        },
        { status: 400 },
      );
    }

    // Step 1: Upload file to Supabase Storage
    const fileBuffer = await file.arrayBuffer();
    const fileName = `${user.id}/${uuidv4()}-${file.name}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from("documents")
      .upload(fileName, fileBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return NextResponse.json(
        {
          error: "Failed to upload file to storage",
        },
        { status: 500 },
      );
    }

    // Get the public URL for the uploaded file
    const {
      data: { publicUrl },
    } = supabaseAdmin.storage.from("documents").getPublicUrl(fileName);

    // Step 2: Extract text from the file
    console.log("Extracting text from document...");
    const textResult = await extractTextFromFile(
      Buffer.from(fileBuffer),
      file.type,
    );

    // Step 3: Classify the document
    console.log("Classifying document...");
    const classificationResult = await classifyDocument(publicUrl);

    // Step 4: Extract metadata based on category
    console.log("Extracting metadata...");
    const metadata = await extractMetadata(
      classificationResult.category,
      textResult.text,
    );

    // Step 5: Suggest possession area
    console.log("Suggesting category...");
    const categorySuggestion = await suggestCategory(
      classificationResult.category,
      metadata,
      textResult.text,
    );

    // Step 6: Fetch user's inventory for relationship detection
    const userInventory = await getUserInventory(user.id);

    // Check if user has enabled relationship detection
    const { data: userProfile } = await supabaseAdmin
      .from("user_profiles")
      .select("ai_feature_toggles")
      .eq("user_id", user.id)
      .single();

    let relationships: RelationshipResult = {};

    // Step 7: Detect relationships (only if enabled)
    if (userProfile?.ai_feature_toggles?.relationshipDetection !== false) {
      console.log("Detecting relationships...");
      relationships = await detectRelationships(metadata, userInventory);
    } else {
      console.log("Relationship detection disabled by user");
    }

    // Step 8: Save document metadata to database
    const documentId = uuidv4();
    const processedDocument: ProcessedDocument = {
      id: documentId,
      fileUrl: publicUrl,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      category: classificationResult.category,
      confidence: classificationResult.confidence,
      extractedText: textResult.text,
      metadata,
      suggestedArea: categorySuggestion.suggestedArea,
      areaConfidence: categorySuggestion.confidence,
      relationships,
      processedAt: new Date(),
    };

    // Save to database
    const { error: dbError } = await supabaseAdmin.from("documents").insert({
      id: documentId,
      user_id: user.id,
      file_name: file.name,
      file_size: file.size,
      file_type: file.type,
      file_url: publicUrl,
      storage_path: fileName,
      category: classificationResult.category,
      confidence: classificationResult.confidence,
      extracted_text: textResult.text,
      metadata: metadata,
      suggested_area: categorySuggestion.suggestedArea,
      area_confidence: categorySuggestion.confidence,
      linked_possession_id: relationships.linkedPossessionId,
      linked_person_id: relationships.linkedPersonId,
      relationship_details: relationships.relationshipDetails,
      processed_at: new Date().toISOString(),
    });

    if (dbError) {
      console.error("Database save error:", dbError);
      // Note: File is already uploaded, so we log but continue
    }

    // Log the AI document analysis activity
    try {
      const ipAddress =
        request.headers.get("x-forwarded-for") ||
        request.headers.get("x-real-ip") ||
        "unknown";
      const userAgent = request.headers.get("user-agent") || "unknown";

      await logActivity(
        user.id,
        "AI_SYSTEM",
        "ANALYZED_DOCUMENT",
        documentId,
        ipAddress,
        userAgent,
        {
          category: classificationResult.category,
          confidence: classificationResult.confidence,
          fileName: file.name,
          fileSize: file.size,
        },
      );
    } catch (logError) {
      console.error("Failed to log activity:", logError);
      // Don't fail the request if logging fails
    }

    // Return the complete processing result
    return NextResponse.json({
      success: true,
      document: processedDocument,
      classification: {
        category: classificationResult.category,
        confidence: classificationResult.confidence,
        reasoning: classificationResult.reasoning,
        suggestedTitle: classificationResult.suggestedTitle,
      },
      textExtraction: {
        text: textResult.text.substring(0, 500) + "...", // Preview only
        source: textResult.source,
        pageCount: textResult.pageCount,
      },
      metadata,
      areaSuggestion: {
        suggestedArea: categorySuggestion.suggestedArea,
        confidence: categorySuggestion.confidence,
        reasoning: categorySuggestion.reasoning,
        alternatives: categorySuggestion.alternativeSuggestions,
      },
      relationships: {
        linkedPossessionId: relationships.linkedPossessionId,
        linkedPersonId: relationships.linkedPersonId,
        missingDocumentSuggestion: relationships.missingDocumentSuggestion,
        relatedDocumentIds: relationships.relatedDocumentIds,
      },
    });
  } catch (error) {
    console.error("Document processing error:", error);

    // Determine error type and return appropriate response
    if (error instanceof Error) {
      if (error.message.includes("API key")) {
        return NextResponse.json(
          {
            error: "Configuration error: AI service not properly configured",
          },
          { status: 500 },
        );
      }

      return NextResponse.json(
        {
          error: "Processing failed",
          details: error.message,
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        error: "An unexpected error occurred",
      },
      { status: 500 },
    );
  }
}

// Helper function to fetch user's inventory
async function getUserInventory(userId: string): Promise<UserInventory> {
  try {
    // Fetch possessions
    const { data: possessions, error: possError } = await supabaseAdmin
      .from("possessions")
      .select("*")
      .eq("user_id", userId);

    if (possError) {
      console.error("Error fetching possessions:", possError);
    }

    // Fetch trusted people
    const { data: people, error: peopleError } = await supabaseAdmin
      .from("trusted_people")
      .select("*")
      .eq("user_id", userId);

    if (peopleError) {
      console.error("Error fetching trusted people:", peopleError);
    }

    // Fetch existing documents
    const { data: documents, error: docsError } = await supabaseAdmin
      .from("documents")
      .select("id, category, metadata, processed_at")
      .eq("user_id", userId)
      .order("processed_at", { ascending: false })
      .limit(100);

    if (docsError) {
      console.error("Error fetching documents:", docsError);
    }

    return {
      possessions: possessions || [],
      people: people || [],
      documents:
        documents?.map((doc) => ({
          id: doc.id,
          category: doc.category,
          metadata: doc.metadata,
          uploadDate: new Date(doc.processed_at),
        })) || [],
    };
  } catch (error) {
    console.error("Error fetching user inventory:", error);
    return {
      possessions: [],
      people: [],
      documents: [],
    };
  }
}

// Handle other HTTP methods
export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
