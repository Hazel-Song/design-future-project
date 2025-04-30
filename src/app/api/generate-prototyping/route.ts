import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// 初始化 OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// 确保这里使用 POST 方法
export async function POST(req: Request) {
  try {
    // 解析请求数据
    const body = await req.json();
    const { futureSignal, localChallenge } = body;

    // 验证输入
    if (!futureSignal || !localChallenge) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // 构建 prompt
    const prompt = `
    基于以下未来信号和本地挑战，生成一个创新的原型构想：

    未来信号：
    标题：${futureSignal.title}
    描述：${futureSignal.description}

    本地挑战：
    标题：${localChallenge.title}
    描述：${localChallenge.description}

    请提供一个具体的原型构想，说明如何将这个未来信号应用于解决本地挑战。
    要求：
    1. 提供具体可行的解决方案
    2. 考虑本地实际情况
    3. 包含创新元素
    4. 描述清晰简洁（200字以内）
    5. 要求使用英文
    `;

    // 调用 OpenAI API
    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-4o",
      temperature: 0.7,
      max_tokens: 500,
    });

    // 获取生成的内容
    const prototypingCard = completion.choices[0].message.content;

    // 返回响应
    return NextResponse.json({ prototypingCard });

  } catch (error) {
    console.error('Error in generate-prototyping:', error);
    return NextResponse.json(
      { error: 'Failed to generate prototyping' },
      { status: 500 }
    );
  }
}
