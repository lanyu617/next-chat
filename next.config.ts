import { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true, // 启用严格模式以提高代码质量
  
  // 实验性功能
  experimental: {
    // 启用服务端组件
    serverComponentsExternalPackages: ['pg', 'bcryptjs', 'jsonwebtoken'],
  },
  
  // 压缩优化
  compress: true,
  
  // 图片优化
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
  },
  
  // 字体优化
  optimizeFonts: true,
  
  // 构建时优化
  swcMinify: true,
  
  // 性能优化
  poweredByHeader: false,
  
  // 重定向规则
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ];
  },
  
  // Headers 优化
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
