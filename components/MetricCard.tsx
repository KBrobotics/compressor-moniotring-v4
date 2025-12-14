import React from 'react';

interface MetricCardProps {
  label: string;
  value?: number; // Value is now optional
  unit: string;
  min: number;
  max: number;
  icon?: React.ReactNode;
  warning?: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({ label, value, unit, min, max, icon, warning }) => {
  // Handle missing data (signal lost or not yet received)
  const hasData = value !== undefined && value !== null && !isNaN(value);

  // Calculate percentage only if data exists
  const percentage = hasData 
    ? Math.min(100, Math.max(0, ((value! - min) / (max - min)) * 100))
    : 0;
  
  const valueColor = warning 
    ? 'text-industrial-danger' 
    : 'text-industrial-accent';

  const barColor = warning
    ? 'bg-industrial-danger'
    : 'bg-industrial-accent';

  return (
    <div className="bg-industrial-800 rounded-lg p-4 shadow-lg border border-industrial-700 flex flex-col justify-between opacity-95 hover:opacity-100 transition-opacity">
      <div className="flex justify-between items-start mb-2">
        <span className="text-gray-400 text-sm font-semibold uppercase tracking-wider">{label}</span>
        {icon && <div className="text-gray-500">{icon}</div>}
      </div>
      
      <div className="flex items-baseline space-x-2 h-10">
        {hasData ? (
          <>
            <span className={`text-3xl font-mono font-bold ${valueColor} transition-all duration-300`}>
              {value!.toFixed(1)}
            </span>
            <span className="text-gray-400 text-sm font-medium">{unit}</span>
          </>
        ) : (
          <span className="text-3xl font-mono font-bold text-gray-600">---</span>
        )}
      </div>

      <div className="w-full bg-industrial-900 h-2 rounded-full mt-3 overflow-hidden">
        <div 
          className={`h-full ${barColor} transition-all duration-500 ease-out`} 
          style={{ width: `${percentage}%`, opacity: hasData ? 1 : 0.3 }}
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
