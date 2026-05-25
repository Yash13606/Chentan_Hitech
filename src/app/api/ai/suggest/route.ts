import { NextRequest, NextResponse } from "next/server";
import { generateEquipmentSuggestion } from "@/server/services/ai";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { prompt?: string };
    const prompt = body.prompt?.trim();

    if (!prompt || prompt.length < 10) {
      return NextResponse.json(
        { error: "Please describe your facility in more detail (at least 10 characters)." },
        { status: 400 }
      );
    }

    if (prompt.length > 500) {
      return NextResponse.json(
        { error: "Description too long. Please keep it under 500 characters." },
        { status: 400 }
      );
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      // Graceful degradation when key not configured
      return NextResponse.json({
        suggestion:
          "AI Assistant is not yet configured. Please contact our team directly or browse the Equipment Catalog to find the right products for your facility. You can also book a free consultation with our engineering team.",
      });
    }

    const suggestion = await generateEquipmentSuggestion(prompt);
    return NextResponse.json({ suggestion });
  } catch (error) {
    console.error("[AI Suggest] Error:", error);
    return NextResponse.json(
      {
        suggestion:
          "Unable to generate suggestions right now. Please browse our catalog or book a consultation.",
      },
      { status: 200 } // Return 200 so the frontend shows the fallback message
    );
  }
}
