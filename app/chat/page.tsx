'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import HeaderBar from '@/src/views/components/HeaderBar';
import SessionList from '@/src/views/components/SessionList';
import ContentBox from '@/src/views/components/ContentBox';
import InputBox from '@/src/views/components/InputBox';
import { Message, Session } from '@/src/types/chat';
import { Modal, Button, Input } from 'antd';
// import { EditOutlined } from '@ant-design/icons'; // Removed unused import

export default function ChatPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false); // State for session list modal visibility on mobile
  const [isEditModalVisible, setIsEditModalVisible] = useState(false); // State for editing title modal
  const [editingTitle, setEditingTitle] = useState('');
  const [isMobile, setIsMobile] = useState(false); // State for mobile detection
  const router = useRouter();

  const activeSession = activeSessionId
    ? sessions.find((s) => s.id === activeSessionId) || null
    : null;

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768); // Example breakpoint for mobile
    };
    window.addEventListener('resize', handleResize);
    handleResize(); // Set initial state
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchMessagesForSession = useCallback(async (sessionId: string, token: string) => {
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
        const errorData = await response.json();
        if (errorData.message === 'Token expired') {
          localStorage.removeItem('token');
          setIsLoggedIn(false);
          router.push('/login?message=expired');
        } else {
          localStorage.removeItem('token');
          setIsLoggedIn(false);
          router.push('/login');
        }
        return [];
      }
    } catch (error) {
      console.error(`Error fetching messages for session ${sessionId}:`, error);
      localStorage.removeItem('token');
      setIsLoggedIn(false);
      router.push('/login');
      return [];
    }
  }, [router, setIsLoggedIn]);

  const createNewSessionBackend = useCallback(async () => {
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
        body: JSON.stringify({ title: `New Session ${sessions.length + 1}` }),
      });

      if (response.ok) {
        const newSession = await response.json();
        const fetchedMessages = await fetchMessagesForSession(newSession.id, token);
        const sessionWithMessages = { ...newSession, messages: fetchedMessages };

        setSessions((prevSessions) => [...prevSessions, sessionWithMessages]);
        setActiveSessionId(newSession.id);
        return newSession;
      } else if (response.status === 401) {
        const errorData = await response.json();
        if (errorData.message === 'Token expired') {
          localStorage.removeItem('token');
          setIsLoggedIn(false);
          router.push('/login?message=expired');
        } else {
          localStorage.removeItem('token');
          setIsLoggedIn(false);
          router.push('/login');
        }
      }
    } catch (error) {
      console.error('Error creating new session:', error);
      localStorage.removeItem('token');
      setIsLoggedIn(false);
      router.push('/login');
    }
  }, [sessions.length, router, fetchMessagesForSession, setSessions, setActiveSessionId, setIsLoggedIn]);

  const fetchStreamedData = async (userMessage: string) => {
    if (!activeSession) {
      console.error('No active session found.');
      return;
    }

    const newUserMessage: Message = { sender: 'user', content: userMessage };

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
        body: JSON.stringify({ message: userMessage, sessionId: activeSession.id }),
      });

      if (response.status === 401) {
        const errorData = await response.json();
        if (errorData.message === 'Token expired') {
          localStorage.removeItem('token');
          setIsLoggedIn(false);
          router.push('/login?message=expired');
        } else {
          localStorage.removeItem('token');
          setIsLoggedIn(false);
          router.push('/login');
        }
        return;
      }

      if (!response.body) {
        throw new Error('Response body is empty.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedResponse = '';

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
      localStorage.removeItem('token');
      setIsLoggedIn(false);
      router.push('/login');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    router.push('/login');
  };

  const showEditModal = () => {
    if (activeSession) {
      setEditingTitle(activeSession.title);
    }
    setIsEditModalVisible(true);
  };

  const handleEditOk = async () => {
    if (!activeSession) return;
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const response = await fetch('/api/sessions', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ id: activeSession.id, title: editingTitle }),
      });

      if (response.ok) {
        const updatedSession = await response.json();
        setSessions((prevSessions) =>
          prevSessions.map((s) =>
            s.id === updatedSession.id ? { ...s, title: updatedSession.title } : s
          )
        );
        setIsEditModalVisible(false);
      } else if (response.status === 401) {
        const errorData = await response.json();
        if (errorData.message === 'Token expired') {
          localStorage.removeItem('token');
          setIsLoggedIn(false);
          router.push('/login?message=expired');
        } else {
          localStorage.removeItem('token');
          setIsLoggedIn(false);
          router.push('/login');
        }
      }
    } catch (error) {
      console.error('Error updating session title:', error);
      localStorage.removeItem('token');
      setIsLoggedIn(false);
      router.push('/login');
    }
  };

  const handleEditCancel = () => {
    setIsEditModalVisible(false);
  };

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
          setSessions(data);
          if (data.length > 0) {
            setActiveSessionId(data[0].id);
          } else {
            await createNewSessionBackend();
          }
        } else if (response.status === 401) {
          const errorData = await response.json();
          if (errorData.message === 'Token expired') {
            localStorage.removeItem('token');
            setIsLoggedIn(false);
            router.push('/login?message=expired');
          } else {
            localStorage.removeItem('token');
            setIsLoggedIn(false);
            router.push('/login');
          }
        }
      } catch (error) {
        console.error('Error fetching sessions:', error);
        localStorage.removeItem('token');
        setIsLoggedIn(false);
        router.push('/login');
      }
    };

    fetchSessions();
  }, [router, createNewSessionBackend, setIsLoggedIn]);

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
    <div className="flex h-screen overflow-hidden">
      {!isMobile && (
        <SessionList
          sessions={sessions}
          activeSessionId={activeSessionId}
          setActiveSessionId={setActiveSessionId}
          fetchMessagesForSession={fetchMessagesForSession}
          setSessions={setSessions}
          createNewSessionBackend={createNewSessionBackend}
          isMobile={isMobile}
          isModalVisible={isModalVisible}
          setIsModalVisible={setIsModalVisible}
          isSidebarOpen={isSidebarOpen}
        />
      )}

      <div className="flex-1 flex flex-col px-4 sm:px-6 md:px-8">
        <HeaderBar
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          activeSession={activeSession}
          showEditModal={showEditModal}
          isLoggedIn={isLoggedIn}
          handleLogout={handleLogout}
          router={router}
          isMobile={isMobile}
          onShowMobileSessionList={() => setIsModalVisible(true)}
        />

        {/* Edit Title Modal */}
        <Modal
          title="Edit Session Title"
          open={isEditModalVisible}
          onOk={handleEditOk}
          onCancel={handleEditCancel}
          footer={[
            <Button key="back" onClick={handleEditCancel}>
              Cancel
            </Button>,
            <Button key="submit" type="primary" onClick={handleEditOk}>
              OK
            </Button>,
          ]}
        >
          <Input
            value={editingTitle}
            onChange={(e) => setEditingTitle(e.target.value)}
            placeholder="New Session Title"
          />
        </Modal>

        <ContentBox
          activeSessionMessages={activeSession?.messages || []}
          messagesEndRef={messagesEndRef}
        />

        <InputBox
          input={input}
          setInput={setInput}
          handleSendMessage={handleSendMessage}
        />
      </div>
      {isMobile && (
        <SessionList
          sessions={sessions}
          activeSessionId={activeSessionId}
          setActiveSessionId={setActiveSessionId}
          fetchMessagesForSession={fetchMessagesForSession}
          setSessions={setSessions}
          createNewSessionBackend={createNewSessionBackend}
          isMobile={isMobile}
          isModalVisible={isModalVisible}
          setIsModalVisible={setIsModalVisible}
          isSidebarOpen={isSidebarOpen}
        />
      )}
    </div>
  );
}
