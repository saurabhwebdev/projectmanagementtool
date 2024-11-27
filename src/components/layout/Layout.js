import React from 'react';
import { Link } from 'react-router-dom';
import { ChartBarIcon, FolderIcon, CheckCircleIcon, CogIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';

// SidebarLink component
function SidebarLink({ icon, text, to }) {
  return (
    <Link 
      to={to} 
      className="flex items-center space-x-2 text-dark-gray hover:text-primary transition-colors"
    >
      {icon}
      <span>{text}</span>
    </Link>
  );
}

// Sidebar Component
function Sidebar() {
  const { logout, currentUser } = useAuth();

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
      }
    ];

    return items.filter(item => item.roles.includes(currentUser?.role));
  };

  return (
    <div className="w-64 h-screen bg-white border-r border-light-gray fixed left-0 top-0 p-4">
      <h1 className="text-xl font-bold text-primary mb-8">ProjectTool</h1>
      <nav className="space-y-4">
        {getNavigationItems().map((item) => (
          <SidebarLink
            key={item.to}
            icon={item.icon}
            text={item.text}
            to={item.to}
          />
        ))}
      </nav>
      <button
        onClick={logout}
        className="absolute bottom-4 left-4 right-4 btn-secondary"
      >
        Sign Out
      </button>
    </div>
  );
}

// Layout Component
const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-light-gray">
      <Sidebar />
      <div className="ml-64 p-8">
        {children}
      </div>
    </div>
  );
};

export default Layout; 