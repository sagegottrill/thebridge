import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Download, Lock, Loader2, Table as TableIcon } from 'lucide-react';

interface WaitlistEntry {
    id: string;
    email: string;
    created_at: string;
    source?: string;
}

const Admin: React.FC = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [pin, setPin] = useState('');
    const [entries, setEntries] = useState<WaitlistEntry[]>([]);
    const [loading, setLoading] = useState(false);

    // Hardcoded PIN for simple protection
    const ADMIN_PIN = '1234';

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (pin === ADMIN_PIN) {
            setIsAuthenticated(true);
            fetchEntries();
        } else {
            alert('Incorrect PIN');
        }
    };

    const fetchEntries = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('waitlist')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setEntries(data || []);
        } catch (err) {
            console.error('Error fetching entries:', err);
            alert('Failed to load data.');
        } finally {
            setLoading(false);
        }
    };

    const downloadCSV = () => {
        const headers = ['ID', 'Email', 'Date', 'Source'];
        const csvContent = [
            headers.join(','),
            ...entries.map(e => [
                e.id,
                e.email,
                new Date(e.created_at).toLocaleString(),
                e.source || 'N/A'
            ].map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `the_bridge_waitlist_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center p-4">
                <form onSubmit={handleLogin} className="w-full max-w-sm flex flex-col gap-4 p-8 rounded-2xl glass">
                    <div className="flex justify-center mb-4">
                        <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center glow-border">
                            <Lock className="w-6 h-6 text-white" />
                        </div>
                    </div>
                    <h2 className="text-xl font-heading text-center text-white mb-2">Admin Access</h2>
                    <input
                        type="password"
                        value={pin}
                        onChange={(e) => setPin(e.target.value)}
                        placeholder="Enter PIN"
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-center text-white placeholder-white/20 outline-none focus:border-white/30 transition-all font-mono tracking-widest"
                        autoFocus
                    />
                    <button
                        type="submit"
                        className="w-full py-3 bg-white text-black font-semibold rounded-lg hover:bg-white/90 transition-all"
                    >
                        Unlock
                    </button>
                </form>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white p-6 md:p-12 font-body">
            <div className="max-w-6xl mx-auto">
                <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-10">
                    <div>
                        <h1 className="text-3xl font-heading font-bold mb-2">Waitlist Responses</h1>
                        <p className="text-white/40">Total entries: {entries.length}</p>
                    </div>
                    <button
                        onClick={downloadCSV}
                        className="flex items-center gap-2 px-6 py-3 bg-white text-black font-semibold rounded-lg hover:bg-white/90 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                    >
                        <Download className="w-4 h-4" />
                        <span>Export CSV</span>
                    </button>
                </header>

                <div className="rounded-2xl border border-white/10 overflow-hidden glass">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="w-8 h-8 animate-spin text-white/40" />
                        </div>
                    ) : entries.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-white/40">
                            <TableIcon className="w-12 h-12 mb-4 opacity-50" />
                            <p>No submissions yet.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-white/5 border-b border-white/10">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold text-sm text-white/60">Email</th>
                                        <th className="px-6 py-4 font-semibold text-sm text-white/60">Date</th>
                                        <th className="px-6 py-4 font-semibold text-sm text-white/60">Source</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {entries.map((entry) => (
                                        <tr key={entry.id} className="hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4 font-mono text-sm">{entry.email}</td>
                                            <td className="px-6 py-4 text-sm text-white/60">
                                                {new Date(entry.created_at).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-white/40">
                                                {entry.source || '-'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Admin;
