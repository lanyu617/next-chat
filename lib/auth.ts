import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

interface DecodedToken {
  id: string;
  username: string;
  iat: number;
  exp: number;
}

export const verifyToken = (req: NextRequest): DecodedToken => {
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.split(' ')[1];

  if (!token) {
    throw new Error('No token provided');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as DecodedToken;
    return decoded;
  } catch {
    throw new Error('Invalid token');
  }
};




