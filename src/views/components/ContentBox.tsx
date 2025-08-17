import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Message } from '@/src/types/chat';

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
      className="flex-1 px-2 py-4 sm:px-4 overflow-y-auto bg-gray-50 flex flex-col" // Changed p-4 to responsive px and py
      ref={messagesEndRef}
      style={{ maxWidth: '100%', margin: '0 auto', overflowX: 'hidden' }} // Added overflowX: 'hidden'
    >
      {(activeSessionMessages || []).map((msg, index) => (
        <div
          key={index}
          className={`mb-2 p-2 rounded shadow-sm ${msg.sender === 'user' ? 'bg-blue-100 self-end' : 'bg-white self-start'}`}
          style={{ width: 'fit-content', maxWidth: '90%', marginLeft: msg.sender === 'user' ? 'auto' : 'unset', wordBreak: 'break-word' }} // Changed maxWidth to width: 'fit-content' and added wordBreak
        >
          <ReactMarkdown
            components={{
              p: ({ ...props }) => <p style={{ margin: '0px' }} {...props} />,
            }}
          >
            {msg.content}
          </ReactMarkdown>
        </div>
      ))}
    </div>
  );
}
