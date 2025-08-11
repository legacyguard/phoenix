import React from "react";
import { NextResponse } from "next/server";

export async function generatePDF(req) {
  try {
    const { willContent } = await req.json();
    const doc = new jsPDF();

    // Just a sample - Customize as needed
    doc.text(willContent, 10, 10);
    const pdfOutput = doc.output();

    return NextResponse.json({ pdf: pdfOutput });
  } catch (error) {
    console.error("PDF Generation Error:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF", detail: error },
      { status: 500 },
    );
  }
}
