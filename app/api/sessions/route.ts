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

// Add PATCH method to update a session title
export async function PATCH(req: NextRequest) {
  try {
    const decodedToken = verifyToken(req);
    const userId = decodedToken.id;

    const { id, title } = await req.json();

    if (!id || !title) {
      return NextResponse.json({ message: 'Session ID and title are required' }, { status: 400 });
    }

    // Verify that the session belongs to the authenticated user
    const sessionCheck = await pool.query(
      'SELECT id FROM sessions WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (sessionCheck.rows.length === 0) {
      return NextResponse.json({ message: 'Session not found or unauthorized' }, { status: 404 });
    }

    const updatedSessionResult = await pool.query(
      'UPDATE sessions SET title = $1 WHERE id = $2 RETURNING id, title, created_at',
      [title, id]
    );

    return NextResponse.json(updatedSessionResult.rows[0], { status: 200 });
  } catch (error: unknown) {
    console.error('Error updating session:', error);
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

