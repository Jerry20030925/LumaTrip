import React, { Component } from 'react';
import type { ReactNode } from 'react';
import { Button, Container, Text, Title, Stack, Alert, Code, Box } from '@mantine/core';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  eventId: string | null;
}

class EnhancedErrorBoundary extends Component<Props, State> {
  private retryCount = 0;
  private maxRetries = 3;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // 记录错误信息
    this.logError(error, errorInfo);

    // 调用外部错误处理函数
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  private logError = (error: Error, errorInfo: React.ErrorInfo) => {
    const errorDetails = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: this.getUserId(),
      retryCount: this.retryCount
    };

    // 发送到错误监控服务（如 Sentry）
    if (typeof window !== 'undefined' && window.Sentry) {
      const eventId = window.Sentry.captureException(error, {
        contexts: {
          react: {
            componentStack: errorInfo.componentStack
          }
        },
        extra: errorDetails
      });
      this.setState({ eventId });
    }

    // 开发环境下在控制台详细输出
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 React Error Boundary');
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.error('Error Details:', errorDetails);
      console.groupEnd();
    }

    // 生产环境下发送到日志服务
    if (process.env.NODE_ENV === 'production') {
      this.sendErrorToLogging(errorDetails);
    }
  };

  private getUserId = (): string | null => {
    try {
      // 尝试从认证状态获取用户ID
      const authData = localStorage.getItem('lumatrip-auth');
      if (authData) {
        const { state } = JSON.parse(authData);
        return state?.user?.id || null;
      }
    } catch {
      // 忽略错误
    }
    return null;
  };

  private sendErrorToLogging = async (errorDetails: any) => {
    try {
      // 这里可以发送到您的日志服务
      await fetch('/api/log-error', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(errorDetails)
      });
    } catch (loggingError) {
      console.error('Failed to send error to logging service:', loggingError);
    }
  };

  private handleRetry = () => {
    if (this.retryCount < this.maxRetries) {
      this.retryCount++;
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        eventId: null
      });
    }
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private handleReportBug = () => {
    const { error, errorInfo, eventId } = this.state;
    const subject = encodeURIComponent(`Bug Report: ${error?.message || 'Unknown Error'}`);
    const body = encodeURIComponent(`
错误详情:
- 错误信息: ${error?.message || 'Unknown'}
- 时间: ${new Date().toLocaleString()}
- 页面: ${window.location.href}
- 事件ID: ${eventId || 'N/A'}
- 浏览器: ${navigator.userAgent}

请描述您当时在做什么操作：


组件堆栈:
${errorInfo?.componentStack || 'N/A'}
    `.trim());

    window.open(`mailto:support@lumatrip.com?subject=${subject}&body=${body}`);
  };

  render() {
    if (this.state.hasError) {
      // 如果提供了自定义 fallback，使用它
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { error } = this.state;
      const canRetry = this.retryCount < this.maxRetries;

      return (
        <Container size="md" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
          <Stack align="center" gap="xl">
            <Box style={{ textAlign: 'center' }}>
              <AlertTriangle size={64} color="#e03131" />
            </Box>

            <Title order={1} size="h2" style={{ textAlign: 'center' }}>
              哎呀！出现了错误
            </Title>

            <Text size="lg" c="dimmed" style={{ textAlign: 'center', maxWidth: 500 }}>
              我们遇到了意外问题。不用担心，我们已经记录了这个错误，团队会尽快修复。
            </Text>

            {process.env.NODE_ENV === 'development' && error && (
              <Alert 
                variant="light" 
                color="red" 
                title="开发环境错误信息"
                icon={<Bug size={16} />}
                style={{ width: '100%', maxWidth: 600 }}
              >
                <Stack gap="sm">
                  <Text size="sm" fw={500}>错误消息:</Text>
                  <Code block color="red">
                    {error.message}
                  </Code>
                  {error.stack && (
                    <>
                      <Text size="sm" fw={500}>堆栈跟踪:</Text>
                      <Code block color="red" style={{ fontSize: '11px', maxHeight: 200, overflow: 'auto' }}>
                        {error.stack}
                      </Code>
                    </>
                  )}
                </Stack>
              </Alert>
            )}

            <Stack gap="md" style={{ width: '100%', maxWidth: 400 }}>
              {canRetry && (
                <Button
                  size="lg"
                  leftSection={<RefreshCw size={20} />}
                  onClick={this.handleRetry}
                  variant="filled"
                  fullWidth
                >
                  重试 ({this.maxRetries - this.retryCount} 次机会剩余)
                </Button>
              )}

              <Button
                size="lg"
                leftSection={<Home size={20} />}
                onClick={this.handleGoHome}
                variant="light"
                fullWidth
              >
                返回首页
              </Button>

              <Button
                size="lg"
                leftSection={<RefreshCw size={20} />}
                onClick={this.handleReload}
                variant="outline"
                fullWidth
              >
                刷新页面
              </Button>

              <Button
                size="sm"
                leftSection={<Bug size={16} />}
                onClick={this.handleReportBug}
                variant="subtle"
                fullWidth
              >
                报告问题
              </Button>
            </Stack>

            {this.state.eventId && (
              <Text size="xs" c="dimmed" style={{ textAlign: 'center' }}>
                错误ID: {this.state.eventId}
              </Text>
            )}
          </Stack>
        </Container>
      );
    }

    return this.props.children;
  }
}

// 类型声明扩展
declare global {
  interface Window {
    Sentry?: {
      captureException: (error: Error, options?: any) => string;
    };
  }
}

export default EnhancedErrorBoundary; 