import React, { useState, useEffect } from 'react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUrl: string;
  onSave: (url: string) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, currentUrl, onSave }) => {
  const [url, setUrl] = useState(currentUrl);

  useEffect(() => {
    setUrl(currentUrl);
  }, [currentUrl, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(url);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-industrial-800 border border-industrial-700 p-6 rounded-lg shadow-2xl w-full max-w-md">
        <h2 className="text-xl font-bold text-white mb-4 border-b border-industrial-700 pb-2">
          Ustawienia Połączenia
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="wsUrl" className="block text-gray-400 text-sm font-bold mb-2">
              Adres WebSocket (Node-RED)
            </label>
            <input
              id="wsUrl"
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="ws://localhost:1880/ws/compressor"
              className="w-full bg-industrial-900 text-white border border-industrial-700 rounded py-3 px-4 leading-tight focus:outline-none focus:border-industrial-accent focus:ring-1 focus:ring-industrial-accent font-mono"
            />
            <p className="text-xs text-gray-500 mt-2">
              Wprowadź pełny adres URL strumienia danych telemetrycznych.
            </p>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-transparent hover:bg-industrial-700 text-gray-300 font-semibold rounded transition-colors"
            >
              Anuluj
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-industrial-accent hover:bg-sky-600 text-white font-bold rounded shadow-lg transition-colors"
            >
              Zapisz i Połącz
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsModal;