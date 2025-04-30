import OpenAI from 'openai';
import { NextResponse } from 'next/server';
import type { ChatCompletionMessageParam } from 'openai/resources';

// 创建OpenAI客户端实例
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  console.log('API路由被调用');
  
  try {
    // 检查API密钥
    if (!process.env.OPENAI_API_KEY) {
      console.error('API密钥未设置');
      return new NextResponse(
        JSON.stringify({ error: 'OpenAI API密钥未配置' }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // 解析请求体
    let body;
    try {
      body = await request.json();
      console.log('请求体:', body);
    } catch (e) {
      console.error('请求体解析失败:', e);
      return new NextResponse(
        JSON.stringify({ error: '无效的请求数据' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const { message, selectedChallenge } = body;

    if (!message) {
      console.error('消息内容为空');
      return new NextResponse(
        JSON.stringify({ error: '消息内容不能为空' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('准备发送到OpenAI的数据');

    const messages: ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: `你是一个专业的AI助手，专门帮助用户探索日本会津地区的地方挑战。
        当前正在讨论的命题是：${selectedChallenge ? JSON.stringify(selectedChallenge) : '未选择命题'}

        请根据这个命题，为用户提供专业、有见地的回答。回答时：
        1. 考虑会津地区的特点和背景
        2. 提供具体的建议和见解
        3. 鼓励用户深入思考
        4. 保持友好和专业的对话风格`
      },
      {
        role: "user",
        content: message
      }
    ];

    console.log('调用OpenAI API');
    
    try {
      console.log('开始调用OpenAI API，配置:', {
        model: "gpt-4o",
        temperature: 0.7,
        max_tokens: 1000,
        messages: messages
      });
      
      // 添加重试逻辑
      let retries = 3;
      let lastError;
      
      while (retries > 0) {
        try {
          const completion = await openai.chat.completions.create({
            messages,
            model: "gpt-4o",
            temperature: 0.7,
            max_tokens: 1000
          });

          console.log('OpenAI响应成功:', completion);

          return new NextResponse(
            JSON.stringify({ reply: completion.choices[0].message.content }),
            { 
              status: 200,
              headers: { 'Content-Type': 'application/json' }
            }
          );
        } catch (error: any) {
          lastError = error;
          console.error(`OpenAI API调用失败，剩余重试次数: ${retries - 1}`, {
            error: error.message,
            code: error.code,
            type: error.type
          });
          
          if (retries > 1) {
            // 等待一段时间后重试
            await new Promise(resolve => setTimeout(resolve, 1000 * (4 - retries)));
          }
          retries--;
        }
      }
      
      // 所有重试都失败后抛出最后一个错误
      throw lastError;
      
    } catch (openaiError: any) {
      console.error('OpenAI API调用最终失败，详细错误:', {
        error: openaiError,
        message: openaiError?.message,
        status: openaiError?.status,
        response: openaiError?.response,
        code: openaiError?.code,
        type: openaiError?.type
      });
      
      return new NextResponse(
        JSON.stringify({ 
          error: 'AI服务暂时不可用，请稍后重试',
          details: openaiError?.message || '未知错误'
        }),
        { 
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

  } catch (error) {
    console.error('整体错误:', error);
    return new NextResponse(
      JSON.stringify({ error: '服务器内部错误' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
} 