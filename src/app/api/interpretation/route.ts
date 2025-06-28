import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: 'https://api.gptplus5.com/v1'
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { futureSignal, prototypingCard, localChallenge } = body;

    if (!futureSignal || !prototypingCard || !localChallenge) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const prompt = `
    基于以下三个要素，生成一个解释性的句子：

    A. 未来信号：${futureSignal.title}
    B. 原型构想：${prototypingCard}
    C. 本地挑战：${localChallenge.title}

    请使用以下句式生成一个完整的解释：
    在未来，[A] 会 [B]，因为 [C]。

    要求：
    1. 保持语言流畅自然
    2. 确保逻辑关系清晰
    3. 体现因果关联
    4. 要求使用英文
    `;

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-4",
      temperature: 0.7,
      max_tokens: 300,
    });

    return NextResponse.json({ 
      interpretation: completion.choices[0].message.content 
    });

  } catch (error) {
    console.error('Error in generate-interpretation:', error);
    return NextResponse.json(
      { error: 'Failed to generate interpretation' },
      { status: 500 }
    );
  }
}