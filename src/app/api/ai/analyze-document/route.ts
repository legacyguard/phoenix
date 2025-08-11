import type { Request, Response } from "express";
import { openAIService } from "../../../../../lib/services/openai.service";
import type { OpenAIRequestOptions } from "../../../../../lib/services/openai.types";

interface AnalyzeDocumentRequest {
  imageBase64: string;
  userId?: string;
  options?: OpenAIRequestOptions;
}

export async function POST(req: Request, res: Response) {
  try {
    // Validate request body
    const body = req.body as AnalyzeDocumentRequest;

    if (!body.imageBase64) {
      return res.status(400).json({
        error: "Missing required field: imageBase64",
      });
    }

    // Add user authentication check here
    // const user = await authenticateUser(req);
    // if (!user) {
    //   return res.status(401).json({ error: 'Unauthorized' });
    // }

    // Validate image size (prevent extremely large images)
    const imageSizeInBytes = Buffer.from(body.imageBase64, "base64").length;
    const maxSizeInMB = 20;

    if (imageSizeInBytes > maxSizeInMB * 1024 * 1024) {
      return res.status(400).json({
        error: `Image size exceeds ${maxSizeInMB}MB limit`,
      });
    }

    // Call OpenAI service
    const response = await openAIService.analyzeDocument(body.imageBase64, {
      ...body.options,
      userId: body.userId,
    });

    if (!response.success) {
      return res.status(400).json({
        error: response.error,
      });
    }

    // Return successful response
    return res.status(200).json({
      success: true,
      data: response.data,
      usage: response.usage,
      cached: response.cached,
    });
  } catch (error) {
    console.error("Document analysis API error:", error);

    return res.status(500).json({
      error: "Internal server error",
      message: "Failed to analyze document",
    });
  }
}

// Handle other HTTP methods
export async function GET(req: Request, res: Response) {
  return res.status(405).json({ error: "Method not allowed" });
}

export async function PUT(req: Request, res: Response) {
  return res.status(405).json({ error: "Method not allowed" });
}

export async function DELETE(req: Request, res: Response) {
  return res.status(405).json({ error: "Method not allowed" });
}
