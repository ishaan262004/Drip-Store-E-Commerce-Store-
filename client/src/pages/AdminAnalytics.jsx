import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    HiOutlineCurrencyDollar, HiOutlineShoppingBag, HiOutlineUsers,
    HiOutlineCube, HiOutlineClock, HiOutlineTruck, HiOutlineCheckCircle, HiOutlineXCircle,
} from 'react-icons/hi2';
import { getAdminStats } from '../services/api';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const STATUS_CONFIG = {
    Processing: { color: 'bg-yellow-500', icon: HiOutlineClock, label: 'Processing' },
    Shipped: { color: 'bg-blue-500', icon: HiOutlineTruck, label: 'Shipped' },
    Delivered: { color: 'bg-green-500', icon: HiOutlineCheckCircle, label: 'Delivered' },
    Cancelled: { color: 'bg-red-500', icon: HiOutlineXCircle, label: 'Cancelled' },
};

function StatCard({ icon: Icon, label, value, sub }) {
    return (
        <div className="rounded-2xl bg-surface-card border border-border p-5 flex items-start gap-4">
            <div className="p-3 rounded-xl bg-white/5 border border-border flex-shrink-0">
                <Icon className="w-6 h-6 text-text-secondary" />
            </div>
            <div>
                <p className="text-xs text-text-secondary font-medium">{label}</p>
                <p className="text-2xl font-black mt-0.5">{value}</p>
                {sub && <p className="text-xs text-text-secondary mt-0.5">{sub}</p>}
            </div>
        </div>
    );
}

export default function AdminAnalytics() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        document.title = 'Analytics — Admin Dashboard';
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const { data } = await getAdminStats();
            if (data.success) setStats(data.stats);
        } catch (err) {
            toast.error('Failed to load analytics');
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

    if (!stats) return null;

    const totalOrdersForStatus = Object.values(stats.statusBreakdown || {}).reduce((a, b) => a + b, 0) || 1;

    // Build 6-month chart data
    const now = new Date();
    const months = Array.from({ length: 6 }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
        return { year: d.getFullYear(), month: d.getMonth() + 1, label: MONTH_NAMES[d.getMonth()] };
    });
    const maxRevenue = Math.max(...months.map((m) => {
        const found = stats.monthlyRevenue?.find((r) => r._id.year === m.year && r._id.month === m.month);
        return found?.revenue || 0;
    }), 1);

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-black">Analytics</h1>
                    <p className="text-sm text-text-secondary">Store performance overview</p>
                </div>
                <button onClick={fetchStats} className="px-4 py-2 rounded-xl bg-surface-card border border-border text-sm hover:border-primary/30 transition">
                    Refresh
                </button>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard icon={HiOutlineCurrencyDollar} label="Total Revenue" value={`$${stats.totalRevenue?.toFixed(2)}`} sub="From paid orders" />
                <StatCard icon={HiOutlineShoppingBag} label="Total Orders" value={stats.totalOrders} sub={`${stats.pendingCount} pending`} />
                <StatCard icon={HiOutlineUsers} label="Total Users" value={stats.totalUsers} />
                <StatCard icon={HiOutlineCube} label="Products" value={stats.totalProducts} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Order Status Breakdown */}
                <div className="rounded-2xl bg-surface-card border border-border p-5">
                    <h2 className="text-base font-bold mb-4">Order Status</h2>
                    <div className="space-y-3">
                        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
                            const count = stats.statusBreakdown?.[key] || 0;
                            const pct = Math.round((count / totalOrdersForStatus) * 100);
                            const Icon = cfg.icon;
                            return (
                                <div key={key}>
                                    <div className="flex items-center justify-between text-sm mb-1">
                                        <span className="flex items-center gap-2 text-text-secondary">
                                            <Icon className="w-4 h-4" /> {cfg.label}
                                        </span>
                                        <span className="font-semibold">{count} <span className="text-text-secondary font-normal text-xs">({pct}%)</span></span>
                                    </div>
                                    <div className="h-1.5 rounded-full bg-surface overflow-hidden">
                                        <div className={`h-full rounded-full ${cfg.color} transition-all`} style={{ width: `${pct}%` }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Monthly Revenue Chart */}
                <div className="rounded-2xl bg-surface-card border border-border p-5">
                    <h2 className="text-base font-bold mb-4">Revenue (Last 6 Months)</h2>
                    <div className="flex items-end gap-2 h-32">
                        {months.map((m) => {
                            const found = stats.monthlyRevenue?.find((r) => r._id.year === m.year && r._id.month === m.month);
                            const revenue = found?.revenue || 0;
                            const heightPct = (revenue / maxRevenue) * 100;
                            return (
                                <div key={`${m.year}-${m.month}`} className="flex-1 flex flex-col items-center gap-1">
                                    <div className="w-full flex items-end justify-center" style={{ height: '100px' }}>
                                        <div
                                            className="w-full rounded-t-lg bg-white/80 transition-all hover:bg-white cursor-default"
                                            style={{ height: `${Math.max(heightPct, 2)}%` }}
                                            title={`$${revenue.toFixed(2)}`}
                                        />
                                    </div>
                                    <span className="text-[10px] text-text-secondary">{m.label}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Top Products */}
            <div className="rounded-2xl bg-surface-card border border-border p-5">
                <h2 className="text-base font-bold mb-4">Top Selling Products</h2>
                {stats.topProducts?.length === 0 ? (
                    <p className="text-text-secondary text-sm text-center py-8">No order data yet</p>
                ) : (
                    <div className="space-y-3">
                        {stats.topProducts?.map((p, i) => (
                            <div key={p._id} className="flex items-center gap-4">
                                <span className="text-2xl font-black text-text-secondary/30 w-6 text-center">{i + 1}</span>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm truncate">{p.name || 'Unknown Product'}</p>
                                    <p className="text-xs text-text-secondary">{p.totalQty} units sold</p>
                                </div>
                                <span className="font-bold text-sm flex-shrink-0">${p.totalRevenue?.toFixed(2)}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
