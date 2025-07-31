'use client';

import { useAuth } from '@/context/AuthContext';

interface HeaderProps {
  title: string;
  description: string;
}

const Header = ({ title, description }: HeaderProps) => {
  const { admin } = useAuth();
  
  return (
    <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
          <p className="text-gray-600 mt-1">{description}</p>
        </div>
        
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
  );
};

export default Header;