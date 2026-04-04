import { NextResponse } from 'next/server';
import { generateText } from 'ai';
import { google } from '@ai-sdk/google';

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('photo') as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No photo uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString('base64');
    const mimeType = (file.type || 'image/jpeg') as 'image/jpeg' | 'image/png' | 'image/webp';

    const { text } = await generateText({
      model: google('gemini-1.5-flash'),
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              image: bytes,
            },
            {
              type: 'text',
              text: `You are an urban heat island analyst for Nagpur city. Analyze this street/field photo and:
1. Estimate a HEAT SCORE from 1-10 (10 = extremely hot/dangerous)
2. Identify heat indicators (asphalt, lack of shade, traffic, reflective surfaces, etc.)
3. Give 2 specific mitigation actions.

Respond ONLY in this exact JSON format (no markdown, no backticks):
{"heat_score": 7, "indicators": ["heavy traffic", "no tree cover", "exposed asphalt"], "actions": ["Plant trees along road", "Install reflective road markings"], "summary": "High heat zone due to..."}`,
            },
          ],
        },
      ],
    });

    // Parse the JSON response
    let parsed;
    try {
      // Clean up any markdown code fences if present
      const cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
      parsed = JSON.parse(cleaned);
    } catch {
      // Fallback: extract heat score via regex
      const match = text.match(/heat_score["\s:]+(\d+)/i);
      parsed = {
        heat_score: match ? parseInt(match[1]) : 6,
        indicators: ['Unable to parse full analysis'],
        actions: ['Review manually'],
        summary: text.slice(0, 300),
      };
    }

    return NextResponse.json({ success: true, ...parsed });
  } catch (error) {
    console.error('Photo analysis error:', error);
    return NextResponse.json({ success: false, error: 'Analysis failed' }, { status: 500 });
  }
}
