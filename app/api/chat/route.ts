import { NextRequest, NextResponse } from 'next/server';
// import { marked } from 'marked'; // Remove marked import
import OpenAI from "openai";
import { verifyToken } from '../../../lib/auth'; // Import verifyToken
import { pool } from '../../../../lib/db'; // Import pool

const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: process.env.DEEPSEEK_API_KEY,
});

// Get messages for a specific session
export async function GET(req: NextRequest) {
  try {
    const decodedToken = verifyToken(req);
    const userId = decodedToken.id; // User ID from token

    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json({ message: 'Session ID is required' }, { status: 400 });
    }

    // Verify that the session belongs to the authenticated user
    const sessionCheck = await pool.query(
      'SELECT id FROM sessions WHERE id = $1 AND user_id = $2',
      [sessionId, userId]
    );

    if (sessionCheck.rows.length === 0) {
      return NextResponse.json({ message: 'Session not found or unauthorized' }, { status: 404 });
    }

    const messagesResult = await pool.query(
      'SELECT id, sender, content, created_at FROM messages WHERE session_id = $1 ORDER BY created_at ASC',
      [sessionId]
    );

    return NextResponse.json(messagesResult.rows, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ message: error.message || 'Internal server error' }, { status: error.message.includes('token') ? 401 : 500 });
  }
}

// Handle chat message sending and streaming response
export async function POST(req: NextRequest) {
  try {
    // Verify user token
    const decodedToken = verifyToken(req);
    const userId = decodedToken.id;

    const { message, sessionId } = await req.json(); // Get message and session ID from frontend

    if (!sessionId) {
      return NextResponse.json({ message: 'Session ID is required' }, { status: 400 });
    }

    // Verify that the session belongs to the authenticated user before saving messages
    const sessionCheck = await pool.query(
      'SELECT id FROM sessions WHERE id = $1 AND user_id = $2',
      [sessionId, userId]
    );

    if (sessionCheck.rows.length === 0) {
      return NextResponse.json({ message: 'Session not found or unauthorized' }, { status: 404 });
    }

    // Save user message to database
    await pool.query(
      'INSERT INTO messages (session_id, sender, content) VALUES ($1, $2, $3)',
      [sessionId, 'user', message]
    );

    const encoder = new TextEncoder();
    const customReadable = new ReadableStream({
      async start(controller) {
        let botAccumulatedResponse = ''; // To store the full bot response
        try {
          const stream = await openai.chat.completions.create({
            messages: [{ role: "user", content: message }],
            model: "deepseek-chat",
            stream: true,
          });

          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || "";
            botAccumulatedResponse += content; // Accumulate bot response
            controller.enqueue(encoder.encode(content));
          }
          controller.close();

          // Save bot message to database after stream completes
          await pool.query(
            'INSERT INTO messages (session_id, sender, content) VALUES ($1, $2, $3)',
            [sessionId, 'bot', botAccumulatedResponse]
          );

        } catch (error) {
          console.error('Error calling DeepSeek API:', error);
          controller.error(encoder.encode('Error from DeepSeek API.'));
          // If an error occurs during streaming, still save it to the database
          await pool.query(
            'INSERT INTO messages (session_id, sender, content) VALUES ($1, $2, $3)',
            [sessionId, 'bot', 'Error: Could not get response from AI.']
          );
        }
      },
    });

    return new NextResponse(customReadable, {
      headers: { 'Content-Type': 'text/plain' },
    });
  } catch (error: any) {
    // Handle token verification errors or other top-level errors
    console.error('Chat API error:', error);
    return NextResponse.json({ message: error.message || 'Internal server error' }, { status: error.message.includes('token') ? 401 : 500 });
  }
}
