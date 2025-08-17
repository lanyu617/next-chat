import { Button } from 'antd';
import { MenuFoldOutlined, MenuUnfoldOutlined, EditOutlined, MessageOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { Session } from '@/src/types/chat';

interface HeaderBarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
  activeSession: Session | null;
  showEditModal: () => void;
  isLoggedIn: boolean;
  handleLogout: () => void;
  router: ReturnType<typeof useRouter>;
  isMobile: boolean; // Add isMobile prop
  onShowMobileSessionList: () => void; // Callback to show session list on mobile
}

export default function HeaderBar({
  isSidebarOpen,
  setIsSidebarOpen,
  activeSession,
  showEditModal,
  isLoggedIn,
  handleLogout,
  router,
  isMobile,
  onShowMobileSessionList,
}: HeaderBarProps) {
  return (
    <header className="bg-white p-4 flex items-center justify-between shadow-md">
      <div className="flex items-center">
        {isMobile ? (
          <Button
            type="text"
            icon={<MessageOutlined />} // Icon for showing sessions on mobile
            onClick={onShowMobileSessionList}
            style={{ marginRight: '16px' }}
          />
        ) : (
          <Button
            type="text"
            icon={isSidebarOpen ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />}
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            style={{ marginRight: '16px' }}
          />
        )}
        <h1 className="text-xl font-semibold mb-0 mt-0 flex-1 min-w-0 truncate"> {/* Add flex-1, min-w-0, truncate */}
          {activeSession ? activeSession.title : 'Loading...'}
        </h1>
        {activeSession && (
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={showEditModal}
            className="ml-2" // Replaced inline style
          />
        )}
      </div>
      {isLoggedIn ? (
        <Button type="primary" danger onClick={handleLogout} className="text-sm px-2 py-1"> {/* Added compact styles */}
          Logout
        </Button>
      ) : (
        <Button type="primary" onClick={() => router.push('/login')} className="text-sm px-2 py-1"> {/* Added compact styles */}
          Login
        </Button>
      )}
    </header>
  );
}
