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
      className="flex-1 py-4 overflow-y-auto bg-gray-50 flex flex-col" // Removed px-2 sm:px-4
      ref={messagesEndRef}
      style={{ maxWidth: '100%', margin: '0 auto', overflowX: 'hidden' }}
    >
      {(activeSessionMessages || []).map((msg, index) => (
        <div
          key={index}
          className={`mb-2 p-2 rounded shadow-sm ${msg.sender === 'user' ? 'bg-blue-100 self-end' : 'bg-white self-start'} max-w-full break-words mx-0 sm:mx-2`}
          style={{ marginLeft: msg.sender === 'user' ? 'auto' : 'unset' }} // Removed redundant width/maxWidth
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
