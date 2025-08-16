import { NextRequest, NextResponse } from 'next/server';
import { pool } from '../../../lib/db';
import { verifyToken } from '../../../lib/auth';

// Get all sessions for a user
export async function GET(req: NextRequest) {
  try {
    const decodedToken = verifyToken(req);
    const userId = decodedToken.id;

    const sessionsResult = await pool.query(
      'SELECT id, title, created_at FROM sessions WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );

    return NextResponse.json(sessionsResult.rows, { status: 200 });
  } catch (error: unknown) {
    console.error('Error fetching sessions:', error);
    if (error instanceof Error) {
      if (error.message === 'TokenExpiredError') {
        return NextResponse.json({ message: 'Token expired' }, { status: 401 });
      } else if (error.message === 'Invalid token' || error.message === 'No token provided.') {
        return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
      }
    }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// Create a new session for a user
export async function POST(req: NextRequest) {
  try {
    const decodedToken = verifyToken(req);
    const userId = decodedToken.id;
    const { title } = await req.json();

    if (!title) {
      return NextResponse.json({ message: 'Session title is required' }, { status: 400 });
    }

    const newSessionResult = await pool.query(
      'INSERT INTO sessions (user_id, title) VALUES ($1, $2) RETURNING id, title, created_at',
      [userId, title]
    );

    return NextResponse.json(newSessionResult.rows[0], { status: 201 });
  } catch (error: unknown) {
    console.error('Error creating session:', error);
    if (error instanceof Error) {
      if (error.message === 'TokenExpiredError') {
        return NextResponse.json({ message: 'Token expired' }, { status: 401 });
      } else if (error.message === 'Invalid token' || error.message === 'No token provided.') {
        return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
      }
    }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

