import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CompressorTelemetry } from '../types';

interface HistoryChartProps {
  data: CompressorTelemetry[];
  dataKey: keyof CompressorTelemetry;
  color: string;
  unit: string;
  title: string;
}

const HistoryChart: React.FC<HistoryChartProps> = ({ data, dataKey, color, unit, title }) => {
  return (
    <div className="w-full h-full min-h-[200px] bg-industrial-800 rounded-lg p-4 border border-industrial-700 shadow-lg">
      <h3 className="text-gray-400 text-sm font-semibold uppercase mb-4">{title} Trend</h3>
      <div className="h-[160px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id={`color${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={color} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis 
              dataKey="timestamp" 
              hide={true} 
            />
            <YAxis 
              stroke="#94a3b8" 
              fontSize={10} 
              tickFormatter={(value) => `${value}`}
              domain={['auto', 'auto']}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
              itemStyle={{ color: '#f8fafc' }}
              labelFormatter={() => ''}
              formatter={(value: number) => [`${value} ${unit}`, title]}
            />
            <Area 
              type="monotone" 
              dataKey={dataKey} 
              stroke={color} 
              fillOpacity={1} 
              fill={`url(#color${dataKey})`} 
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default HistoryChart;