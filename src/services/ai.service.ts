export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export interface AIResponse {
  success: boolean;
  message: string;
  suggestions?: string[];
}

class AIService {
  private apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  private baseUrl = 'https://api.openai.com/v1/chat/completions';

  async sendMessage(message: string, conversationHistory: ChatMessage[] = []): Promise<AIResponse> {
    try {
      if (!this.apiKey) {
        return {
          success: false,
          message: '抱歉，AI服务暂时不可用。请稍后再试。'
        };
      }

      // 构建对话上下文
      const messages = [
        {
          role: 'system',
          content: `你是LumaTrip的智能旅行助手，一个专门为用户提供旅行建议和规划的AI。你的特点：
          
          1. 友好、热情，充满旅行热情
          2. 提供实用的旅行建议、景点推荐、行程规划
          3. 了解全球各地的文化、美食、景点
          4. 可以帮助用户制定预算、选择住宿、规划路线
          5. 回答要简洁明了，充满正能量
          6. 适当使用emoji让对话更生动
          7. 如果涉及具体预订，建议用户使用LumaTrip的相关功能
          
          请用中文回复，语调要友好自然。`
        },
        ...conversationHistory.slice(-6).map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.content
        })),
        {
          role: 'user',
          content: message
        }
      ];

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages,
          max_tokens: 500,
          temperature: 0.7,
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error(`API请求失败: ${response.status}`);
      }

      const data = await response.json();
      const aiMessage = data.choices[0]?.message?.content;

      if (!aiMessage) {
        throw new Error('AI响应格式错误');
      }

      // 生成相关建议
      const suggestions = this.generateSuggestions(message, aiMessage);

      return {
        success: true,
        message: aiMessage.trim(),
        suggestions
      };

    } catch (error) {
      console.error('AI Service Error:', error);
      
      // 提供备用响应
      return this.getFallbackResponse(message);
    }
  }

  private generateSuggestions(userMessage: string, _aiResponse: string): string[] {
    const suggestions = [];
    
    // 基于用户消息内容生成建议
    if (userMessage.includes('旅行') || userMessage.includes('出行')) {
      suggestions.push('帮我规划3天行程', '推荐当地美食', '查看热门景点');
    } else if (userMessage.includes('预算') || userMessage.includes('费用')) {
      suggestions.push('制定旅行预算', '找便宜住宿', '省钱旅行技巧');
    } else if (userMessage.includes('景点') || userMessage.includes('地方')) {
      suggestions.push('更多景点推荐', '交通方式', '最佳游览时间');
    } else {
      suggestions.push('推荐旅行目的地', '制定行程计划', '分享旅行经验');
    }
    
    return suggestions.slice(0, 3);
  }

  private getFallbackResponse(message: string): AIResponse {
    const fallbackResponses = [
      {
        trigger: ['你好', '您好', 'hi', 'hello'],
        response: '您好！👋 我是LumaTrip的智能旅行助手，很高兴为您服务！我可以帮您规划行程、推荐景点、制定预算，有什么旅行问题尽管问我吧！✈️',
        suggestions: ['推荐热门目的地', '制定旅行计划', '查看旅行攻略']
      },
      {
        trigger: ['旅行', '出行', '旅游'],
        response: '太棒了！🌟 旅行是探索世界的最好方式。告诉我您想去哪里，或者您的旅行偏好，我来为您推荐最适合的目的地和行程安排！',
        suggestions: ['热门城市推荐', '制定行程规划', '旅行预算建议']
      },
      {
        trigger: ['推荐', '建议'],
        response: '我很乐意为您推荐！🎯 请告诉我您的具体需求，比如想去的地区、旅行时间、预算范围或者感兴趣的活动类型，这样我就能给您最合适的建议了！',
        suggestions: ['景点推荐', '美食推荐', '住宿建议']
      }
    ];

    // 找到匹配的回复
    for (const fallback of fallbackResponses) {
      if (fallback.trigger.some(trigger => message.toLowerCase().includes(trigger))) {
        return {
          success: true,
          message: fallback.response,
          suggestions: fallback.suggestions
        };
      }
    }

    // 默认回复
    return {
      success: true,
      message: '感谢您的提问！🤔 虽然我现在暂时无法给出完美的回答，但我正在努力学习中。您可以尝试问我关于旅行规划、景点推荐或者行程安排的问题，我会尽力帮助您！',
      suggestions: ['旅行规划帮助', '景点推荐', '行程安排']
    };
  }

  async getQuickSuggestions(): Promise<string[]> {
    return [
      '推荐一个适合周末的旅行目的地',
      '制定一个3天2夜的城市旅行计划',
      '推荐一些必尝的当地美食',
      '帮我规划一个经济实惠的旅行',
      '推荐适合拍照的网红景点',
      '制定一个亲子旅行计划'
    ];
  }
}

export const aiService = new AIService(); 