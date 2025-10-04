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
    // 暂时使用fallback响应，避免API超时问题
    console.log(`Using fallback response for agent ${agentId}`);
    
    // 根据角色返回不同的fallback响应 - 随机选择
    const fallbackResponses = {
      government: [
        "作为政府官员，我理解在文化多样性与国家统一之间保持平衡的复杂性。我们需要基于证据的政策，在尊重多元文化传统的同时促进社会凝聚力。",
        "从政策角度，我们必须确保所有倡议都符合现有法规，并考虑长期财政可持续性。社会凝聚力需要系统性的方法，而不是临时解决方案。",
        "政府需要平衡不同社区的需求与整体国家利益。我们支持促进跨文化理解的项目，但必须确保资源的有效分配和政策的可执行性。",
        "作为政策制定者，我们关注社会凝聚力的量化指标和长期影响。任何倡议都必须经过严格的评估，确保符合新加坡的核心价值观。",
        "政府必须考虑多元文化社会的复杂性。我们支持社区主导的倡议，但需要确保它们与国家的整体发展战略保持一致。",
        "从治理角度，我们需要建立可持续的框架来支持文化多样性。这包括适当的监管机制和资源分配策略。",
        "政府致力于创造包容性的社会环境。我们支持促进跨文化对话的项目，同时确保所有倡议都符合法律和社会规范。",
        "作为公共管理者，我们必须平衡不同利益相关者的需求。社会凝聚力项目需要经过全面的影响评估和利益相关者咨询。",
        "政府关注社会政策的长期可持续性。我们支持基于证据的倡议，确保它们能够产生可衡量的积极社会影响。",
        "从国家层面，我们需要确保所有文化群体都有平等的机会参与社会发展。这需要系统性的政策支持和资源投入。",
        "政府必须考虑社会凝聚力对经济竞争力的影响。我们支持促进文化理解的倡议，同时确保它们有助于国家的发展目标。",
        "作为政策制定者，我们重视社区反馈和参与。社会凝聚力需要政府、社区和公民社会的共同努力。"
      ],
      ngo: [
        "从NGO的角度来看，我们必须优先考虑基于社区的解决方案，让所有文化群体都能参与。社会凝聚力来自于庆祝多样性同时建立共同价值观的基层倡议。",
        "我们NGO致力于保护弱势群体的权益。社会凝聚力不能以牺牲任何群体的利益为代价。我们需要确保所有倡议都真正包容和公平。",
        "作为社区倡导者，我们相信草根行动的力量。真正的社会凝聚力来自于基层的相互理解和尊重，而不是自上而下的政策。",
        "NGO关注社会正义和公平。我们支持促进文化理解的倡议，但必须确保它们不会加剧现有的社会不平等。",
        "我们致力于为所有社区成员创造平等的机会。社会凝聚力需要积极的反歧视措施和包容性政策。",
        "从社会工作的角度，我们关注社区的实际需求。社会凝聚力项目必须基于深入的社区参与和需求评估。",
        "NGO强调社区赋权的重要性。我们支持由社区主导的倡议，确保它们反映当地居民的真实愿望和需求。",
        "我们致力于促进社会包容和多样性。社会凝聚力需要积极的工作来消除偏见和歧视，创造真正包容的环境。",
        "作为社区组织，我们相信对话和理解的力量。我们支持促进跨文化交流的项目，帮助不同群体建立相互信任。",
        "NGO关注社会变革的长期影响。我们支持可持续的社会凝聚力倡议，确保它们能够产生持久的积极变化。",
        "我们致力于创造社会资本。社会凝聚力需要投资于社区关系和网络建设，促进不同群体之间的合作。",
        "从倡导的角度，我们支持促进文化多样性的政策。社会凝聚力需要承认和庆祝所有社区的文化贡献。"
      ],
      citizen: [
        "作为公民，我希望看到让每个人日常生活更好的实用解决方案。文化多样性很好，但我们也需要共同基础。像社区活动和共享空间这样简单的事情能帮助我们更好地理解彼此。",
        "我们普通老百姓最关心的是生活成本和质量。社会凝聚力很重要，但不能增加我们的经济负担。我们需要实惠且有效的解决方案。",
        "从日常生活的角度，我希望看到更多实际的活动和项目。理论很好，但我们需要能够参与的具体倡议，让不同背景的人真正互动。",
        "作为纳税人，我希望看到政府资金的有效使用。社会凝聚力项目必须产生实际效果，而不是浪费资源。",
        "我们老百姓需要简单易懂的解决方案。复杂的政策对我们来说太抽象，我们需要能够直接参与和体验的活动。",
        "从家庭的角度，我希望我的孩子能够在多元文化环境中成长。社会凝聚力需要从教育开始，让孩子们从小就学会尊重和理解。",
        "我们关心的是这些倡议如何影响我们的日常生活。社会凝聚力很好，但我们需要确保它不会带来不便或额外成本。",
        "作为社区成员，我希望看到更多邻里间的互动机会。社会凝聚力需要从本地开始，通过日常的交流和合作建立。",
        "我们普通人需要实用的工具和资源。社会凝聚力项目应该提供具体的指导和支持，帮助我们更好地理解和参与。",
        "从个人经验来看，真正的理解来自于直接接触。我们需要更多让不同背景的人面对面交流的机会。",
        "我们关心的是这些倡议的长期影响。社会凝聚力需要可持续的方法，确保它们能够持续产生积极效果。",
        "作为普通公民，我希望看到更多社区主导的倡议。社会凝聚力应该反映我们社区的真实需求和愿望。"
      ],
      student: [
        "从学生的角度来看，我们需要更多从年轻时代就教授文化欣赏的教育项目。技术可以帮助连接不同的社区。我们应该专注于由青年主导的倡议，促进跨文化的理解。",
        "我们年轻人有创新的想法和数字技能。社会凝聚力可以通过社交媒体、在线平台和数字工具来实现。让我们利用技术创造包容性的空间。",
        "作为未来的领导者，我们相信青年的力量。社会凝聚力需要青年的参与和领导，因为我们是社会变革的推动者。",
        "我们学生关注全球化的影响。社会凝聚力需要国际视野，学习其他国家的成功经验，同时保持我们的文化特色。",
        "从创新的角度，我们认为社会凝聚力需要新的方法。传统的解决方案可能不够，我们需要创造性的思维和实验性的项目。",
        "我们年轻人重视多样性和包容性。社会凝聚力必须反映我们这一代人的价值观，包括平等、正义和可持续发展。",
        "作为数字原住民，我们相信技术的力量。社会凝聚力可以通过数字平台、虚拟现实和人工智能等技术来增强。",
        "我们学生关注未来的挑战。社会凝聚力需要考虑气候变化、技术进步和社会变化等长期趋势。",
        "从学习的角度，我们认为教育是社会凝聚力的关键。我们需要更多的跨文化教育项目，帮助年轻人理解和欣赏多样性。",
        "我们年轻人有创业精神。社会凝聚力可以通过社会企业、创新项目和青年创业来实现。",
        "作为社交媒体用户，我们了解连接的力量。社会凝聚力需要利用数字工具和平台，创造虚拟和现实的社区空间。",
        "我们学生重视实践学习。社会凝聚力项目应该提供实际的经验和技能，帮助年轻人成为更好的社区成员。"
      ]
    };
    
    // 随机选择一个预设回答
    const agentResponses = fallbackResponses[agentId as keyof typeof fallbackResponses];
    if (agentResponses && Array.isArray(agentResponses)) {
      const randomIndex = Math.floor(Math.random() * agentResponses.length);
      return agentResponses[randomIndex];
    }
    
    return `${persona.name}: 暂时无法参与讨论`;
    
    // 原始API调用代码（暂时注释）
    /*
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content: 'Please respond strictly within 40-100 words, expressing concise and impactful views based on your role characteristics' }
      ],
      temperature: 0.8,
      max_tokens: 150
    });

    return completion.choices[0]?.message?.content?.trim() || `${persona.name}: Unable to respond at the moment`;
    */
  } catch (error) {
    console.error(`Agent ${agentId} error:`, error);
    return `${persona.name}: Unable to respond at the moment`;
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