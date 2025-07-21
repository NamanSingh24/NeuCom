import React from 'react';
import { Brain, User } from 'lucide-react';

const Sidebar = ({ sidebarItems, activeTab, setActiveTab }) => (
  <div className="w-64 bg-white shadow-lg fixed h-full z-10">
    <div className="p-6 border-b border-gray-200">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
          <Brain className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-gray-900">SOP Interpreter</h1>
          <p className="text-xs text-gray-500">AI-Powered Assistant</p>
        </div>
      </div>
    </div>
    <nav className="p-4 space-y-2">
      {sidebarItems.map((item) => (
        <button
          key={item.id}
          onClick={() => setActiveTab(item.id)}
          className={`sidebar-item w-full text-left ${activeTab === item.id ? 'active' : ''}`}
        >
          <item.icon className="h-5 w-5" />
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
    <div className="absolute bottom-0 left-0 right-0 w-64 p-4 border-t border-gray-200 bg-white">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center">
          <User className="h-4 w-4 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900">Administrator</p>
          <p className="text-xs text-gray-500">System Manager</p>
        </div>
      </div>
    </div>
  </div>
);

export default Sidebar;
