import { NextResponse } from 'next/server';
import { ChatOpenAI } from '@langchain/openai';
import { BaseMessage, HumanMessage, AIMessage } from '@langchain/core/messages';
import OpenAI from 'openai';

// Agent角色定义
const AGENT_PERSONAS = {
  government: {
    name: 'Government Official',
    role: 'Government Official',
    color: 'blue-500',
    prompt: `You are a Singapore government official with a pragmatic approach. Key characteristics:
- Focus on policy feasibility, budget allocation, and regulatory compliance
- Emphasize risk assessment and long-term sustainability
- Use formal, professional language with careful consideration
- Challenge unrealistic proposals while offering practical alternatives
- Prioritize implementation feasibility and societal impact
- Consider Singapore's multi-racial society and economic competitiveness
Reply limit: Keep responses between 30-60 words, be concise and impactful.`
  },
  ngo: {
    name: 'NGO Representative',
    role: 'NGO Representative', 
    color: 'green-500',
    prompt: `You are an NGO representative focused on social welfare and community issues. Key characteristics:
- Advocate for social equity and protection of vulnerable groups
- Promote sustainable development and environmental responsibility
- Use passionate, caring language with strong sense of social responsibility
- Support policies that benefit the community and oppose harmful proposals
- Provide grassroots perspectives and community-based solutions
- Consider Singapore's diverse communities and social cohesion
Reply limit: Keep responses between 30-60 words, embodying social responsibility and community care.`
  },
  citizen: {
    name: 'Citizen',
    role: 'Citizen',
    color: 'orange-500', 
    prompt: `You are an ordinary Singaporean citizen focused on practical daily life concerns. Key characteristics:
- Think from everyday life perspective and practical needs
- Focus on cost-effectiveness and convenience in daily living
- Use straightforward, down-to-earth language
- Question complex policies and support simple, practical solutions
- Prioritize family and personal well-being
- Consider impact on Singapore's cost of living and quality of life
Reply limit: Keep responses between 30-60 words, be direct and practical.`
  },
  student: {
    name: 'University Student',
    role: 'University Student',
    color: 'purple-500',
    prompt: `You are a young university student with innovative thinking. Key characteristics:
- Propose creative ideas and forward-thinking solutions
- Focus on technology applications and digital transformation
- Use energetic, contemporary language full of innovation
- Challenge traditional approaches and suggest novel solutions
- Analyze from long-term development and global perspective
- Consider Singapore's Smart Nation vision and future workforce needs
Reply limit: Keep responses between 30-60 words, be creative and forward-looking.`
  }
};

// 对话上下文
interface ConversationContext {
  topic: string;
  selectedChallenges?: string[];
  interpretation?: string;
}

// 初始化OpenAI客户端 - 支持流式输出
const llm = new ChatOpenAI({
  modelName: 'gpt-4o',
  temperature: 0.8,
  apiKey: process.env.OPENAI_API_KEY,
  configuration: {
    baseURL: 'https://yinli.one/v1',
    timeout: 60000, // 60秒超时
    maxRetries: 3   // 最大重试3次
  },
  streaming: true
});

// 备用OpenAI客户端 - 直接使用OpenAI SDK
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: 'https://yinli.one/v1',
  timeout: 60000,
  maxRetries: 3
});

// Agent回复生成函数 - 考虑其他Agent的观点
async function generateAgentResponse(
  agentId: string,
  context: ConversationContext,
  conversationHistory: BaseMessage[],
  userMessage: string,
  otherAgentsResponses: AIMessage[] = []
): Promise<string> {
  const persona = AGENT_PERSONAS[agentId as keyof typeof AGENT_PERSONAS];
  if (!persona) {
    throw new Error(`Unknown agent: ${agentId}`);
  }

  // 构建系统提示
  let systemPrompt = persona.prompt;
  
  // 添加上下文
  if (context.selectedChallenges?.length) {
    systemPrompt += `\n讨论话题：${context.selectedChallenges.join(', ')}`;
  }
  
  if (context.interpretation) {
    systemPrompt += `\n背景：${context.interpretation}`;
  }

  // 最近对话历史
  const recentMessages = conversationHistory.slice(-3);
  const historyText = recentMessages.map(msg => {
    if (msg instanceof HumanMessage) {
      return `用户：${msg.content}`;
    } else if (msg instanceof AIMessage) {
      return `${msg.name}：${msg.content}`;
    }
    return '';
  }).join('\n');

  // 其他Agent的观点
  const otherViewsText = otherAgentsResponses.map(msg => 
    `${msg.name}：${msg.content}`
  ).join('\n');

  const prompt = `${systemPrompt}

用户问题：${userMessage}

${historyText ? `对话历史：\n${historyText}\n` : ''}
${otherAgentsResponses.length > 0 ? `其他观点：\n${otherViewsText}\n` : ''}

请基于你的角色身份简洁回应（40-100字），直接回复内容，不要角色名称前缀。`;

  try {
    // 检查环境变量
    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY is not set');
      return `${persona.name}: API key not configured`;
    }

    console.log(`Calling OpenAI API for agent ${agentId}`);
    console.log(`Prompt length: ${prompt.length}`);
    
    // 使用OpenAI API生成回复
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content: '请简洁回应，40-100字' }
      ],
      temperature: 0.8,
      max_tokens: 150
    });

    const response = completion.choices[0]?.message?.content?.trim();
    console.log(`API response for ${agentId}:`, response);
    
    if (!response) {
      console.error(`Empty response from OpenAI for agent ${agentId}`);
      return `${persona.name}: Empty response from API`;
    }

    return response;
  } catch (error) {
    console.error(`Agent ${agentId} error:`, error);
    console.error(`Error details:`, {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return `${persona.name}: API error - ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
}

// 流式响应处理
function createStreamResponse(agentResponses: { agentId: string; content: string }[]) {
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for (const response of agentResponses) {
          const persona = AGENT_PERSONAS[response.agentId as keyof typeof AGENT_PERSONAS];
          
          // 发送Agent信息
          const agentInfo = {
            type: 'agent_start',
            agentId: response.agentId,
            name: persona.name,
            color: persona.color
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(agentInfo)}\n\n`));
          
          // 逐字发送内容
          for (let i = 0; i < response.content.length; i++) {
            const char = response.content[i];
            const chunk = {
              type: 'content',
              agentId: response.agentId,
              content: char
            };
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`));
            
            // 模拟打字延迟
            await new Promise(resolve => setTimeout(resolve, 50));
          }
          
          // 发送完成信号
          const endSignal = {
            type: 'agent_end',
            agentId: response.agentId
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(endSignal)}\n\n`));
          
          // Agent间停顿
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        // 发送结束信号
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`));
        controller.close();
      } catch (error) {
        console.error('Stream error:', error);
        controller.error(error);
      }
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      message, 
      selectedAgents, 
      context, 
      conversationHistory = [] 
    } = body;

    if (!selectedAgents || selectedAgents.length === 0) {
      return NextResponse.json(
        { error: '请至少选择一个讨论参与者' },
        { status: 400 }
      );
    }

    // 构建对话历史
    const messages: BaseMessage[] = conversationHistory.map((msg: any) => 
      msg.role === 'user' 
        ? new HumanMessage(msg.content)
        : new AIMessage({ content: msg.content, name: msg.name || 'AI' })
    );

    // 生成Agent回复 - 顺序生成以便互相参考
    const agentResponses: { agentId: string; content: string }[] = [];
    const aiMessages: AIMessage[] = [];
    
    for (const agentId of selectedAgents) {
      if (AGENT_PERSONAS[agentId as keyof typeof AGENT_PERSONAS]) {
        try {
          const content = await generateAgentResponse(
            agentId,
            context || {},
            messages,
            message,
            aiMessages // 传入之前Agent的回复
          );
          
          agentResponses.push({ agentId, content });
          
          // 添加到AI消息列表，供后续Agent参考
          const aiMessage = new AIMessage({
            content,
            name: AGENT_PERSONAS[agentId as keyof typeof AGENT_PERSONAS].name
          });
          aiMessages.push(aiMessage);
          
        } catch (error) {
          console.error(`Error generating response for agent ${agentId}:`, error);
          const errorContent = `暂时无法参与讨论`;
          agentResponses.push({ agentId, content: errorContent });
        }
      }
    }
    
    // 返回流式响应
    return createStreamResponse(agentResponses);

  } catch (error) {
    console.error('Multi-agent chat error:', error);
    return NextResponse.json(
      { error: '多角色对话服务暂时不可用，请稍后重试' },
      { status: 500 }
    );
  }
}