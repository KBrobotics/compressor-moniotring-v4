import React from 'react';
import { CompressorTelemetry } from '../types';

interface CompressorVisualProps {
  status?: CompressorTelemetry['status'];
}

const CompressorVisual: React.FC<CompressorVisualProps> = ({ status }) => {
  
  let statusColor = 'bg-gray-500';
  let statusText = 'Nieznany';
  let animate = false;

  switch(status) {
    case 'RUNNING':
      statusColor = 'bg-industrial-success';
      statusText = 'PRACA';
      animate = true;
      break;
    case 'STOPPED':
    case 'IDLE':
      statusColor = 'bg-industrial-warning';
      statusText = 'POSTÓJ';
      break;
    case 'ALARM':
      statusColor = 'bg-industrial-danger';
      statusText = 'AWARIA';
      animate = true;
      break;
    default:
      // Case for undefined/null status
      statusColor = 'bg-gray-600';
      statusText = 'BRAK DANYCH';
      break;
  }

  return (
    <div className="relative w-full h-full min-h-[300px] bg-industrial-800 rounded-lg overflow-hidden border border-industrial-700 flex items-center justify-center group">
      {/* Background Image - Placeholder for a screw compressor */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-60 mix-blend-overlay transition-opacity duration-1000"
        style={{ backgroundImage: `url('https://picsum.photos/seed/compressor001/600/400')` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-industrial-900 to-transparent opacity-80" />

      {/* SVG Illustration of Screw Compressor Schematic (Simplified) */}
      <div className="relative z-10 p-6 flex flex-col items-center">
        <div className={`w-32 h-32 rounded-full border-4 ${status === 'ALARM' ? 'border-industrial-danger' : 'border-industrial-accent'} flex items-center justify-center mb-6 relative shadow-[0_0_30px_rgba(14,165,233,0.3)]`}>
             {/* Fan Animation */}
             <svg 
              className={`w-20 h-20 text-white ${animate && status === 'RUNNING' ? 'animate-spin' : ''}`} 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="1.5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18M3 12h18M5.636 5.636l12.728 12.728M5.636 18.364l12.728-12.728" />
            </svg>
            
            {/* Alarm Pulse */}
            {status === 'ALARM' && (
              <div className="absolute inset-0 rounded-full bg-industrial-danger opacity-20 animate-ping"></div>
            )}
        </div>

        <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-2 tracking-widest">SPRĘŻARKA ŚRUBOWA</h2>
            <div className={`inline-flex items-center px-4 py-1.5 rounded-full ${statusColor} text-industrial-900 font-bold text-sm shadow-lg`}>
              <span className={`w-2 h-2 rounded-full bg-industrial-900 mr-2 ${animate ? 'animate-pulse' : ''}`}></span>
              {statusText}
            </div>
        </div>
      </div>
      
      {/* Detail Overlay */}
      <div className="absolute bottom-4 left-4 right-4 bg-industrial-900/80 backdrop-blur p-3 rounded border border-industrial-700">
        <div className="flex justify-between items-center text-xs text-gray-400">
             <span>Model: S-Series 55kW</span>
             <span>ID: CMP-01-RASP</span>
        </div>
      </div>
    </div>
  );
};

export default CompressorVisual;
