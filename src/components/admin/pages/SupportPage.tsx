/*
'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
// Replace with your actual API functions
import { fetchSupportMessages, replyToSupport } from '@/lib/api';

type SupportMessage = {
  id: number;
  user?: { first_name: string };
  message: string;
  reply?: string;
  replied_at?: string;
};

type PaginatedSupport = {
  results: SupportMessage[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
  };
};

export default function SupportPage() {
  const { token, refreshAuthToken } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pageSize: 5,
  });
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const loadMessages = async (page = 1): Promise<void> => {
    if (!token) return;
    setIsLoading(true);
    try {
      const data: PaginatedSupport = await fetchSupportMessages(token, page, pagination.pageSize);
      if (!mountedRef.current) return;
      setMessages(data.results);
      setPagination(prev => ({
        ...prev,
        page,
        total: data.pagination.total,
      }));
    } catch (err: any) {
      if (err?.message?.includes('401')) {
        const newToken = await refreshAuthToken();
        if (newToken) return loadMessages(page);
      }
      console.error('Failed to load support messages', err);
    } finally {
      if (mountedRef.current) setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) loadMessages(1);
  }, [token]);

  const handleReply = async (messageId: number): Promise<void> => {
    if (!token || !replyText.trim()) return;
    try {
      await replyToSupport(token, messageId, replyText.trim());
      setMessages(prev =>
        prev.map(m =>
          m.id === messageId
            ? { ...m, reply: replyText.trim(), replied_at: new Date().toISOString() }
            : m
        )
      );
      setReplyingTo(null);
      setReplyText('');
    } catch (err: any) {
      if (err?.message?.includes('401')) {
        const newToken = await refreshAuthToken();
        if (newToken) return handleReply(messageId);
      }
      console.error('Reply failed', err);
      alert('Failed to send reply. Check console for details.');
    }
  };

  const totalPages = Math.ceil(pagination.total / pagination.pageSize);

  if (isLoading) {
    return (
      <div className="w-full flex items-center justify-center py-10">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Support Messages</h2>

      <div className="bg-white rounded-xl shadow p-4">
        {messages.length === 0 ? (
          <div className="py-8 text-center text-gray-500">No support messages</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-sm text-gray-500 border-b">
                  <th className="py-3 px-2">#</th>
                  <th className="py-3 px-2">User</th>
                  <th className="py-3 px-2">Message</th>
                  <th className="py-3 px-2">Reply</th>
                  <th className="py-3 px-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {messages.map((msg, idx) => (
                  <tr key={msg.id} className="border-b align-top">
                    <td className="py-3 px-2">{(pagination.page - 1) * pagination.pageSize + idx + 1}</td>
                    <td className="py-3 px-2">{msg.user?.first_name || 'Unknown'}</td>
                    <td className="py-3 px-2">{msg.message}</td>
                    <td className="py-3 px-2">
                      {msg.reply ? (
                        <div>
                          <p>{msg.reply}</p>
                          <small className="text-gray-400">
                            {msg.replied_at ? new Date(msg.replied_at).toLocaleString() : ''}
                          </small>
                        </div>
                      ) : (
                        <span className="text-gray-400">No reply yet</span>
                      )}
                    </td>
                    <td className="py-3 px-2">
                      {replyingTo === msg.id ? (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            className="border rounded-md px-2 py-1 text-sm w-full"
                            value={replyText}
                            onChange={e => setReplyText(e.target.value)}
                            placeholder="Type reply..."
                          />
                          <button
                            onClick={() => handleReply(msg.id)}
                            className="px-3 py-1 rounded-md bg-blue-600 text-white text-sm"
                          >
                            Send
                          </button>
                          <button
                            onClick={() => {
                              setReplyingTo(null);
                              setReplyText('');
                            }}
                            className="px-3 py-1 rounded-md bg-gray-300 text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        !msg.reply && (
                          <button
                            onClick={() => setReplyingTo(msg.id)}
                            className="px-3 py-1 rounded-md bg-green-600 text-white text-sm"
                          >
                            Reply
                          </button>
                        )
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center mt-4 gap-2">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => loadMessages(i + 1)}
                className={`px-3 py-1 rounded-md text-sm ${
                  pagination.page === i + 1
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
*/