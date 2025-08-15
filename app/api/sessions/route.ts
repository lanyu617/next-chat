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
  } catch (error: any) {
    console.error('Error fetching sessions:', error);
    return NextResponse.json({ message: error.message || 'Internal server error' }, { status: 500 });
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
  } catch (error: any) {
    console.error('Error creating session:', error);
    return NextResponse.json({ message: error.message || 'Internal server error' }, { status: 500 });
  }
}

