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
    <header className="bg-white p-2 sm:p-4 flex items-center justify-between shadow-md min-w-0 overflow-x-hidden">
      <div className="flex items-center flex-grow overflow-hidden gap-x-2">
        {isMobile ? (
          <Button
            type="text"
            icon={<MessageOutlined />} // Icon for showing sessions on mobile
            onClick={onShowMobileSessionList}
            className="mr-2 flex-shrink-0" // Ensure flex-shrink-0 is present
          />
        ) : (
          <Button
            type="text"
            icon={isSidebarOpen ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />}
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="mr-2 flex-shrink-0" // Ensure flex-shrink-0 is present
          />
        )}
        <h1 className="text-lg sm:text-xl font-semibold mb-0 mt-0 overflow-hidden text-ellipsis"> {/* Changed text-xl to responsive text-lg sm:text-xl */}
          {activeSession ? activeSession.title : 'Loading...'}
        </h1>
        {activeSession && (
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={showEditModal}
            className="ml-2 flex-shrink-0" // Added flex-shrink-0
          />
        )}
      </div>
      {isLoggedIn ? (
        <Button type="primary" danger onClick={handleLogout} className="text-sm px-2 py-1 flex-shrink-0"> {/* Added compact styles and flex-shrink-0 */}
          Logout
        </Button>
      ) : (
        <Button type="primary" onClick={() => router.push('/login')} className="text-sm px-2 py-1 flex-shrink-0"> {/* Added compact styles and flex-shrink-0 */}
          Login
        </Button>
      )}
    </header>
  );
}
