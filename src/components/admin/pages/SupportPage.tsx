'use client';

import { useState, useEffect } from 'react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Mail, MessageSquare, User, Clock, Reply, CheckCircle2 } from 'lucide-react';
import { fetchSupportMessages, replyToSupport } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';

export default function SupportPage() {
  const { token } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [replyText, setReplyText] = useState('');
  const [isSending, setIsSending] = useState(false);

  const load = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await fetchSupportMessages(token, 1, 50);
      setMessages(data.results);
    } catch (err) {
      console.error('Failed to load support messages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [token]);

  const handleReply = async () => {
    if (!token || !selectedMessage || !replyText || isSending) return;
    setIsSending(true);
    try {
      await replyToSupport(token, selectedMessage.id, replyText);
      setReplyText('');
      setSelectedMessage(null);
      await load();
    } catch (err) {
      alert('Failed to send reply');
    } finally {
      setIsSending(false);
    }
  };

  const columns = [
    {
      header: 'Customer',
      accessor: (m: any) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center border border-zinc-200 dark:border-zinc-700">
            <User className="w-4 h-4 text-zinc-500" />
          </div>
          <div>
            <p className="font-bold text-zinc-900 dark:text-white leading-tight">
              {m.user?.first_name} {m.user?.last_name}
            </p>
            <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider mt-0.5">
              {m.user?.email}
            </p>
          </div>
        </div>
      )
    },
    {
      header: 'Inquiry',
      accessor: (m: any) => (
        <div className="max-w-md">
          <p className="text-xs font-medium text-zinc-600 dark:text-zinc-300 truncate italic">
            "{m.message}"
          </p>
          <div className="flex items-center gap-1.5 mt-1 text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
            <Clock className="w-3 h-3" />
            {new Date(m.created_at).toLocaleDateString()}
          </div>
        </div>
      )
    },
    {
      header: 'Status',
      accessor: (m: any) => (
        <Badge variant={m.reply ? 'success' : 'warning'}>
          {m.reply ? 'Resolved' : 'Pending'}
        </Badge>
      )
    },
    {
      header: '',
      accessor: (m: any) => (
        <div className="flex justify-end">
          <Button 
            variant={m.reply ? 'secondary' : 'primary'} 
            size="sm" 
            onClick={() => setSelectedMessage(m)}
          >
            {m.reply ? 'View Log' : 'Write Reply'}
          </Button>
        </div>
      ),
      className: 'text-right'
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-zinc-100 dark:border-zinc-800 text-zinc-400">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Customer Inquiries</h3>
              <p className="text-xs text-zinc-500">Respond to user support tickets and feedback.</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <LoadingSpinner />
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Fetching Tickets</span>
          </div>
        ) : (
          <DataTable 
            data={messages} 
            columns={columns} 
            emptyMessage="All clear! No pending support requests."
          />
        )}
      </div>

      <Modal
        isOpen={!!selectedMessage}
        onClose={() => setSelectedMessage(null)}
        title={selectedMessage?.reply ? "Ticket Resolution Log" : "Reply to Customer"}
      >
        {selectedMessage && (
          <div className="space-y-6">
            <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800">
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Customer Inquiry</p>
              <p className="text-sm font-medium text-zinc-900 dark:text-white leading-relaxed italic">
                "{selectedMessage.message}"
              </p>
            </div>

            {selectedMessage.reply ? (
              <div className="bg-zinc-950 dark:bg-white p-4 rounded-xl shadow-lg">
                <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-2">Administrative Reply</p>
                <p className="text-sm font-medium text-white dark:text-zinc-950 leading-relaxed">
                  {selectedMessage.reply}
                </p>
                <div className="mt-4 flex items-center gap-1.5 text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                  <CheckCircle2 className="w-3 h-3" />
                  Sent {new Date(selectedMessage.replied_at || Date.now()).toLocaleDateString()}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-1">Resolution Message</label>
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="w-full h-32 p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-zinc-950 dark:focus:ring-white transition-all dark:text-zinc-100 resize-none"
                    placeholder="Type your response to the customer..."
                  />
                </div>
                <div className="flex gap-3 justify-end">
                  <Button variant="secondary" onClick={() => setSelectedMessage(null)}>Cancel</Button>
                  <Button onClick={handleReply} loading={isSending}>
                    <Reply className="w-4 h-4 mr-2" />
                    Send Resolution
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
