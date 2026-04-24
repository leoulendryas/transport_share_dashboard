'use client';

import { useState, useEffect } from 'react';
import { getReviews, deleteReview } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Review } from '@/types/user';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Star, Trash2, MessageSquare, Calendar, User } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function ReviewsPage() {
  const { token } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [minRating, setMinRating] = useState<number | undefined>(undefined);

  const loadReviews = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await getReviews(token, 1, 50, minRating);
      setReviews(data);
    } catch (error) {
      console.error('Failed to load reviews', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [token, minRating]);

  const handleDelete = async (id: number) => {
    if (!token || !confirm('Are you sure you want to delete this review? This action is permanent.')) return;
    try {
      await deleteReview(token, id);
      setReviews(prev => prev.filter(r => r.id !== id));
    } catch (error) {
      alert('Failed to delete review');
    }
  };

  const columns = [
    {
      header: 'Reviewer',
      accessor: (r: Review) => (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
            <User className="w-3 h-3 text-zinc-500" />
          </div>
          <span className="font-medium text-zinc-900 dark:text-zinc-100">{r.reviewer_name || `User #${r.reviewer_id}`}</span>
        </div>
      )
    },
    {
      header: 'Target',
      accessor: (r: Review) => (
        <span className="text-zinc-500">→ {r.reviewee_name || `User #${r.reviewee_id}`}</span>
      )
    },
    {
      header: 'Rating',
      accessor: (r: Review) => (
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star 
              key={i} 
              className={`w-3 h-3 ${i < r.rating ? 'fill-zinc-950 text-zinc-950 dark:fill-white dark:text-white' : 'text-zinc-200 dark:text-zinc-800'}`} 
            />
          ))}
        </div>
      )
    },
    {
      header: 'Comment',
      accessor: (r: Review) => (
        <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-md truncate italic">
          "{r.comment}"
        </p>
      )
    },
    {
      header: 'Date',
      accessor: (r: Review) => (
        <div className="flex items-center gap-1.5 text-zinc-400 text-[10px] font-medium">
          <Calendar className="w-3 h-3" />
          {new Date(r.created_at).toLocaleDateString()}
        </div>
      )
    },
    {
      header: 'Actions',
      accessor: (r: Review) => (
        <div className="flex justify-end">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => handleDelete(r.id)}
            className="text-zinc-400 hover:text-red-500 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between bg-white dark:bg-zinc-950 p-4 border border-zinc-200 dark:border-zinc-800 rounded-xl">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg">
            <Star className="w-3.5 h-3.5 text-zinc-400" />
            <select 
              value={minRating || ''} 
              onChange={(e) => setMinRating(e.target.value ? Number(e.target.value) : undefined)}
              className="bg-transparent text-xs font-bold text-zinc-600 dark:text-zinc-300 focus:outline-none cursor-pointer"
            >
              <option value="">All Ratings</option>
              <option value="4">4+ Stars</option>
              <option value="3">3+ Stars</option>
              <option value="2">2+ Stars</option>
              <option value="1">1+ Stars</option>
            </select>
          </div>
        </div>
        <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
          Showing {reviews.length} Recent Reviews
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <LoadingSpinner />
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 animate-pulse">Scanning Reputation Data</span>
          </div>
        ) : (
          <DataTable 
            data={reviews} 
            columns={columns} 
            emptyMessage="No reviews found matching your criteria."
          />
        )}
      </div>
    </div>
  );
}
