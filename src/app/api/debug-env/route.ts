import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // 检查环境变量
    const hasApiKey = !!process.env.OPENAI_API_KEY;
    const apiKeyLength = process.env.OPENAI_API_KEY?.length || 0;
    const apiKeyPrefix = process.env.OPENAI_API_KEY?.substring(0, 8) || 'N/A';
    
    return NextResponse.json({
      status: 'success',
      environment: process.env.NODE_ENV,
      openaiApiKey: {
        exists: hasApiKey,
        length: apiKeyLength,
        prefix: apiKeyPrefix,
        configured: hasApiKey && apiKeyLength > 0
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: 'Failed to check environment variables',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
