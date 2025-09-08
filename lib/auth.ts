import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

interface DecodedToken {
  id: string;
  username: string;
  iat: number;
  exp: number;
}

export const verifyToken = (req: NextRequest): DecodedToken => {
  let token: string | undefined;
  
  // 优先从 Authorization header 获取 token (向后兼容)
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else {
    // 从 Cookie 中获取 token
    token = req.cookies.get('auth-token')?.value;
  }
  
  // 尝试从中间件注入的用户数据中获取 (SSR 优化)
  const userData = req.headers.get('x-user-data');
  if (userData) {
    try {
      return JSON.parse(userData) as DecodedToken;
    } catch {
      // 如果解析失败，继续使用 token 验证
    }
  }

  if (!token) {
    throw new Error('No token provided.');
  }

  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET is not defined.');
  }

  try {
    const decoded = jwt.verify(token, secret) as DecodedToken;
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('TokenExpiredError'); // Throw specific error for token expiration
    } else {
      throw new Error('Invalid token'); // Generic error for other token issues
    }
  }
};

// 新增：从服务端获取用户信息的工具函数
export const getUserFromRequest = (req: NextRequest): DecodedToken | null => {
  try {
    return verifyToken(req);
  } catch {
    return null;
  }
};




