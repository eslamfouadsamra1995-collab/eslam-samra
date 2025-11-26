import React, { ReactNode } from 'react';

interface ChartCardProps {
  title: string;
  children: ReactNode;
}

const ChartCard: React.FC<ChartCardProps> = ({ title, children }) => {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-lg overflow-hidden flex flex-col h-96">
      <div className="px-4 py-3 border-b border-gray-700 bg-gray-800/50">
        <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">{title}</h3>
      </div>
      <div className="flex-1 p-4 min-h-0">
        {children}
      </div>
    </div>
  );
};

export default ChartCard;