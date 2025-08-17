import { Button, List, Modal } from 'antd';
import { Session, Message } from '@/src/types/chat';

interface SessionListProps {
  sessions: Session[];
  activeSessionId: string | null;
  setActiveSessionId: (id: string) => void;
  fetchMessagesForSession: (sessionId: string, token: string) => Promise<Message[]>;
  setSessions: React.Dispatch<React.SetStateAction<Session[]>>;
  createNewSessionBackend: () => Promise<Session | undefined>;
  isMobile: boolean;
  isModalVisible: boolean;
  setIsModalVisible: (visible: boolean) => void;
  isSidebarOpen: boolean;
}

export default function SessionList({
  sessions,
  activeSessionId,
  setActiveSessionId,
  fetchMessagesForSession,
  setSessions,
  createNewSessionBackend,
  isMobile,
  isModalVisible,
  setIsModalVisible,
  isSidebarOpen,
}: SessionListProps) {

  const handleSessionClick = async (session: Session) => {
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
    if (isMobile) {
      setIsModalVisible(false); // Close modal on session selection in mobile
    }
  };

  const handleNewSession = async () => {
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
    if (isMobile) {
      setIsModalVisible(false); // Close modal on new session creation in mobile
    }
  };

  const content = (
    <>
      <h2 className="text-xl font-semibold mb-4">Sessions</h2>
      <div className="flex-1 overflow-y-auto">
        <List
          dataSource={sessions}
          renderItem={(session) => (
            <List.Item
              key={session.id}
              className={`${activeSessionId === session.id ? 'bg-blue-300 text-white' : 'hover:bg-gray-200'}`}
              style={{ cursor: 'pointer', padding: '8px 12px', borderRadius: '4px' }}
              onClick={() => handleSessionClick(session)}
            >
              {session.title}
            </List.Item>
          )}
        />
      </div>
      <Button
        type="primary"
        onClick={handleNewSession}
        style={{ width: '100%', marginTop: '16px' }}
      >
        + New Session
      </Button>
    </>
  );

  return (
    isMobile ? (
      <Modal
        title="Sessions"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        {content}
      </Modal>
    ) : (
      <aside
        className={`bg-gray-100 transition-all duration-300 ${isSidebarOpen ? 'w-64 p-4' : 'w-0 p-0 overflow-hidden'}`}
      >
        {content}
      </aside>
    )
  );
}
