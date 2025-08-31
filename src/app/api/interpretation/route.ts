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

    console.log('Received request body:', { futureSignal, prototypingCard, localChallenge });

    if (!futureSignal || !prototypingCard || !localChallenge) {
      console.log('Missing required fields');
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // 处理allChallenges字段（如果存在）
    const challengeTitle = localChallenge.allChallenges || localChallenge.title;

    const prompt = `
    基于以下三个要素，生成一个解释性的句子：

    A. 未来信号：${futureSignal.title}
    B. 原型构想：${prototypingCard}
    C. 本地挑战：${challengeTitle}

    请使用以下句式生成一个完整的解释：
    在未来，[A] 会 [B]，因为 [C]。

    要求：
    1. 保持语言流畅自然
    2. 确保逻辑关系清晰
    3. 体现因果关联
    4. 要求使用英文
    `;

    console.log('Sending prompt to OpenAI:', prompt);

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-4o",
      temperature: 0.7,
      max_tokens: 300,
    });

    const interpretation = completion.choices[0].message.content;
    console.log('OpenAI response:', interpretation);

    return NextResponse.json({ 
      interpretation: interpretation 
    });

  } catch (error) {
    console.error('Error in generate-interpretation:', error);
    
    // 更详细的错误信息
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    return NextResponse.json(
      { error: 'Failed to generate interpretation', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}