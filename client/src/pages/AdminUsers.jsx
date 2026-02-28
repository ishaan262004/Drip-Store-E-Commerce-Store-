import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { HiOutlineUsers, HiOutlineCheckBadge, HiOutlineMagnifyingGlass } from 'react-icons/hi2';
import { getAdminUsers } from '../services/api';

export default function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        document.title = 'Users — Admin Dashboard';
        fetchUsers();
    }, []);

    useEffect(() => {
        if (!search.trim()) {
            setFiltered(users);
        } else {
            const q = search.toLowerCase();
            setFiltered(users.filter((u) =>
                u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q)
            ));
        }
    }, [search, users]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const { data } = await getAdminUsers();
            if (data.success) setUsers(data.users);
        } catch (err) {
            toast.error('Failed to load users');
            if (err.response?.status === 403) navigate('/');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-2 border-primary-light border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-black">Users</h1>
                    <p className="text-sm text-text-secondary">{users.length} registered users</p>
                </div>
                <div className="relative">
                    <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search users..."
                        className="pl-9 pr-4 py-2 rounded-xl bg-surface-card border border-border text-sm focus:border-primary focus:outline-none w-56"
                    />
                </div>
            </div>

            <div className="rounded-2xl bg-surface-card border border-border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-border">
                                <th className="text-left px-5 py-3 text-xs font-semibold text-text-secondary tracking-wider">User</th>
                                <th className="text-left px-5 py-3 text-xs font-semibold text-text-secondary tracking-wider hidden sm:table-cell">Email</th>
                                <th className="text-center px-5 py-3 text-xs font-semibold text-text-secondary tracking-wider">Role</th>
                                <th className="text-right px-5 py-3 text-xs font-semibold text-text-secondary tracking-wider">Orders</th>
                                <th className="text-right px-5 py-3 text-xs font-semibold text-text-secondary tracking-wider hidden md:table-cell">Spent</th>
                                <th className="text-right px-5 py-3 text-xs font-semibold text-text-secondary tracking-wider hidden lg:table-cell">Joined</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filtered.map((user) => (
                                <tr key={user._id} className="hover:bg-surface/50 transition-colors">
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold flex-shrink-0">
                                                {user.name?.[0]?.toUpperCase() || '?'}
                                            </div>
                                            <span className="font-medium truncate max-w-[120px]">{user.name || 'Unknown'}</span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 text-text-secondary hidden sm:table-cell">
                                        <span className="truncate">{user.email}</span>
                                    </td>
                                    <td className="px-5 py-4 text-center">
                                        {user.isAdmin ? (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 text-white text-xs font-semibold">
                                                <HiOutlineCheckBadge className="w-3.5 h-3.5" /> Admin
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface text-text-secondary text-xs font-medium border border-border">
                                                <HiOutlineUsers className="w-3.5 h-3.5" /> User
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-5 py-4 text-right font-semibold">{user.orderCount}</td>
                                    <td className="px-5 py-4 text-right text-text-secondary hidden md:table-cell">
                                        ${user.totalSpent?.toFixed(2) || '0.00'}
                                    </td>
                                    <td className="px-5 py-4 text-right text-text-secondary text-xs hidden lg:table-cell">
                                        {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </td>
                                </tr>
                            ))}
                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="text-center py-16 text-text-secondary">
                                        No users found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
