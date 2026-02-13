'use client';

import { useState, useEffect } from 'react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Building2, Plus, Trash2, Building, Globe, Mail, Phone, MoreHorizontal } from 'lucide-react';
import { getCompanies, createCompany, deleteCompany } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export default function CompaniesPage() {
  const { token } = useAuth();
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const fetchCompanies = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await getCompanies(token);
      setCompanies(data || []);
    } catch (error) {
      console.error('Failed to fetch companies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, [token]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !newCompanyName) return;
    setIsAdding(true);
    try {
      await createCompany(token, newCompanyName);
      setNewCompanyName('');
      fetchCompanies();
    } catch (error) {
      alert('Failed to add company');
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!token || !window.confirm('Delete this company partner?')) return;
    try {
      await deleteCompany(token, id);
      fetchCompanies();
    } catch (error) {
      alert('Failed to delete company');
    }
  };

  if (loading && companies.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center py-20 gap-4">
        <LoadingSpinner size="lg" />
        <p className="text-slate-400 font-medium animate-pulse">Loading partners...</p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm">
        <h3 className="text-xl font-bold text-slate-900 mb-6">Register New Partner</h3>
        <form onSubmit={handleCreate} className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative group">
            <Building className="w-5 h-5 absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
            <input
              type="text"
              value={newCompanyName}
              onChange={(e) => setNewCompanyName(e.target.value)}
              className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-transparent focus:bg-white focus:border-blue-600 rounded-2xl outline-none transition-all font-bold text-slate-900"
              placeholder="Partner Company Name"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isAdding}
            className="px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black shadow-xl shadow-blue-900/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {isAdding ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Plus className="w-5 h-5" />}
            Register
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {companies.map((company) => (
          <div key={company.id} className="bg-white rounded-[2rem] border border-slate-100 p-8 hover:shadow-xl transition-all group relative">
            <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-600 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors mb-6 border border-slate-100">
              <Building2 className="w-8 h-8" />
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-xl font-bold text-slate-900 tracking-tight">{company.name}</h4>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">ID: #{company.id}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
                  <Globe className="w-4 h-4" /> Partner Network
                </div>
                <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
                   <Mail className="w-4 h-4" /> support@{company.name.toLowerCase().replace(/\s/g, '')}.com
                </div>
              </div>

              <div className="pt-6 border-t border-slate-50 flex justify-between items-center">
                <button className="text-xs font-black uppercase text-blue-600 tracking-widest hover:underline">View Fleet</button>
                <button 
                  onClick={() => handleDelete(company.id)}
                  className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center hover:bg-rose-100 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {companies.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 bg-white rounded-[2rem] border border-dashed border-slate-200">
          <Building2 className="w-16 h-16 mb-4 opacity-10" />
          <p className="text-lg font-medium">No partners yet</p>
        </div>
      )}
    </div>
  );
}
