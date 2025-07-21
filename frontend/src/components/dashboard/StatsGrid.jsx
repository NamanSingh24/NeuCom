import React from 'react';

const StatsGrid = ({ stats }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    {stats.map((stat, index) => (
      <div key={index} className="card-corporate p-6 hover:scale-105 transition-transform">
        <div className="flex items-center justify-between mb-4">
          <stat.icon className={`h-8 w-8 ${stat.color}`} />
          <span className={`text-sm font-medium px-2 py-1 rounded-full ${
            stat.change.startsWith('+') ? 'bg-green-100 text-green-800' :
            stat.change.startsWith('-') ? 'bg-red-100 text-red-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {stat.change}
          </span>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
        <p className="text-gray-600 text-sm">{stat.title}</p>
      </div>
    ))}
  </div>
);

export default StatsGrid;
