import { NextResponse } from 'next/server';
import { generateText } from 'ai';
import { google } from '@ai-sdk/google';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('photo') as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No photo uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();

    // Perform Multimodal Detection using Gemini instead of GCP Vision
    // This allows dynamic analysis using the existing GOOGLE_GENERATIVE_AI_API_KEY
    const { text } = await generateText({
      model: google('gemini-1.5-flash'),
      messages: [
        {
          role: 'user',
          content: [
            { type: 'image', image: bytes },
            { type: 'text', text: `Analyze this image strictly for an Urban Heat Island dashboard. 
Respond ONLY with a valid JSON exactly like this, no explanation:
{"labels": ["keyword1", "keyword2", "keyword3"], "isSafe": true, "heatRiskEstimate": 6.5}` }
          ],
        },
      ],
    });

    try {
      const cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
      const parsed = JSON.parse(cleaned);

      return NextResponse.json({
        success: true,
        labels: parsed.labels || ['Urban', 'Environment'],
        isSafe: parsed.isSafe !== undefined ? parsed.isSafe : true,
        heatRiskEstimate: parsed.heatRiskEstimate || 5.0
      });
    } catch (parseError) {
      throw new Error("Failed to parse Gemini output");
    }

  } catch (error) {
    console.error('Gemini Vision error:', error);
    return NextResponse.json({
      success: true,
      warning: 'Fallback executed - Image too complex',
      labels: ['Fallback', 'Uncertain'],
      isSafe: true,
      heatRiskEstimate: 5.0
    });
  }
}
