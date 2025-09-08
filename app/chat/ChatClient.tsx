'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import HeaderBar from '@/src/views/components/HeaderBar';
import SessionList from '@/src/views/components/SessionList';
import ContentBox from '@/src/views/components/ContentBox';
import InputBox from '@/src/views/components/InputBox';
import { Message, Session } from '@/src/types/chat';
import { Modal, Button, Input } from 'antd';

interface ChatClientProps {
  initialSessions: Session[];
  user: { id: string; username: string };
}

export default function ChatClient({ initialSessions, user }: ChatClientProps) {
  const [sessions, setSessions] = useState<Session[]>(initialSessions);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(
    initialSessions.length > 0 ? initialSessions[0].id : null
  );
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingTitle, setEditingTitle] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();

  const activeSession = activeSessionId
    ? sessions.find((s) => s.id === activeSessionId) || null
    : null;

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 使用 fetch 而不是 localStorage 来发送请求
  const fetchMessagesForSession = useCallback(async (sessionId: string) => {
    try {
      const response = await fetch(`/api/chat?sessionId=${sessionId}`, {
        credentials: 'include', // 包含 cookies
      });
      
      if (response.ok) {
        const data = await response.json();
        return data;
      } else if (response.status === 401) {
        router.push('/login?message=expired');
        return [];
      }
    } catch (error) {
      console.error(`Error fetching messages for session ${sessionId}:`, error);
      router.push('/login');
      return [];
    }
  }, [router]);

  const createNewSessionBackend = useCallback(async () => {
    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ title: `New Session ${sessions.length + 1}` }),
      });

      if (response.ok) {
        const newSession = await response.json();
        const fetchedMessages = await fetchMessagesForSession(newSession.id);
        const sessionWithMessages = { ...newSession, messages: fetchedMessages || [] };

        setSessions((prevSessions) => [...prevSessions, sessionWithMessages]);
        setActiveSessionId(newSession.id);
        return sessionWithMessages;
      } else if (response.status === 401) {
        router.push('/login?message=expired');
      }
    } catch (error) {
      console.error('Error creating new session:', error);
      router.push('/login');
    }
  }, [sessions.length, router, fetchMessagesForSession]);

  const deleteSessionBackend = useCallback(async (sessionId: string) => {
    try {
      const response = await fetch('/api/sessions', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ id: sessionId }),
      });

      if (response.ok) {
        return true;
      } else if (response.status === 401) {
        router.push('/login?message=expired');
        return false;
      } else {
        console.error('Failed to delete session');
        return false;
      }
    } catch (error) {
      console.error('Error deleting session:', error);
      return false;
    }
  }, [router]);

  const fetchStreamedData = async (userMessage: string) => {
    if (!activeSession) {
      console.error('No active session found.');
      return;
    }

    const newUserMessage: Message = { sender: 'user', content: userMessage };

    setSessions((prevSessions) =>
      prevSessions.map((s) =>
        s.id === activeSessionId
          ? { ...s, messages: [...(s.messages || []), newUserMessage] }
          : s
      )
    );

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ message: userMessage, sessionId: activeSession.id }),
      });

      if (response.status === 401) {
        router.push('/login?message=expired');
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
            ? { ...s, messages: [...(s.messages || []), { sender: 'bot', content: '' }] }
            : s
        )
      );

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        accumulatedResponse += decoder.decode(value, { stream: true });

        setSessions((prevSessions) =>
          prevSessions.map((s) =>
            s.id === activeSessionId
              ? {
                  ...s,
                  messages: (s.messages || []).map((msg, index) =>
                    index === (s.messages || []).length - 1
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
      router.push('/login');
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
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

    try {
      const response = await fetch('/api/sessions', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
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
        router.push('/login?message=expired');
      }
    } catch (error) {
      console.error('Error updating session title:', error);
      router.push('/login');
    }
  };

  const handleEditCancel = () => {
    setIsEditModalVisible(false);
  };

  // 初始化时加载第一个会话的消息
  useEffect(() => {
    if (activeSessionId && activeSession && (!activeSession.messages || activeSession.messages.length === 0)) {
      fetchMessagesForSession(activeSessionId).then((messages) => {
        setSessions((prevSessions) =>
          prevSessions.map((s) =>
            s.id === activeSessionId ? { ...s, messages: messages || [] } : s
          )
        );
      });
    }
  }, [activeSessionId, activeSession, fetchMessagesForSession]);

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
    <div className="flex h-screen overflow-hidden w-full max-w-full">
      {!isMobile && (
        <SessionList
          sessions={sessions}
          activeSessionId={activeSessionId}
          setActiveSessionId={setActiveSessionId}
          fetchMessagesForSession={fetchMessagesForSession}
          setSessions={setSessions}
          createNewSessionBackend={createNewSessionBackend}
          deleteSessionBackend={deleteSessionBackend}
          isMobile={isMobile}
          isModalVisible={isModalVisible}
          setIsModalVisible={setIsModalVisible}
          isSidebarOpen={isSidebarOpen}
        />
      )}

      <div className="flex-1 flex flex-col w-full min-w-0 max-w-full overflow-hidden"
           style={{ maxWidth: '100%' }}>
        <HeaderBar
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          activeSession={activeSession}
          showEditModal={showEditModal}
          isLoggedIn={true}
          handleLogout={handleLogout}
          router={router}
          isMobile={isMobile}
          onShowMobileSessionList={() => setIsModalVisible(true)}
        />

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
          deleteSessionBackend={deleteSessionBackend}
          isMobile={isMobile}
          isModalVisible={isModalVisible}
          setIsModalVisible={setIsModalVisible}
          isSidebarOpen={isSidebarOpen}
        />
      )}
    </div>
  );
}
