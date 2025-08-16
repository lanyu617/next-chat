'use client';

import { Button, Input, List } from 'antd'; // Import Ant Design List
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons'; // Import icons
import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { useRouter } from 'next/navigation';

interface Message {
  sender: 'user' | 'bot';
  content: string;
}

interface Session {
  id: string;
  title: string;
  messages: Message[]; // Messages are fetched with session, but updated dynamically
}

export default function ChatPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  const activeSession = activeSessionId
    ? sessions.find((s) => s.id === activeSessionId)
    : null;

  // Helper to fetch messages for a given session
  const fetchMessagesForSession = async (sessionId: string, token: string) => {
    try {
      const response = await fetch(`/api/chat?sessionId=${sessionId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        return data;
      } else if (response.status === 401) {
        localStorage.removeItem('token');
        setIsLoggedIn(false);
        router.push('/login');
      } else {
        console.error(`Failed to fetch messages for session ${sessionId}`, response.statusText);
        return [];
      }
    } catch (error) {
      console.error(`Error fetching messages for session ${sessionId}:`, error);
      return [];
    }
  };

  const createNewSessionBackend = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ title: `New Session ${sessions.length + 1}` }), // Provide a default title
      });

      if (response.ok) {
        const newSession = await response.json();
        // After creating a new session, fetch its messages
        const fetchedMessages = await fetchMessagesForSession(newSession.id, token);
        const sessionWithMessages = { ...newSession, messages: fetchedMessages };

        setSessions((prevSessions) => [...prevSessions, sessionWithMessages]);
        setActiveSessionId(newSession.id);
        return newSession; // Return the newly created session
      } else if (response.status === 401) {
        localStorage.removeItem('token');
        setIsLoggedIn(false);
        router.push('/login');
      } else {
        console.error('Failed to create new session', response.statusText);
      }
    } catch (error) {
      console.error('Error creating new session:', error);
    }
  };

  const fetchStreamedData = async (userMessage: string) => {
    if (!activeSession) {
      console.error('No active session found.');
      return;
    }

    const newUserMessage: Message = { sender: 'user', content: userMessage };

    // Optimistically update UI with user's message
    setSessions((prevSessions) =>
      prevSessions.map((s) =>
        s.id === activeSessionId
          ? { ...s, messages: [...s.messages, newUserMessage] }
          : s
      )
    );

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found. Please log in.');
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ message: userMessage, sessionId: activeSession.id }), // Send session ID
      });

      if (!response.body) {
        throw new Error('Response body is empty.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedResponse = '';

      // Add a placeholder for the bot's response
      setSessions((prevSessions) =>
        prevSessions.map((s) =>
          s.id === activeSessionId
            ? { ...s, messages: [...s.messages, { sender: 'bot', content: '' }] }
            : s
        )
      );

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }
        accumulatedResponse += decoder.decode(value, { stream: true });

        // Update the last message (which is the bot's response) for the active session
        setSessions((prevSessions) =>
          prevSessions.map((s) =>
            s.id === activeSessionId
              ? {
                  ...s,
                  messages: s.messages.map((msg, index) =>
                    index === s.messages.length - 1
                      ? { ...msg, content: accumulatedResponse }
                      : msg
                  ),
                }
              : s
          )
        );
      }
    } catch (error) {
      console.error('Error fetching streamed data:', error);
      setSessions((prevSessions) =>
        prevSessions.map((s) =>
          s.id === activeSessionId
            ? {
                ...s,
                messages: s.messages.map((msg, index) =>
                  index === s.messages.length - 1
                    ? { ...msg, content: `Error: ${error instanceof Error ? error.message : 'Could not get response.'}` }
                    : msg
                ),
              }
            : s
        )
      );
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    router.push('/login');
  };

  // Fetch sessions on component mount and handle authentication
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setIsLoggedIn(false);
      router.push('/login');
      return;
    } else {
      setIsLoggedIn(true);
    }

    const fetchSessions = async () => {
      try {
        const response = await fetch('/api/sessions', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setSessions(data); // Set fetched sessions
          if (data.length > 0) {
            setActiveSessionId(data[0].id); // Set the first session as active
          } else {
            // If no sessions exist, create a new one
            await createNewSessionBackend();
          }
        } else if (response.status === 401) {
          localStorage.removeItem('token');
          setIsLoggedIn(false);
          router.push('/login');
        } else {
          console.error('Failed to fetch sessions', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching sessions:', error);
        // Handle network errors or other issues
      }
    };

    fetchSessions();
  }, [router, createNewSessionBackend]);

  // Scroll to the bottom whenever messages in the active session change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }
  }, [activeSession?.messages]);

  const handleSendMessage = () => {
    if (input.trim() === '') return;
    fetchStreamedData(input);
    setInput('');
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside
        className={`bg-gray-100 transition-all duration-300 ${isSidebarOpen ? 'w-64 p-4' : 'w-0 p-0 overflow-hidden'}`}
      >
        <h2 className="text-xl font-semibold mb-4">Sessions</h2>
        <div className="flex-1 overflow-y-auto">
          <List
            dataSource={sessions}
            renderItem={(session) => (
              <List.Item
                key={session.id}
                className={`${activeSessionId === session.id ? 'bg-blue-300 text-white' : 'hover:bg-gray-200'}`}
                style={{ cursor: 'pointer', padding: '8px 12px', borderRadius: '4px' }}
                onClick={async () => {
                  setActiveSessionId(session.id);
                  const token = localStorage.getItem('token');
                  if (token) {
                    const fetchedMessages = await fetchMessagesForSession(session.id, token);
                    setSessions((prevSessions) =>
                      prevSessions.map((s) =>
                        s.id === session.id ? { ...s, messages: fetchedMessages } : s
                      )
                    );
                  }
                }}
              >
                {session.title}
              </List.Item>
            )}
          />
        </div>
        <Button
          type="primary"
          onClick={async () => {
            const newSession = await createNewSessionBackend();
            if (newSession) {
              const token = localStorage.getItem('token');
              if (token) {
                const fetchedMessages = await fetchMessagesForSession(newSession.id, token);
                setSessions((prevSessions) =>
                  prevSessions.map((s) =>
                    s.id === newSession.id ? { ...s, messages: fetchedMessages } : s
                  )
                );
              }
            }
          }}
          style={{ width: '100%', marginTop: '16px' }}
        >
          + New Session
        </Button>
      </aside>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white p-4 flex items-center justify-between">
          <div className="flex items-center">
            <Button
              type="text"
              icon={isSidebarOpen ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />}
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              style={{ marginRight: '16px' }}
            />
            <h1 className="text-xl font-semibold">
              {activeSession ? activeSession.title : 'Loading...'}
            </h1>
          </div>
          {isLoggedIn ? (
            <Button type="primary" danger onClick={handleLogout}>
              Logout
            </Button>
          ) : (
            <Button type="primary" onClick={() => router.push('/login')}>
              Login
            </Button>
          )}
        </header>

        {/* Message Area */}
        <div className="flex-1 p-4 overflow-y-auto bg-gray-50 flex flex-col" ref={messagesEndRef}>
          {activeSession?.messages.map((msg, index) => (
            <div
              key={index}
              className={`mb-2 p-2 rounded shadow-sm ${msg.sender === 'user' ? 'bg-blue-100 self-end' : 'bg-white self-start'}`}
              style={{ maxWidth: '70%', marginLeft: msg.sender === 'user' ? 'auto' : 'unset' }}
            >
              <ReactMarkdown>{msg.content}</ReactMarkdown>
            </div>
          ))}
        </div>

        {/* Input Box */}
        <div className="p-4 bg-gray-200 flex">
          <Input.TextArea
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onPressEnter={(e) => {
              if (e.shiftKey) return; // Allow shift + enter for new line
              e.preventDefault(); // Prevent default new line
              handleSendMessage();
            }}
            autoSize={{ minRows: 1, maxRows: 5 }}
            style={{ marginRight: '8px' }}
          />
          <Button type="primary" onClick={handleSendMessage}>
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}
