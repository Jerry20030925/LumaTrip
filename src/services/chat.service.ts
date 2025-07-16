import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

// 模拟AI响应
const mockResponses = [
  "这是一个很有趣的问题！作为LumaTrip的AI助手，我很乐意帮助您规划旅行。",
  "感谢您的提问！我可以为您提供旅行建议、景点推荐和行程规划。",
  "很高兴为您服务！请告诉我您想去哪里旅行，我会为您推荐最佳路线。",
  "作为您的旅行助手，我建议您可以考虑一些热门目的地，比如日本、泰国或者欧洲。",
  "这听起来很棒！我可以帮您查找相关的旅行信息和当地特色。",
  "根据您的需求，我推荐您可以尝试一些当地的特色美食和文化体验。",
  "旅行是一件美好的事情！让我为您提供一些实用的旅行建议。"
];

const getRandomResponse = (message: string): string => {
  // 根据关键词提供更智能的回复
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('你好') || lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
    return "你好！我是LumaTrip的AI旅行助手，很高兴为您服务！我可以帮您规划旅行路线、推荐景点、查找美食等。请告诉我您想了解什么？";
  }
  
  if (lowerMessage.includes('旅行') || lowerMessage.includes('旅游') || lowerMessage.includes('travel')) {
    return "太棒了！我最喜欢帮助大家规划旅行了。请告诉我您想去哪个城市或国家？我可以为您推荐最佳的旅行时间、必去景点和当地美食。";
  }
  
  if (lowerMessage.includes('推荐') || lowerMessage.includes('建议')) {
    return "我很乐意为您提供推荐！请告诉我您的兴趣爱好、预算范围和旅行时间，我会为您量身定制最适合的旅行方案。";
  }
  
  if (lowerMessage.includes('美食') || lowerMessage.includes('吃') || lowerMessage.includes('food')) {
    return "说到美食，我的数据库里有世界各地的特色料理！无论是日式拉面、意大利披萨还是泰式咖喱，我都能为您推荐最正宗的餐厅。";
  }
  
  if (lowerMessage.includes('景点') || lowerMessage.includes('地方') || lowerMessage.includes('places')) {
    return "我知道很多令人惊叹的景点！从历史古迹到自然风光，从繁华都市到宁静小镇，告诉我您喜欢什么类型的地方，我来为您推荐。";
  }
  
  // 默认随机回复
  const randomIndex = Math.floor(Math.random() * mockResponses.length);
  return mockResponses[randomIndex];
};

export const getChatCompletion = async (message: string): Promise<string> => {
  try {
    // 检查是否有有效的API Key
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!apiKey || apiKey === 'YOUR_OPENAI_API_KEY_HERE') {
      // 使用模拟响应
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000)); // 模拟网络延迟
      return getRandomResponse(message);
    }

    // 尝试使用真实的OpenAI API
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: '你是LumaTrip的AI旅行助手，专门帮助用户规划旅行、推荐景点、美食和住宿。请用友好、专业的语气回答用户的问题。'
        },
        { role: 'user', content: message }
      ],
      model: 'gpt-3.5-turbo',
      max_tokens: 500,
      temperature: 0.7,
    });

    return completion.choices[0].message.content || '抱歉，我现在无法回答您的问题。';
  } catch (error) {
    console.error('Error getting chat completion:', error);
    // 如果API调用失败，回退到模拟响应
    await new Promise(resolve => setTimeout(resolve, 1000));
    return getRandomResponse(message);
  }
};