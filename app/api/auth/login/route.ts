import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../../../../lib/db';

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ message: 'Username and password are required' }, { status: 400 });
    }

    // Password format validation (same as registration for consistency)
    const passwordRegex = /^[a-zA-Z0-9_]{6,20}$/;
    if (!passwordRegex.test(password)) {
      return NextResponse.json(
        { message: 'Invalid password format.' }, // More general message for login
        { status: 400 }
      );
    }

    // Find user by username
    const userResult = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    const user = userResult.rows[0];

    if (!user) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

  // Generate JWT
  const token = jwt.sign(
    { id: user.id, username: user.username },
    process.env.JWT_SECRET as string,
    { expiresIn: '1h' } // Token expires in 1 hour
  );

  // 创建响应并设置 HTTP-only Cookie
  const response = NextResponse.json({ message: 'Login successful', user: { id: user.id, username: user.username } }, { status: 200 });
  
  // 设置 HTTP-only Cookie
  response.cookies.set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60, // 1 hour
    path: '/',
  });

  return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
