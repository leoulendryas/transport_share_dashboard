'use client';

import { useState } from 'react';
import Button from '../ui/Button';
import { Ride } from '@/types/user';

interface RideTableProps {
  rides: Ride[];
  onCancel: (rideId: number) => void;
  currentPage: number;
  total: number;
  onPageChange: (page: number) => void;
}

const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  full: 'bg-blue-100 text-blue-800',
  ongoing: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-purple-100 text-purple-800',
  cancelled: 'bg-red-100 text-red-800',
  disputed: 'bg-orange-100 text-orange-800',
};

const RideTable: React.FC<RideTableProps> = ({ rides, onCancel }) => {
  const [selectedRide, setSelectedRide] = useState<Ride | null>(null);
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ride Info
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Driver
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Passengers
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rides.map((ride) => (
              <tr key={ride.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {ride.from_address} → {ride.to_address}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatDate(ride.departure_time)}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {ride.driver?.first_name} {ride.driver?.last_name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {ride.plate_number} · {ride.brand_name}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    statusColors[ride.status] || 'bg-gray-100 text-gray-800'
                  }`}>
                    {ride.status.charAt(0).toUpperCase() + ride.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {ride.participants ? ride.participants.filter(p => !p.is_driver).length : 0} / {ride.total_seats - 1}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <Button 
                      variant="outline" 
                      onClick={() => setSelectedRide(ride)}
                    >
                      View
                    </Button>
                    {ride.status === 'active' && (
                      <Button 
                        variant="danger"
                        onClick={() => onCancel(ride.id)}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {rides.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No rides found
          </div>
        )}
      </div>
      
      {/* Ride Detail Modal */}
      {selectedRide && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <h3 className="text-xl font-bold text-gray-800">Ride Details</h3>
                <button 
                  onClick={() => setSelectedRide(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <span className="material-icons">close</span>
                </button>
              </div>
              
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Route Information</h4>
                  <div className="mt-2 space-y-2">
                    <p><span className="font-medium">From:</span> {selectedRide.from_address}</p>
                    <p><span className="font-medium">To:</span> {selectedRide.to_address}</p>
                    <p><span className="font-medium">Departure:</span> {formatDate(selectedRide.departure_time)}</p>
                    <p><span className="font-medium">Price per seat:</span> ETB {selectedRide.price_per_seat?.toFixed(2)}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Vehicle Information</h4>
                  <div className="mt-2 space-y-2">
                    <p><span className="font-medium">Plate Number:</span> {selectedRide.plate_number}</p>
                    <p><span className="font-medium">Brand:</span> {selectedRide.brand_name}</p>
                    <p><span className="font-medium">Color:</span> {selectedRide.color}</p>
                    <p>
                      <span className="font-medium">Seats:</span> 
                      {selectedRide.seats_available} available · 
                      {selectedRide.total_seats} total
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-500">Participants</h4>
                <div className="mt-2 bg-gray-50 rounded-lg p-4">
                  {selectedRide.participants && selectedRide.participants.length > 0 ? (
                    <ul className="divide-y divide-gray-200">
                      {selectedRide.participants.map(participant => (
                        <li key={participant.id} className="py-2 flex items-center">
                          <div className="bg-gray-200 border-2 border-dashed rounded-xl w-8 h-8" />
                          <div className="ml-3">
                            <p className="text-sm font-medium">
                              {participant.first_name} {participant.last_name}
                              {participant.is_driver && (
                                <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded">
                                  Driver
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-gray-500">{participant.email}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 text-center py-4">No participants</p>
                  )}
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <Button 
                  variant="secondary"
                  onClick={() => setSelectedRide(null)}
                >
                  Close
                </Button>
                {selectedRide.status === 'active' && (
                  <Button 
                    variant="danger"
                    onClick={() => {
                      onCancel(selectedRide.id);
                      setSelectedRide(null);
                    }}
                  >
                    Cancel Ride
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RideTable;