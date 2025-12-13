import React from 'react';

interface MetricCardProps {
  label: string;
  value: number;
  unit: string;
  min: number;
  max: number;
  icon?: React.ReactNode;
  warning?: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({ label, value, unit, min, max, icon, warning }) => {
  // Calculate percentage for a simple bar visual
  const percentage = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
  
  const valueColor = warning 
    ? 'text-industrial-danger' 
    : 'text-industrial-accent';

  const barColor = warning
    ? 'bg-industrial-danger'
    : 'bg-industrial-accent';

  return (
    <div className="bg-industrial-800 rounded-lg p-4 shadow-lg border border-industrial-700 flex flex-col justify-between">
      <div className="flex justify-between items-start mb-2">
        <span className="text-gray-400 text-sm font-semibold uppercase tracking-wider">{label}</span>
        {icon && <div className="text-gray-500">{icon}</div>}
      </div>
      
      <div className="flex items-baseline space-x-2">
        <span className={`text-3xl font-mono font-bold ${valueColor}`}>
          {value.toFixed(1)}
        </span>
        <span className="text-gray-400 text-sm font-medium">{unit}</span>
      </div>

      <div className="w-full bg-industrial-900 h-2 rounded-full mt-3 overflow-hidden">
        <div 
          className={`h-full ${barColor} transition-all duration-500 ease-out`} 
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      <div className="flex justify-between mt-1 text-xs text-gray-600">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
};

export default MetricCard;