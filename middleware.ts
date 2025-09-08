import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 公开路径，不需要认证
  const publicPaths = ['/login', '/register', '/', '/intro', '/api/auth/login', '/api/auth/register'];
  
  if (publicPaths.includes(pathname)) {
    return NextResponse.next();
  }
  
  // 获取 HTTP-only Cookie 中的 token
  const token = request.cookies.get('auth-token')?.value;
  
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET not configured');
    }
    
    const decoded = jwt.verify(token, secret);
    
    // 将用户信息添加到请求头中，供 API 路由使用
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-data', JSON.stringify(decoded));
    
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    // Token 无效或过期，重定向到登录页
    const response = NextResponse.redirect(new URL('/login?message=expired', request.url));
    response.cookies.delete('auth-token');
    return response;
  }
}

export const config = {
  matcher: [
    /*
     * 匹配所有路径除了：
     * - api routes (以 /api/ 开头的)
     * - _next/static (静态文件)
     * - _next/image (图片优化文件)
     * - favicon.ico (图标文件)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
