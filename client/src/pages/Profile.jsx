import { useUser, useClerk } from '@clerk/clerk-react';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { HiOutlineShoppingBag, HiOutlineHeart, HiOutlineLogout } from 'react-icons/hi';

export default function Profile() {
    const { user, isLoaded, isSignedIn } = useUser();
    const { signOut } = useClerk();
    const navigate = useNavigate();

    useEffect(() => {
        if (isLoaded && !isSignedIn) navigate('/login');
    }, [isLoaded, isSignedIn, navigate]);

    if (!isLoaded || !isSignedIn) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 pb-16">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* User Header */}
                <div className="flex items-center gap-5 mb-10 bg-surface-card p-6 rounded-2xl border border-border">
                    <img
                        src={user.imageUrl}
                        alt={user.fullName}
                        className="w-20 h-20 rounded-full border-2 border-primary"
                    />
                    <div>
                        <h1 className="text-2xl font-bold text-text-primary">{user.fullName}</h1>
                        <p className="text-text-secondary text-sm">{user.primaryEmailAddress?.emailAddress}</p>
                        <span className="inline-block mt-2 px-3 py-1 bg-primary/20 text-primary-light text-xs font-bold rounded-full">
                            Member since {new Date(user.createdAt).getFullYear()}
                        </span>
                    </div>
                </div>

                {/* Dashboard Grid */}
                <div className="grid sm:grid-cols-3 gap-4">
                    <Link to="/cart" className="group flex items-center gap-4 p-5 rounded-2xl bg-surface-card border border-border hover:border-primary/50 transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5">
                        <div className="w-12 h-12 rounded-full bg-surface-light flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                            <HiOutlineShoppingBag className="w-6 h-6" />
                        </div>
                        <span className="font-semibold text-lg">My Bag</span>
                    </Link>

                    <button className="group flex items-center gap-4 p-5 rounded-2xl bg-surface-card border border-border hover:border-primary/50 transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5 text-left">
                        <div className="w-12 h-12 rounded-full bg-surface-light flex items-center justify-center group-hover:bg-accent group-hover:text-white transition-colors">
                            <HiOutlineHeart className="w-6 h-6" />
                        </div>
                        <span className="font-semibold text-lg">Wishlist</span>
                    </button>

                    <button
                        onClick={() => signOut(() => navigate('/'))}
                        className="group flex items-center gap-4 p-5 rounded-2xl bg-surface-card border border-border hover:border-red-500/50 transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-red-500/5 text-left w-full"
                    >
                        <div className="w-12 h-12 rounded-full bg-surface-light flex items-center justify-center group-hover:bg-red-500 group-hover:text-white transition-colors">
                            <HiOutlineLogout className="w-6 h-6" />
                        </div>
                        <span className="font-semibold text-lg text-red-400 group-hover:text-red-500">Sign Out</span>
                    </button>
                </div>

                {/* Recent Orders Placeholder */}
                <div className="mt-10">
                    <h2 className="text-xl font-bold mb-4">Recent Orders</h2>
                    <div className="p-8 text-center rounded-2xl border border-dashed border-border text-text-secondary">
                        <p>No orders yet. Time to get some drip! 💧</p>
                        <Link to="/products" className="inline-block mt-4 text-primary hover:underline">Browse Products</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
