import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import 'antd/dist/reset.css'; // Import Ant Design styles

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "NextChat - AI 聊天助手",
    template: "%s | NextChat"
  },
  description: "基于 Next.js 和 AI 技术的智能聊天应用，支持多会话管理、实时对话、代码高亮等功能",
  keywords: ["AI聊天", "Next.js", "智能助手", "聊天应用", "人工智能"],
  authors: [{ name: "NextChat Team" }],
  creator: "NextChat",
  openGraph: {
    type: "website",
    locale: "zh_CN",
    url: "https://nextchat.example.com",
    siteName: "NextChat",
    title: "NextChat - AI 聊天助手",
    description: "智能 AI 聊天应用，提供流畅的对话体验",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "NextChat AI 聊天应用",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "NextChat - AI 聊天助手",
    description: "智能 AI 聊天应用，提供流畅的对话体验",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
