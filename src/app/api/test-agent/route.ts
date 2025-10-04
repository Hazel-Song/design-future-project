import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: 'https://yinli.one/v1',
  timeout: 60000,
  maxRetries: 3
});

export async function POST(req: Request) {
  try {
    const { agentId, message } = await req.json();

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        error: 'API key not configured',
        agentId,
        message
      }, { status: 500 });
    }

    const simplePrompt = `You are a ${agentId} role. User asks: "${message}". Please respond in 40-100 words as this role.`;

    console.log(`Testing API call for ${agentId} with prompt:`, simplePrompt);

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: simplePrompt },
        { role: 'user', content: '请简洁回应' }
      ],
      temperature: 0.8,
      max_tokens: 150
    });

    const response = completion.choices[0]?.message?.content?.trim();

    return NextResponse.json({
      success: true,
      agentId,
      message,
      response,
      promptLength: simplePrompt.length
    });

  } catch (error) {
    console.error('Test agent API error:', error);
    return NextResponse.json({
      error: 'API call failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      agentId,
      message
    }, { status: 500 });
  }
}
