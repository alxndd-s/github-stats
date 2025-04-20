import React from 'react';

interface AlertPopupProps {
  message: string;
  onClose: () => void;
  type?: 'info' | 'success' | 'warning' | 'error';
}

const AlertPopup: React.FC<AlertPopupProps> = ({ message, onClose, type = 'info' }) => {

  const getColorClasses = () => {
    switch (type) {
      case 'success':
        return 'bg-gradient-to-r from-green-600 to-emerald-600';
      case 'warning':
        return 'bg-gradient-to-r from-amber-600 to-yellow-600';
      case 'error':
        return 'bg-gradient-to-r from-red-600 to-rose-600';
      default:
        return 'bg-gradient-to-r from-blue-600 to-indigo-600';
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-900/80 backdrop-blur-sm p-4">
      <div className={`w-full max-w-md rounded-xl shadow-2xl overflow-hidden ${getColorClasses()}`}>
        <div className="p-5 text-white">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="text-lg font-medium mb-1">
                {type === 'info' && 'Informação'}
                {type === 'success' && 'Sucesso'}
                {type === 'warning' && 'Aviso'}
                {type === 'error' && 'Erro'}
              </h3>
              <p className="text-sm opacity-90">{message}</p>
            </div>
            <button
              onClick={onClose}
              className="ml-4 p-1 rounded-full hover:bg-white/10 transition-colors duration-200 focus:outline-none"
              aria-label="Fechar alerta"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium bg-white/10 hover:bg-white/20 rounded-lg transition-colors duration-200"
            >
              Entendido
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertPopup;