import { useState } from 'react';
import Button from '../ui/Button';
import { User } from '@/types/user';

interface VerificationCardProps {
  user: User;
  onVerify: (userId: number) => void;
  onReject: (userId: number) => void;
}

const VerificationCard: React.FC<VerificationCardProps> = ({ user, onVerify, onReject }) => {
  const [showModal, setShowModal] = useState(false);

  const imageUrl = user.id_image_url 
    ? `${user.id_image_url}`
    : null;

  return (
    <div className="bg-white rounded-xl shadow-sm p-5">
      <div className="flex items-start">
        <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
        
        <div className="ml-4 flex-1">
          <h3 className="font-medium text-gray-900">{user.first_name} {user.last_name}</h3>
          <p className="text-sm text-gray-500 mt-1">
            Joined {new Date(user.created_at).toLocaleDateString()}
          </p>
          
          <div className="mt-3 flex items-center">
            <span className="material-icons text-yellow-500 mr-1">schedule</span>
            <span className="text-sm text-yellow-600">Pending Verification</span>
          </div>
        </div>
      </div>
      
      <div className="mt-4">
        <h4 className="text-sm font-medium text-gray-500 mb-2">ID Document</h4>
        {imageUrl ? (
          <div className="bg-gray-100 rounded-lg p-4 flex justify-center">
            {imageUrl.endsWith('.pdf') ? (
              <div className="flex flex-col items-center">
                <span className="material-icons text-5xl text-red-500">picture_as_pdf</span>
                <a 
                  href={imageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 text-blue-500 hover:underline"
                >
                  View PDF Document
                </a>
              </div>
            ) : (
              <img
                src={imageUrl}
                alt="ID Document"
                className="max-w-full max-h-40 object-contain rounded-lg shadow-sm cursor-pointer"
                onClick={() => setShowModal(true)}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.style.display = 'none';
                }}
              />
            )}
          </div>
        ) : (
          <div className="bg-gray-100 rounded-lg p-4 flex justify-center items-center h-40">
            <p className="text-gray-500">No ID document uploaded</p>
          </div>
        )}
      </div>

      {/* Modal for full screen image */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 p-4">
          <div className="relative max-w-4xl w-full">
            <button
              className="absolute top-2 right-2 text-white text-3xl font-bold hover:text-gray-300"
              onClick={() => setShowModal(false)}
            >
              &times;
            </button>
            <img 
              src={imageUrl!} 
              alt="Full ID Document" 
              className="w-full h-auto rounded-lg shadow-lg object-contain"
            />
          </div>
        </div>
      )}

      <div className="mt-4 flex justify-between">
        <div>
          <p className="text-sm text-gray-500">User ID: {user.id}</p>
          <p className="text-sm text-gray-500">Email: {user.email}</p>
          {user.age && <p className="text-sm text-gray-500">Age: {user.age}</p>}
          {user.gender && <p className="text-sm text-gray-500">Gender: {user.gender}</p>}
        </div>
        
        <div className="flex space-x-2">
          <Button 
            variant="outline"
            onClick={() => onReject(user.id)}
          >
            Reject
          </Button>
          <Button 
            onClick={() => onVerify(user.id)}
          >
            Verify
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VerificationCard;
