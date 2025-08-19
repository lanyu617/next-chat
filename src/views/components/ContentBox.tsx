import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Message } from '@/src/types/chat';
import CodeBlock from './CodeBlock';

interface ContentBoxProps {
  activeSessionMessages: Message[];
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

export default function ContentBox({
  activeSessionMessages,
  messagesEndRef,
}: ContentBoxProps) {
  return (
    <div
      className="flex-1 py-4 overflow-y-auto bg-gray-50 flex flex-col w-full"
      ref={messagesEndRef}
      style={{ maxWidth: '100%', overflowX: 'hidden' }}
    >
      <div className="px-2 sm:px-4 w-full max-w-full">
        {(activeSessionMessages || []).map((msg, index) => (
          <div
            key={index}
            className={`mb-3 p-3 rounded-lg shadow-sm w-fit max-w-[85%] sm:max-w-[75%] md:max-w-[70%] ${
              msg.sender === 'user' 
                ? 'bg-blue-100 ml-auto text-right' 
                : 'bg-white mr-auto text-left'
            }`}
            style={{ 
              wordBreak: 'break-word',
              overflowWrap: 'break-word',
              hyphens: 'auto'
            }}
          >
            <ReactMarkdown
              components={{
                p: ({ ...props }) => <p style={{ margin: '0px' }} {...props} />,
                hr: ({ ...props }) => (
                  <hr 
                    className="my-4 border-t border-gray-300" 
                    style={{ 
                      margin: '16px 0',
                      border: 'none',
                      borderTop: '1px solid #d1d5db',
                      width: '100%'
                    }}
                    {...props} 
                  />
                ),
                code: ({ className, children, ...props }) => {
                  const match = /language-(\w+)/.exec(className || '');
                  const isInline = !match;
                  
                  if (isInline) {
                    // 行内代码
                    return (
                      <code
                        className="bg-gray-100 text-gray-800 px-1 py-0.5 rounded font-mono border border-gray-200"
                        style={{ fontSize: 'inherit' }}
                        {...props}
                      >
                        {children}
                      </code>
                    );
                  }
                  
                  // 代码块
                  return (
                    <CodeBlock className={className}>
                      {String(children).replace(/\n$/, '')}
                    </CodeBlock>
                  );
                },
              }}
            >
              {msg.content}
            </ReactMarkdown>
          </div>
        ))}
      </div>
    </div>
  );
}
