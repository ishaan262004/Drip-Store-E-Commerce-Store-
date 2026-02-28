import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import {
    HiOutlineShoppingBag, HiOutlineChartBar, HiOutlineUsers,
    HiOutlineCube, HiOutlineArrowLeftOnRectangle, HiOutlineBars3,
    HiOutlineShieldCheck,
} from 'react-icons/hi2';

const navLinks = [
    { label: 'Orders', path: '/admin/orders', icon: HiOutlineShoppingBag },
    { label: 'Users', path: '/admin/users', icon: HiOutlineUsers },
    { label: 'Analytics', path: '/admin/analytics', icon: HiOutlineChartBar },
    { label: 'Products', path: '/admin/products', icon: HiOutlineCube },
];

export default function AdminDashboard() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, isLoaded } = useUser();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const isAdmin = user?.primaryEmailAddress?.emailAddress === 'ishaanhnk@gmail.com';

    useEffect(() => {
        document.title = 'Admin Dashboard — DRIP Store';
    }, []);

    // Redirect non-admins once Clerk has loaded
    useEffect(() => {
        if (!isLoaded) return;
        if (!isAdmin) navigate('/', { replace: true });
    }, [isLoaded, isAdmin, navigate]);

    // Show spinner while Clerk is loading
    if (!isLoaded || !isAdmin) {
        return (
            <div className="min-h-screen pt-20 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-primary-light border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-16 flex">
            {/* Mobile sidebar toggle */}
            <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden fixed top-20 left-4 z-50 p-2 rounded-xl bg-surface-card border border-border"
            >
                <HiOutlineBars3 className="w-5 h-5" />
            </button>

            {/* Sidebar */}
            <aside
                className={`fixed lg:sticky top-16 left-0 z-40 h-[calc(100vh-4rem)] w-64 bg-surface-card border-r border-border flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                    }`}
            >
                {/* Header */}
                <div className="p-5 border-b border-border">
                    <div className="flex items-center gap-2 mb-3">
                        <HiOutlineShieldCheck className="w-5 h-5 text-white" />
                        <h2 className="text-base font-black tracking-tight">Admin Panel</h2>
                    </div>
                    <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-white/10 border border-border flex items-center justify-center text-xs font-bold flex-shrink-0">
                            {user?.fullName?.[0]?.toUpperCase() || 'A'}
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs font-semibold truncate">{user?.fullName || 'Admin'}</p>
                            <p className="text-[10px] text-text-secondary truncate">{user?.primaryEmailAddress?.emailAddress}</p>
                        </div>
                    </div>
                </div>

                {/* Nav */}
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {navLinks.map((link) => {
                        const isActive =
                            location.pathname === link.path ||
                            (link.path === '/admin/orders' && location.pathname === '/admin');
                        return (
                            <Link
                                key={link.path}
                                to={link.path}
                                onClick={() => setSidebarOpen(false)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive
                                    ? 'bg-white text-black'
                                    : 'text-text-secondary hover:bg-surface hover:text-text-primary'
                                    }`}
                            >
                                <link.icon className="w-5 h-5 flex-shrink-0" />
                                {link.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-border">
                    <Link
                        to="/"
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface transition-all"
                    >
                        <HiOutlineArrowLeftOnRectangle className="w-5 h-5" />
                        Back to Store
                    </Link>
                </div>
            </aside>

            {/* Backdrop for mobile */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-30 bg-black/50 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Main content */}
            <main className="flex-1 min-w-0 p-5 lg:p-8 overflow-y-auto">
                <Outlet />
            </main>
        </div>
    );
}
