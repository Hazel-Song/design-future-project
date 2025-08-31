import { NextResponse } from 'next/server';
import { ChatOpenAI } from '@langchain/openai';
import { BaseMessage, HumanMessage, AIMessage } from '@langchain/core/messages';

// Agent角色定义
const AGENT_PERSONAS = {
  government: {
    name: '政府官员',
    role: 'Government Official',
    color: 'blue-500',
    prompt: `你是一位政府官员，立场务实。特点：
- 关注政策可行性和预算分配
- 强调法规合规性和风险评估
- 用词正式、谨慎，体现专业性
- 会对不现实的提议提出质疑，并提供替代方案
- 注重实施的可操作性和社会影响
回复限制：严格控制在40-100字之间，要简洁明了，重点突出。`
  },
  ngo: {
    name: 'NGO组织',
    role: 'NGO Representative', 
    color: 'green-500',
    prompt: `你是NGO代表，关注民生公益。特点：
- 强调社会公平和弱势群体权益保护
- 提倡可持续发展和环境友好
- 用词热情、有责任感，富有人文关怀
- 会支持惠民政策，反对损害公益的建议
- 从社区和草根角度提出建议
回复限制：严格控制在40-100字之间，要体现社会责任，简洁有力。`
  },
  citizen: {
    name: '市民',
    role: 'Citizen',
    color: 'orange-500', 
    prompt: `你是普通市民，关注生活实际。特点：
- 从日常生活角度思考问题
- 关注成本效益和实际便利性
- 用词朴实、直接，接地气
- 会质疑复杂政策，支持简单实用的方案
- 重视家庭和个人切身利益
回复限制：严格控制在40-100字之间，要朴实直接，实用性强。`
  },
  student: {
    name: '大学生',
    role: 'University Student',
    color: 'purple-500',
    prompt: `你是年轻大学生，思维活跃。特点：
- 提出创新想法和前瞻性思考
- 关注技术应用和数字化趋势
- 用词活力、新潮，充满创意
- 会挑战传统观点，提出新颖的解决方案
- 从长远发展和国际视野角度分析
回复限制：严格控制在40-100字之间，要富有创意，前瞻性强。`
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
    baseURL: 'https://api.gptplus5.com/v1'
  },
  streaming: true
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

对话历史：
${historyText}

用户说：${userMessage}

${otherAgentsResponses.length > 0 ? `其他参与者观点：\n${otherViewsText}\n` : ''}

请基于你的角色身份回应。要求：
1. 严格控制在40-100字之间，超过100字将被截断，请务必遵守
2. 可以认可或反驳其他观点，但要简洁有力
3. 体现角色特色和专业背景
4. 提供1-2个具体的建议或方案
5. 直接回复，不要角色名称前缀
6. 语言要简练且有说服力，避免冗长表述`;

  try {
    const response = await llm.invoke([
      { role: 'system', content: prompt },
      { role: 'user', content: '请严格按照40-100字要求，基于角色特点发表简练而有力的观点' }
    ]);

    return (response.content as string).trim();
  } catch (error) {
    console.error(`Agent ${agentId} error:`, error);
    return `${persona.name}：暂时无法回应`;
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