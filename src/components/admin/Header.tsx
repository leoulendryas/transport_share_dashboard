'use client';

import { useAuth } from '@/context/AuthContext';

interface HeaderProps {
  title: string;
  description: string;
  onRefresh?: () => void; // 👈 optional refresh handler
}

const Header = ({ title, description, onRefresh }: HeaderProps) => {
  const { admin } = useAuth();

  return (
    <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
          <p className="text-gray-600 mt-1">{description}</p>
        </div>

        <div className="flex items-center gap-4">
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Refresh
            </button>
          )}

          {admin && (
            <div className="flex items-center">
              <div className="mr-3 text-right">
                <p className="text-sm font-medium text-black">{admin.name}</p>
                <p className="text-xs text-gray-500">Administrator</p>
              </div>
              <div className="bg-gray-200 border-2 border-dashed rounded-xl w-10 h-10" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;
