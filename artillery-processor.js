const faker = require('faker');

// 自定义函数
module.exports = {
  // 生成随机用户数据
  generateUserData,
  // 生成随机帖子内容
  generatePostContent,
  // 生成随机消息内容
  generateMessageContent,
  // 验证响应数据
  validateResponse,
  // 记录自定义指标
  recordCustomMetrics,
  // 设置动态变量
  setDynamicVariables,
  // 处理认证流程
  handleAuth,
  // 处理文件上传
  handleFileUpload
};

// 生成随机用户数据
function generateUserData(requestParams, context, ee, next) {
  context.vars.email = faker.internet.email();
  context.vars.password = 'Test123456!';
  context.vars.username = faker.internet.userName();
  context.vars.firstName = faker.name.firstName();
  context.vars.lastName = faker.name.lastName();
  context.vars.bio = faker.lorem.sentence();
  context.vars.avatar = faker.image.avatar();
  
  return next();
}

// 生成随机帖子内容
function generatePostContent(requestParams, context, ee, next) {
  const contents = [
    '今天天气真不错！☀️',
    '分享一张美丽的风景照 📸',
    '刚刚吃了一顿美味的晚餐 🍽️',
    '和朋友们度过了愉快的一天 👫',
    '正在学习新的技能 📚',
    '感谢生活中的美好时光 ✨',
    '今天的心情特别好 😊',
    '推荐一个不错的地方给大家 📍'
  ];
  
  const locations = [
    '北京市朝阳区',
    '上海市浦东新区',
    '广州市天河区',
    '深圳市南山区',
    '杭州市西湖区',
    '成都市锦江区',
    '武汉市武昌区',
    '南京市鼓楼区'
  ];
  
  const tags = [
    ['旅行', '风景'],
    ['美食', '生活'],
    ['朋友', '聚会'],
    ['学习', '成长'],
    ['摄影', '艺术'],
    ['运动', '健康'],
    ['音乐', '娱乐'],
    ['工作', '职场']
  ];
  
  context.vars.postContent = faker.random.arrayElement(contents) + ' ' + faker.lorem.sentence();
  context.vars.postLocation = faker.random.arrayElement(locations);
  context.vars.postTags = faker.random.arrayElement(tags);
  context.vars.postId = faker.random.number({ min: 1, max: 10000 });
  
  return next();
}

// 生成随机消息内容
function generateMessageContent(requestParams, context, ee, next) {
  const messages = [
    '你好！',
    '最近怎么样？',
    '有空一起出去玩吗？',
    '谢谢你的分享！',
    '这个地方看起来不错',
    '我也想去试试',
    '拍得真好看！',
    '下次一起去吧'
  ];
  
  context.vars.messageContent = faker.random.arrayElement(messages);
  context.vars.receiverId = faker.random.number({ min: 1, max: 1000 });
  context.vars.messageType = faker.random.arrayElement(['text', 'image', 'emoji']);
  
  return next();
}

// 验证响应数据
function validateResponse(requestParams, response, context, ee, next) {
  if (response.statusCode === 200 || response.statusCode === 201) {
    // 记录成功指标
    ee.emit('counter', 'success_requests', 1);
    
    // 验证响应体
    try {
      const body = JSON.parse(response.body);
      
      // 验证登录响应
      if (requestParams.url.includes('/auth/login') && body.token) {
        context.vars.authToken = body.token;
        context.vars.userId = body.user?.id;
        ee.emit('counter', 'login_success', 1);
      }
      
      // 验证注册响应
      if (requestParams.url.includes('/auth/register') && body.user) {
        ee.emit('counter', 'register_success', 1);
      }
      
      // 验证帖子发布响应
      if (requestParams.url.includes('/posts') && requestParams.method === 'POST' && body.id) {
        context.vars.createdPostId = body.id;
        ee.emit('counter', 'post_creation_success', 1);
      }
      
      // 验证消息发送响应
      if (requestParams.url.includes('/messages') && requestParams.method === 'POST' && body.id) {
        ee.emit('counter', 'message_send_success', 1);
      }
      
    } catch (error) {
      console.error('响应解析错误:', error);
      ee.emit('counter', 'parse_errors', 1);
    }
  } else {
    // 记录错误指标
    ee.emit('counter', 'error_requests', 1);
    ee.emit('counter', `status_${response.statusCode}`, 1);
    
    // 记录具体错误类型
    if (requestParams.url.includes('/auth/login')) {
      ee.emit('counter', 'login_failures', 1);
    }
    
    if (requestParams.url.includes('/auth/register')) {
      ee.emit('counter', 'register_failures', 1);
    }
    
    if (requestParams.url.includes('/posts') && requestParams.method === 'POST') {
      ee.emit('counter', 'post_creation_failures', 1);
    }
  }
  
  return next();
}

// 记录自定义指标
function recordCustomMetrics(requestParams, response, context, ee, next) {
  const responseTime = response.timings?.end || 0;
  
  // 记录响应时间分布
  if (responseTime < 100) {
    ee.emit('counter', 'fast_responses', 1);
  } else if (responseTime < 500) {
    ee.emit('counter', 'medium_responses', 1);
  } else {
    ee.emit('counter', 'slow_responses', 1);
  }
  
  // 记录API端点指标
  const endpoint = requestParams.url.split('?')[0];
  ee.emit('histogram', `response_time_${endpoint.replace(/\//g, '_')}`, responseTime);
  
  // 记录用户行为指标
  if (context.vars.userId) {
    ee.emit('counter', 'authenticated_requests', 1);
  } else {
    ee.emit('counter', 'anonymous_requests', 1);
  }
  
  return next();
}

// 设置动态变量
function setDynamicVariables(requestParams, context, ee, next) {
  // 设置时间戳
  context.vars.timestamp = Date.now();
  context.vars.dateString = new Date().toISOString();
  
  // 设置随机ID
  context.vars.randomId = faker.random.uuid();
  context.vars.sessionId = faker.random.alphaNumeric(32);
  
  // 设置设备信息
  const userAgents = [
    'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15',
    'Mozilla/5.0 (Android 11; Mobile; rv:68.0) Gecko/68.0 Firefox/88.0',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
  ];
  
  context.vars.userAgent = faker.random.arrayElement(userAgents);
  
  return next();
}

// 处理认证流程
function handleAuth(requestParams, context, ee, next) {
  // 如果已有token，添加到请求头
  if (context.vars.authToken) {
    requestParams.headers = requestParams.headers || {};
    requestParams.headers['Authorization'] = `Bearer ${context.vars.authToken}`;
  }
  
  // 添加CSRF token
  if (context.vars.csrfToken) {
    requestParams.headers = requestParams.headers || {};
    requestParams.headers['X-CSRF-Token'] = context.vars.csrfToken;
  }
  
  return next();
}

// 处理文件上传
function handleFileUpload(requestParams, context, ee, next) {
  if (requestParams.url.includes('/upload')) {
    // 模拟文件数据
    const fileTypes = ['image/jpeg', 'image/png', 'image/gif'];
    const fileSizes = [1024, 2048, 4096, 8192]; // KB
    
    context.vars.fileType = faker.random.arrayElement(fileTypes);
    context.vars.fileSize = faker.random.arrayElement(fileSizes);
    context.vars.fileName = `test_${faker.random.alphaNumeric(8)}.jpg`;
    
    // 生成模拟文件内容
    context.vars.fileContent = Buffer.alloc(context.vars.fileSize * 1024, 'test data').toString('base64');
  }
  
  return next();
}

// 错误处理
function handleError(error, requestParams, context, ee, next) {
  console.error('请求错误:', {
    url: requestParams.url,
    method: requestParams.method,
    error: error.message,
    timestamp: new Date().toISOString()
  });
  
  ee.emit('counter', 'request_errors', 1);
  
  return next();
}

// 性能监控
function monitorPerformance(requestParams, response, context, ee, next) {
  const responseTime = response.timings?.end || 0;
  const contentLength = response.headers['content-length'] || 0;
  
  // 监控慢查询
  if (responseTime > 1000) {
    console.warn('慢查询检测:', {
      url: requestParams.url,
      responseTime: responseTime,
      timestamp: new Date().toISOString()
    });
    ee.emit('counter', 'slow_queries', 1);
  }
  
  // 监控大响应
  if (contentLength > 1024 * 1024) { // 1MB
    console.warn('大响应检测:', {
      url: requestParams.url,
      contentLength: contentLength,
      timestamp: new Date().toISOString()
    });
    ee.emit('counter', 'large_responses', 1);
  }
  
  return next();
}

// 数据清理
function cleanup(context, ee, next) {
  // 清理敏感数据
  delete context.vars.password;
  delete context.vars.authToken;
  delete context.vars.csrfToken;
  
  return next();
}