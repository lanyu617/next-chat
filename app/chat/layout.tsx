import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getUserFromRequest } from '@/lib/auth';
import { NextRequest } from 'next/server';

// 模拟创建 NextRequest 对象以复用现有的认证逻辑
function createRequestFromCookies(cookieStore: any): NextRequest {
  const url = new URL('http://localhost:3000/chat');
  const request = new Request(url);
  
  // 创建一个模拟的 NextRequest
  const nextRequest = request as NextRequest;
  nextRequest.cookies = cookieStore;
  
  return nextRequest;
}

export default async function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  
  if (!token) {
    redirect('/login');
  }
  
  try {
    // 验证 token 有效性
    const mockRequest = createRequestFromCookies(cookieStore);
    const user = getUserFromRequest(mockRequest);
    
    if (!user) {
      redirect('/login?message=expired');
    }
  } catch (error) {
    redirect('/login?message=expired');
  }
  
  return <>{children}</>;
}
