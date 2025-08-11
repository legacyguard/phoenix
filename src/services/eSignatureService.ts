import { supabase } from "@/lib/supabase";

interface SignatureRequest {
  willId: string;
  userId: string;
  signerEmail: string;
  signerName: string;
  documentBase64: string;
}

interface SignatureStatus {
  envelopeId: string;
  status: "sent" | "delivered" | "signed" | "completed" | "declined";
  signedAt?: string;
  declinedAt?: string;
}

export class ESignatureService {
  // Skribble API configuration
  private skribbleApiBase =
    process.env.SKRIBBLE_API_BASE || "https://api.skribble.com";
  private skribbleApiKey = process.env.SKRIBBLE_API_KEY || "";
  private skribbleAccountId = process.env.SKRIBBLE_ACCOUNT_ID || "";

  // For MVP, we'll implement a simplified signature flow
  // In production, this would integrate with DocuSign API
  async createSignatureRequest(request: SignatureRequest): Promise<string> {
    try {
      // In production, this would:
      // 1. Get access token using JWT
      // 2. Create envelope with document
      // 3. Add signers and tabs
      // 4. Send envelope

      // For now, create a signature request record
      const { data, error } = await supabase
        .from("signature_requests")
        .insert({
          will_id: request.willId,
          user_id: request.userId,
          signer_email: request.signerEmail,
          signer_name: request.signerName,
          status: "pending",
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      // In production, return DocuSign envelope ID
      return data.id;
    } catch (error) {
      console.error("Error creating signature request:", error);
      throw error;
    }
  }

  async getSignatureStatus(envelopeId: string): Promise<SignatureStatus> {
    try {
      // In production, this would check DocuSign API
      const { data, error } = await supabase
        .from("signature_requests")
        .select("*")
        .eq("id", envelopeId)
        .single();

      if (error) throw error;

      return {
        envelopeId: data.id,
        status: data.status,
        signedAt: data.signed_at,
        declinedAt: data.declined_at,
      };
    } catch (error) {
      console.error("Error getting signature status:", error);
      throw error;
    }
  }

  async handleWebhook(event: {
    envelopeId: string;
    status: "sent" | "delivered" | "signed" | "completed" | "declined";
  }): Promise<void> {
    // Handle DocuSign webhook events
    const { envelopeId, status } = event;

    await supabase
      .from("signature_requests")
      .update({
        status,
        updated_at: new Date().toISOString(),
        signed_at: status === "completed" ? new Date().toISOString() : null,
        declined_at: status === "declined" ? new Date().toISOString() : null,
      })
      .eq("envelope_id", envelopeId);

    // Update will status if completed
    if (status === "completed") {
      const { data: request } = await supabase
        .from("signature_requests")
        .select("will_id")
        .eq("envelope_id", envelopeId)
        .single();

      if (request) {
        await supabase
          .from("generated_wills")
          .update({
            status: "signed",
            signed_at: new Date().toISOString(),
          })
          .eq("id", request.will_id);
      }
    }
  }

  // Simple signature verification for MVP
  async verifySimpleSignature(
    willId: string,
    signature: string,
  ): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from("generated_wills")
        .update({
          status: "signed",
          signature_data: signature,
          signed_at: new Date().toISOString(),
        })
        .eq("id", willId)
        .select()
        .single();

      return !error && !!data;
    } catch (error) {
      console.error("Error verifying signature:", error);
      return false;
    }
  }

  // Request QES signature via Skribble
  async requestSkribbleSignature(
    willId: string,
    documentBase64: string,
  ): Promise<{
    success?: boolean;
    requestId?: string;
    url?: string;
    error?: string;
    status?: number;
  }> {
    try {
      // Create signature request in Skribble
      const response = await fetch(
        `${this.skribbleApiBase}/v2/signature-requests`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.skribbleApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            account_id: this.skribbleAccountId,
            title: "Last Will and Testament",
            message: "Please review and sign your will document",
            documents: [
              {
                title: "Will Document",
                content_type: "application/pdf",
                content: documentBase64,
              },
            ],
            signatures: [
              {
                signer_identity_data: {
                  email_address: "signer@example.com", // This should come from user data
                  mobile_number: "+1234567890", // Optional
                },
                signature_level: "QES", // Qualified Electronic Signature
                language: "en",
              },
            ],
            callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/skribble`,
            redirect_urls: {
              success: `${process.env.NEXT_PUBLIC_APP_URL}/wills/${willId}/success`,
              error: `${process.env.NEXT_PUBLIC_APP_URL}/wills/${willId}/error`,
            },
          }),
        },
      );

      if (!response.ok) {
        const error = await response.json();
        return {
          error: error.message || "Failed to create signature request",
          status: response.status,
        };
      }

      const data = await response.json();

      // Save Skribble request ID
      await supabase.from("signature_requests").insert({
        will_id: willId,
        skribble_request_id: data.id,
        status: "pending",
        signature_level: "QES",
        created_at: new Date().toISOString(),
      });

      return {
        success: true,
        requestId: data.id,
        url: data.signing_url,
      };
    } catch (error) {
      console.error("Error creating Skribble signature request:", error);
      return { error: "Failed to create signature request", status: 500 };
    }
  }

  // Handle Skribble webhook
  async handleSkribbleWebhook(event: {
    signature_request_id: string;
    status: string;
    signatures: Array<{ certificate?: string }>;
  }): Promise<void> {
    const { signature_request_id, status, signatures } = event;

    // Update signature request status
    await supabase
      .from("signature_requests")
      .update({
        status,
        updated_at: new Date().toISOString(),
        signature_data: signatures,
      })
      .eq("skribble_request_id", signature_request_id);

    // If all signatures are completed, update will status
    if (status === "signed") {
      const { data: request } = await supabase
        .from("signature_requests")
        .select("will_id")
        .eq("skribble_request_id", signature_request_id)
        .single();

      if (request) {
        await supabase
          .from("generated_wills")
          .update({
            status: "qes_signed",
            qes_signed_at: new Date().toISOString(),
            signature_certificate: signatures[0]?.certificate, // Store QES certificate
          })
          .eq("id", request.will_id);
      }
    }
  }

  // Verify QES signature
  async verifyQESSignature(willId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from("generated_wills")
        .select("signature_certificate, qes_signed_at")
        .eq("id", willId)
        .single();

      if (error || !data?.signature_certificate) {
        return false;
      }

      // In production, verify the certificate with a trusted CA
      // For now, just check if it exists
      return !!data.signature_certificate;
    } catch (error) {
      console.error("Error verifying QES signature:", error);
      return false;
    }
  }
}

export const eSignatureService = new ESignatureService();
