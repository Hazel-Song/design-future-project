import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { interpretation, year, style } = body;

    if (!interpretation || !year || !style) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // 构建 prompt
    let stylePrompt = '';
    switch (style) {
      case 'positive':
        stylePrompt = 'bright, optimistic, and hopeful';
        break;
      case 'neutral':
        stylePrompt = 'balanced, factual, and objective';
        break;
      case 'negative':
        stylePrompt = 'critical, thought-provoking, and cautionary';
        break;
    }

    const prompt = `Create a realistic scene illustration for the year ${year} that visually represents this future scenario: "${interpretation}".
    
    Requirements:
    1. The scene should be ${stylePrompt} in tone and atmosphere
    2. Show a clear, understandable situation that represents the future scenario
    3. Include people or relevant objects in the scene to make it relatable
    4. Use appropriate lighting and composition to convey the ${stylePrompt} mood
    5. Make it look like a professional magazine cover or editorial illustration
    6. Avoid abstract or confusing elements
    7. Ensure the scene is culturally appropriate and respectful
    
    Focus on creating a single, clear scene that helps viewers understand the future scenario described.`;

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
      style: "vivid",
    });

    if (!response.data?.[0]?.url) {
      throw new Error('No image URL in response');
    }

    return NextResponse.json({ 
      imageUrl: response.data[0].url
    });

  } catch (error) {
    console.error('Error generating headline image:', error);
    return NextResponse.json(
      { error: 'Failed to generate image' },
      { status: 500 }
    );
  }
}