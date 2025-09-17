import React from 'react';

const StatsGrid = ({ stats }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    {stats.map((stat, index) => (
      <div key={index} className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:scale-105 transition-transform hover:shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <stat.icon className={`h-8 w-8 ${stat.color}`} />
          <span className={`text-sm font-medium px-2 py-1 rounded-full ${
            stat.change.startsWith('+') ? 'bg-emerald-100 text-emerald-700' :
            stat.change.startsWith('-') ? 'bg-red-100 text-red-700' :
            'bg-gray-100 text-gray-700'
          }`}>
            {stat.change}
          </span>
        </div>
        <h3 className="text-2xl font-bold text-gray-800 mb-1">{stat.value}</h3>
        <p className="text-gray-600 text-sm">{stat.title}</p>
      </div>
    ))}
  </div>
);

export default StatsGrid;
