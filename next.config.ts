import { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: false, // Disabling strict mode can sometimes help with devtools issues
  // Add this if you specifically want to disable Next.js DevTools, though it might vary by version.
  // As of Next.js 14+, direct disable flags for devtools are not common. This is more of a workaround.
  // If you find specific flags in Next.js docs for your version, prefer those.
  // You might also consider setting an environment variable like process.env.NODE_ENV === 'production'
  // for your build, as devtools are usually only active in development mode.
};

export default nextConfig;
