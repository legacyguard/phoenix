import { NextRequest, NextResponse } from "next/server";
import { eSignatureService } from "@/services/eSignatureService";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    // Verify webhook signature
    const signature = request.headers.get("x-skribble-signature");
    const timestamp = request.headers.get("x-skribble-timestamp");
    const body = await request.text();

    if (!signature || !timestamp) {
      return NextResponse.json(
        { error: "Missing signature headers" },
        { status: 401 },
      );
    }

    // Verify signature (simplified - in production use proper HMAC verification)
    const webhookSecret = process.env.SKRIBBLE_WEBHOOK_SECRET || "";
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(`${timestamp}.${body}`)
      .digest("hex");

    if (signature !== expectedSignature) {
      console.error("Invalid webhook signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    // Parse webhook payload
    const event = JSON.parse(body);

    // Handle different event types
    switch (event.event_type) {
      case "signature_request.signed":
        await eSignatureService.handleSkribbleWebhook(event);
        break;

      case "signature_request.declined":
        await eSignatureService.handleSkribbleWebhook({
          ...event,
          status: "declined",
        });
        break;

      case "signature_request.expired":
        await eSignatureService.handleSkribbleWebhook({
          ...event,
          status: "expired",
        });
        break;

      default:
        console.log("Unhandled webhook event type:", event.event_type);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 },
    );
  }
}
