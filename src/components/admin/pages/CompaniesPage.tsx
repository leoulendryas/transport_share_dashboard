'use client';

import { useState, useEffect } from 'react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Building2, Plus, Trash2, Search } from 'lucide-react';
import { getCompanies, createCompany, deleteCompany } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { DataTable } from '@/components/ui/DataTable';
import { Company } from '@/types/user';

export default function CompaniesPage() {
  const { token } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const load = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await getCompanies(token);
      setCompanies(data);
    } catch (error) {
      console.error('Failed to load companies', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [token]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !name || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      await createCompany(token, name);
      setName('');
      await load();
    } catch (error) {
      alert('Failed to add company');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!token || !confirm('Are you sure you want to delete this company?')) return;
    try {
      await deleteCompany(token, id);
      await load();
    } catch (error) {
      alert('Failed to delete company');
    }
  };

  const columns = [
    {
      header: 'Company Name',
      accessor: (c: Company) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
            <Building2 className="w-4 h-4 text-zinc-500" />
          </div>
          <span className="font-medium text-zinc-900 dark:text-zinc-100">{c.name}</span>
        </div>
      )
    },
    {
      header: 'ID',
      accessor: (c: Company) => <span className="text-zinc-500 text-xs">#{c.id}</span>
    },
    {
      header: 'Actions',
      accessor: (c: Company) => (
        <div className="flex justify-end">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => handleDelete(c.id)}
            className="text-zinc-400 hover:text-red-500 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-900">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Register New Partner</h3>
          <p className="text-xs text-zinc-500 mt-1">Add companies to map rides and manage corporate accounts.</p>
        </div>
        <form onSubmit={handleAdd} className="p-6 flex gap-4">
          <div className="relative flex-1">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input 
              value={name} 
              onChange={e => setName(e.target.value)} 
              placeholder="Enter company name..." 
              className="w-full pl-10 pr-4 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-950 dark:focus:ring-white transition-all"
              required 
            />
          </div>
          <Button type="submit" loading={isSubmitting}>
            <Plus className="w-4 h-4 mr-2" />
            Add Company
          </Button>
        </form>
      </div>

      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-900 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Active Partners</h3>
          <div className="text-xs text-zinc-500 font-medium">Total: {companies.length}</div>
        </div>
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <LoadingSpinner />
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Loading Directory</span>
          </div>
        ) : (
          <DataTable 
            data={companies} 
            columns={columns} 
            emptyMessage="No partner companies found."
          />
        )}
      </div>
    </div>
  );
}
