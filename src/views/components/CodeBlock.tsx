import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { CopyOutlined, CheckOutlined } from '@ant-design/icons';
import { Button, message } from 'antd';

interface CodeBlockProps {
  children: string;
  className?: string;
}

// 语言映射表，将常见的语言别名映射到正确的语言名称
const languageMap: { [key: string]: string } = {
  'js': 'javascript',
  'ts': 'typescript',
  'jsx': 'javascript',
  'tsx': 'typescript',
  'py': 'python',
  'sh': 'bash',
  'shell': 'bash',
  'yml': 'yaml',
  'md': 'markdown',
  'json5': 'json',
  'vue': 'javascript',
  'scss': 'css',
  'less': 'css',
  'styl': 'css',
};

// 获取语言显示名称
const getLanguageDisplayName = (lang: string): string => {
  const displayNames: { [key: string]: string } = {
    'javascript': 'JavaScript',
    'typescript': 'TypeScript',
    'python': 'Python',
    'java': 'Java',
    'cpp': 'C++',
    'csharp': 'C#',
    'php': 'PHP',
    'ruby': 'Ruby',
    'go': 'Go',
    'rust': 'Rust',
    'swift': 'Swift',
    'kotlin': 'Kotlin',
    'bash': 'Bash',
    'sql': 'SQL',
    'html': 'HTML',
    'css': 'CSS',
    'json': 'JSON',
    'xml': 'XML',
    'yaml': 'YAML',
    'markdown': 'Markdown',
    'dockerfile': 'Dockerfile',
    'nginx': 'Nginx',
    'apache': 'Apache',
  };
  return displayNames[lang] || lang.toUpperCase();
};

export default function CodeBlock({ children, className }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  
  // 从className中提取语言信息 (格式: "language-javascript")
  const match = /language-(\w+)/.exec(className || '');
  const rawLanguage = match ? match[1] : '';
  const language = languageMap[rawLanguage] || rawLanguage || 'text';
  const displayLanguage = getLanguageDisplayName(language);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(children);
      setCopied(true);
      message.success('代码已复制到剪贴板');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      message.error('复制失败');
    }
  };

  return (
    <div className="my-4 rounded-lg overflow-hidden border border-gray-200 bg-[#1e1e1e]">
      {/* 代码块头部栏 */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#2d2d30] border-b border-gray-600">
        <div className="flex items-center space-x-2">
          {/* 语言标签 */}
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          {language && (
            <span className="text-gray-300 text-sm font-medium ml-2">
              {displayLanguage}
            </span>
          )}
        </div>
        
        {/* 复制按钮 */}
        <Button
          type="text"
          size="small"
          icon={copied ? <CheckOutlined /> : <CopyOutlined />}
          onClick={handleCopy}
          className="text-gray-300 hover:text-white hover:bg-gray-600 border-none"
          title="复制代码"
        >
          {copied ? '已复制' : '复制'}
        </Button>
      </div>
      
      {/* 代码内容 */}
      <div className="relative">
        <SyntaxHighlighter
          language={language}
          style={vscDarkPlus}
          customStyle={{
            margin: 0,
            padding: '16px',
            background: '#1e1e1e',
            fontSize: '14px',
            lineHeight: '1.5',
          }}
          showLineNumbers={true}
          lineNumberStyle={{
            color: '#6e7681',
            fontSize: '12px',
            paddingRight: '16px',
            marginRight: '16px',
            borderRight: '1px solid #30363d',
          }}
          wrapLines={true}
          wrapLongLines={true}
        >
          {children}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}
