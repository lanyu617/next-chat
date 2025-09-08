import { cookies } from 'next/headers';
import { pool } from '@/lib/db';
import jwt from 'jsonwebtoken';
import ChatClient from './ChatClient';
import type { Session } from '@/src/types/chat';

interface DecodedToken {
  id: string;
  username: string;
  iat: number;
  exp: number;
}

// 服务端数据获取函数
async function getInitialData(): Promise<{
  sessions: Session[];
  user: { id: string; username: string } | null;
}> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    
    if (!token) {
      return { sessions: [], user: null };
    }
    
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET not configured');
    }
    
    const decoded = jwt.verify(token, secret) as DecodedToken;
    const userId = decoded.id;
    
    // 获取用户的会话列表
    const sessionsResult = await pool.query(
      'SELECT id, title, created_at FROM sessions WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    
    const sessions: Session[] = sessionsResult.rows.map(row => ({
      id: row.id,
      title: row.title,
      messages: [] // 消息在客户端懒加载
    }));
    
    return {
      sessions,
      user: { id: decoded.id, username: decoded.username }
    };
  } catch (error) {
    console.error('Error fetching initial data:', error);
    return { sessions: [], user: null };
  }
}

export default async function ChatPage() {
  const { sessions, user } = await getInitialData();
  
  if (!user) {
    return <div>Unauthorized access</div>;
  }
  
  return (
    <ChatClient 
      initialSessions={sessions} 
      user={user}
    />
  );
}
