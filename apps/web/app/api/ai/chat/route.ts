import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { message, context } = await request.json();
    
    // Get the auth token
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Build page-specific context to send to MCP
    const pageContext = {
      module: context.module,
      page: context.page,
      metadata: context.metadata,
      // Only include custom data if provided to optimize tokens
      ...(context.customData && { data: context.customData }),
      // Flag to indicate this is page-specific context
      contextType: 'page-specific',
      // Limit the context size
      maxTokens: 1000,
    };

    // Send to MCP orchestrator with page-specific context
    const mcpResponse = await fetch(`${process.env.MCP_ORCHESTRATOR_URL || 'http://localhost:3000'}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        message,
        context: pageContext,
        // Specify that we want a focused response for the current page
        responseType: 'page-assistant',
        // Limit response length for better performance
        maxResponseTokens: 500,
      })
    });

    if (!mcpResponse.ok) {
      throw new Error('Failed to get response from MCP');
    }

    const data = await mcpResponse.json();
    
    return NextResponse.json({
      response: data.response,
      // Include any relevant metadata
      metadata: {
        tokensUsed: data.tokensUsed,
        context: context.module + ' - ' + context.page
      }
    });
    
  } catch (error) {
    console.error('Error in AI chat:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}