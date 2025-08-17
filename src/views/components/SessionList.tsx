import { Button, List, Modal, Popconfirm } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { Session, Message } from '@/src/types/chat';

interface SessionListProps {
  sessions: Session[];
  activeSessionId: string | null;
  setActiveSessionId: (id: string) => void;
  fetchMessagesForSession: (sessionId: string, token: string) => Promise<Message[]>;
  setSessions: React.Dispatch<React.SetStateAction<Session[]>>;
  createNewSessionBackend: () => Promise<Session | undefined>;
  deleteSessionBackend: (sessionId: string) => Promise<boolean>;
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
  deleteSessionBackend,
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

  const handleDeleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // 防止触发会话选择事件
    
    const success = await deleteSessionBackend(sessionId);
    if (success) {
      // 从会话列表中移除被删除的会话
      setSessions((prevSessions) => prevSessions.filter(s => s.id !== sessionId));
      
      // 如果删除的是当前活动会话，切换到第一个可用会话
      if (activeSessionId === sessionId) {
        const remainingSessions = sessions.filter(s => s.id !== sessionId);
        if (remainingSessions.length > 0) {
          setActiveSessionId(remainingSessions[0].id);
        } else {
          // 如果没有剩余会话，创建新会话
          await handleNewSession();
        }
      }
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
              className={`group relative ${activeSessionId === session.id ? 'bg-blue-300 text-white' : 'hover:bg-gray-200'}`}
              style={{ cursor: 'pointer', padding: '8px 12px', borderRadius: '4px', border: 'none' }}
              onClick={() => handleSessionClick(session)}
            >
              <div className="flex items-center justify-between w-full">
                <span className="flex-1 truncate pr-2">
                  {session.title}
                </span>
                <Popconfirm
                  title="确认删除"
                  description="你确定要删除这个会话吗？"
                  onConfirm={(e) => handleDeleteSession(session.id, e!)}
                  okText="确定"
                  cancelText="取消"
                  placement="topRight"
                >
                  <Button
                    type="text"
                    icon={<DeleteOutlined />}
                    size="small"
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={(e) => e.stopPropagation()}
                    title="删除会话"
                  />
                </Popconfirm>
              </div>
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
