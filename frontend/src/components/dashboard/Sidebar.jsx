import { Brain, User } from 'lucide-react';
import React, { useState } from 'react';

const Sidebar = ({ sidebarItems, activeTab, setActiveTab }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className={`${isHovered ? 'w-64' : 'w-16'} bg-white dark:bg-gray-800 shadow-lg fixed h-full z-10 transition-all duration-300 ease-in-out`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg flex-shrink-0">
            <Brain className="h-5 w-5 text-white" />
          </div>
          <div className={`transition-all duration-300 ${isHovered ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'}`}>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white whitespace-nowrap">NeuCom</h1>
            <p className="text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">AI-Powered Assistant</p>
          </div>
        </div>
      </div>
      
      <nav className="p-2 space-y-2">
        {sidebarItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`sidebar-item-collapsible w-full text-left ${activeTab === item.id ? 'active' : ''} ${isHovered ? 'expanded' : 'collapsed'}`}
            title={!isHovered ? item.label : ''}
          >
            <div className={`${isHovered ? 'space-x-3' : 'justify-center '} flex items-center`}>
              <item.icon className={`h-5 w-5 flex-shrink-0`} />
              <span className={`transition-all duration-300 whitespace-nowrap ${isHovered ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'}`}>
                {item.label}
              </span>
            </div>
          </button>
        ))}
      </nav>
      
      <div className="sidebar-bottom absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <button
          onClick={() => setActiveTab('profile')}
          className={`w-full flex items-center space-x-3 p-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 ${
            !isHovered ? 'justify-center' : ''
          }`}
          title={!isHovered ? 'Profile' : ''}
        >
          <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
            <User className="h-4 w-4 text-white" />
          </div>
          <div className={`transition-all duration-300 ${isHovered ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'}`}>
            <p className="text-sm font-medium text-gray-900 dark:text-white whitespace-nowrap">Administrator</p>
            <p className="text-xs text-gray-200 dark:text-gray-400 whitespace-nowrap">System Manager</p>
          </div>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
