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
    <header className="bg-white p-2 sm:p-4 flex items-center justify-between shadow-md w-full max-w-full overflow-hidden">
      <div className="flex items-center min-w-0 flex-1">
        {/* 菜单按钮 */}
        {isMobile ? (
          <Button
            type="text"
            icon={<MessageOutlined />}
            onClick={onShowMobileSessionList}
            className="flex-shrink-0 mr-2"
            size="small"
          />
        ) : (
          <Button
            type="text"
            icon={isSidebarOpen ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />}
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="flex-shrink-0 mr-2"
            size="small"
          />
        )}
        
        {/* 标题和编辑按钮的容器 */}
        <div className="flex items-center min-w-0 flex-1 mr-4">
          <h1 className="text-sm sm:text-lg font-semibold my-0 truncate min-w-0 flex-shrink mr-2">
            {activeSession ? activeSession.title : 'Loading...'}
          </h1>
          {activeSession && (
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={showEditModal}
              className="flex-shrink-0"
              size="small"
              title="编辑会话标题"
            />
          )}
        </div>
      </div>
      
      {/* 右侧登录/退出按钮 */}
      <div className="flex-shrink-0">
        {isLoggedIn ? (
          <Button 
            type="primary" 
            danger 
            onClick={handleLogout} 
            className="text-xs sm:text-sm px-2 py-1"
            size="small"
          >
            Logout
          </Button>
        ) : (
          <Button 
            type="primary" 
            onClick={() => router.push('/login')} 
            className="text-xs sm:text-sm px-2 py-1"
            size="small"
          >
            Login
          </Button>
        )}
      </div>
    </header>
  );
}
