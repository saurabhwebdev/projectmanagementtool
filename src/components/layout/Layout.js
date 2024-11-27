import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  ChartBarIcon, 
  FolderIcon, 
  CheckCircleIcon, 
  CogIcon,
  QuestionMarkCircleIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import Help from '../../pages/Help';
import { AnimatePresence } from 'framer-motion';

// SidebarLink component
function SidebarLink({ icon, text, to, onClick }) {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  // If onClick is provided, use it instead of Link
  if (onClick) {
    return (
      <button 
        onClick={onClick}
        className={`flex items-center space-x-2 p-2 rounded-md transition-colors w-full ${
          isActive 
            ? 'bg-blue-50 text-blue-600' 
            : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
        }`}
      >
        {icon}
        <span>{text}</span>
      </button>
    );
  }
  
  return (
    <Link 
      to={to} 
      className={`flex items-center space-x-2 p-2 rounded-md transition-colors ${
        isActive 
          ? 'bg-blue-50 text-blue-600' 
          : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
      }`}
    >
      {icon}
      <span>{text}</span>
    </Link>
  );
}

// Sidebar Component
function Sidebar({ onHelpClick }) {
  const { logout, currentUser } = useAuth();

  if (!currentUser) return null;

  const getNavigationItems = () => {
    const items = [
      {
        icon: <ChartBarIcon className="w-5 h-5" />,
        text: "Dashboard",
        to: "/",
        roles: ['admin', 'project_manager', 'developer', 'stakeholder']
      },
      {
        icon: <FolderIcon className="w-5 h-5" />,
        text: "Projects",
        to: "/projects",
        roles: ['admin', 'project_manager', 'developer']
      },
      {
        icon: <CheckCircleIcon className="w-5 h-5" />,
        text: "Tasks",
        to: "/tasks",
        roles: ['admin', 'project_manager', 'developer']
      },
      {
        icon: <CogIcon className="w-5 h-5" />,
        text: "Settings",
        to: "/settings",
        roles: ['admin']
      },
      {
        icon: <QuestionMarkCircleIcon className="w-5 h-5" />,
        text: "Help",
        onClick: onHelpClick,
        roles: ['admin', 'project_manager', 'developer', 'stakeholder']
      }
    ];

    return items.filter(item => item.roles.includes(currentUser?.role));
  };

  return (
    <div className="w-64 h-screen bg-white border-r border-gray-200 fixed left-0 top-0 p-4">
      <h1 className="text-xl font-bold text-blue-600 mb-8">ProjectTool</h1>
      <nav className="space-y-2">
        {getNavigationItems().map((item) => (
          <SidebarLink
            key={item.text}
            icon={item.icon}
            text={item.text}
            to={item.to}
            onClick={item.onClick}
          />
        ))}
      </nav>
      <button
        onClick={logout}
        className="absolute bottom-4 left-4 right-4 px-4 py-2 text-gray-700 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
      >
        Sign Out
      </button>
    </div>
  );
}

// FloatingHelpButton Component
function FloatingHelpButton({ onClick }) {
  const location = useLocation();
  
  // Don't show on the help page itself
  if (location.pathname === '/help') return null;
  
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 bg-blue-600 text-white rounded-full p-3 shadow-lg hover:bg-blue-700 transition-colors"
      title="Need help?"
    >
      <QuestionMarkCircleIcon className="h-6 w-6" />
    </button>
  );
}

// Layout Component
const Layout = ({ children }) => {
  const { currentUser } = useAuth();
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const handleHelpClick = () => {
    setIsHelpOpen(true);
  };

  if (isAuthPage) {
    return <div className="min-h-screen bg-gray-50">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar onHelpClick={handleHelpClick} />
      <div className={currentUser ? "ml-64 p-8" : "p-8"}>
        {children}
      </div>
      <FloatingHelpButton onClick={handleHelpClick} />

      <AnimatePresence>
        {isHelpOpen && (
          <Help 
            isOpen={isHelpOpen} 
            onClose={() => setIsHelpOpen(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Layout;