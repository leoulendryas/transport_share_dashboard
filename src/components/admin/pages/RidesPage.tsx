'use client';

import { useState } from 'react';
import { Ride } from '@/types/user';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Car, MapPin, Calendar, Users, DollarSign, X as Cancel, Eye, MoreHorizontal } from 'lucide-react';

interface RideParticipant {
  first_name: string;
  last_name: string;
  email: string;
  is_driver?: boolean; // fixed optional driver flag
}

interface RidesPageProps {
  rides: Ride[];
  currentPage: number;
  total: number;
  onCancel: (rideId: number) => void;
  onPageChange: (page: number) => void;
  loading?: boolean;
}

const ITEMS_PER_PAGE = 10;

export default function RidesPage({ 
  rides, 
  currentPage, 
  total, 
  onCancel, 
  onPageChange, 
  loading = false 
}: RidesPageProps) {
  const [selectedRide, setSelectedRide] = useState<Ride | null>(null);

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);
  const statusColors = {
    active: 'bg-green-100 text-green-800',
    full: 'bg-blue-100 text-blue-800',
    ongoing: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-gray-100 text-gray-800',
    cancelled: 'bg-red-100 text-red-800',
    disputed: 'bg-orange-100 text-orange-800'
  };

  const handleCancel = (rideId: number) => {
    if (window.confirm('Are you sure you want to cancel this ride? This action cannot be undone.')) {
      onCancel(rideId);
    }
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return 'Flexible';
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" />
        <span className="ml-2 text-gray-600">Loading rides...</span>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Ride Management</h2>
          <p className="text-gray-600">Monitor and manage active rides</p>
        </div>
        <div className="text-sm text-gray-500">
          Page {currentPage} of {totalPages} • {total} total rides
        </div>
      </div>

      {rides.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <Car className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No rides found</h3>
          <p className="mt-1 text-sm text-gray-500">There are no rides matching your criteria.</p>
        </div>
      ) : (
        <>
          {/* Ride List */}
          <div className="grid gap-6">
            {rides.map((ride) => (
              <div key={ride.id} className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Ride Info */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Car className="h-6 w-6 text-blue-600" />
                        <h3 className="text-lg font-semibold text-gray-900">Ride #{ride.id}</h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[ride.status]}`}>
                          {ride.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">
                        Created: {new Date(ride.created_at).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <div>
                          <div className="text-sm font-medium">From</div>
                          <div className="text-sm text-gray-600">{ride.from_address}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <div>
                          <div className="text-sm font-medium">To</div>
                          <div className="text-sm text-gray-600">{ride.to_address}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <div>
                          <div className="text-sm font-medium">Departure</div>
                          <div className="text-sm text-gray-600">{formatDateTime(ride.departure_time)}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-400" />
                        <div>
                          <div className="text-sm font-medium">Seats</div>
                          <div className="text-sm text-gray-600">
                            {ride.seats_available} / {ride.total_seats} available
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-gray-400" />
                        <div>
                          <div className="text-sm font-medium">Price per seat</div>
                          <div className="text-sm text-gray-600">{ride.price_per_seat} Birr</div>
                        </div>
                      </div>

                      {ride.driver && (
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-gray-400" />
                          <div>
                            <div className="text-sm font-medium">Driver</div>
                            <div className="text-sm text-gray-600">
                              {ride.driver.first_name} {ride.driver.last_name}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Vehicle Info */}
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm font-medium text-gray-900">Vehicle Details</div>
                      <div className="text-sm text-gray-600">
                        {ride.brand_name} {ride.color} • Plate: {ride.plate_number}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => setSelectedRide(ride)}
                      className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </button>
                    
                    {ride.status === 'active' && (
                      <button
                        onClick={() => handleCancel(ride.id)}
                        className="inline-flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <Cancel className="h-4 w-4 mr-2" />
                        Cancel Ride
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6">
              <button
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = Math.max(1, currentPage - 2) + i;
                  if (page > totalPages) return null;
                  
                  return (
                    <button
                      key={page}
                      onClick={() => onPageChange(page)}
                      className={`px-3 py-2 border rounded-lg ${
                        page === currentPage
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'border-gray-300 text-gray-700'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Ride Details Modal */}
      {selectedRide && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold">Ride Details #{selectedRide.id}</h3>
              <button
                onClick={() => setSelectedRide(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <MoreHorizontal className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[selectedRide.status]}`}>
                    {selectedRide.status.toUpperCase()}
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">Price per Seat</label>
                  <div className="text-sm text-gray-900">{selectedRide.price_per_seat} Birr</div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">From</label>
                  <div className="text-sm text-gray-900">{selectedRide.from_address}</div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">To</label>
                  <div className="text-sm text-gray-900">{selectedRide.to_address}</div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">Departure Time</label>
                  <div className="text-sm text-gray-900">{formatDateTime(selectedRide.departure_time)}</div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">Seats</label>
                  <div className="text-sm text-gray-900">
                    {selectedRide.seats_available} / {selectedRide.total_seats} available
                  </div>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">Vehicle Details</label>
                <div className="text-sm text-gray-900">
                  {selectedRide.brand_name} • {selectedRide.color} • {selectedRide.plate_number}
                </div>
              </div>
              
              {selectedRide.participants && selectedRide.participants.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Participants</label>
                  <div className="space-y-2 mt-2">
                    {selectedRide.participants.map((participant, index) => (
                      <div key={index} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                        <div className="flex-shrink-0 h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 text-sm font-medium">
                            {participant.first_name[0]}{participant.last_name[0]}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium">
                            {participant.first_name} {participant.last_name}
                            {participant.is_driver && (
                              <span className="ml-2 text-xs text-blue-600">(Driver)</span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500">{participant.email}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
