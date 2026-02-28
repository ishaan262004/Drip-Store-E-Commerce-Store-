import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { SignedIn, SignedOut, UserButton, SignInButton, useUser } from '@clerk/clerk-react';
import { HiOutlineSearch, HiOutlineShoppingBag, HiMenu, HiX } from 'react-icons/hi';
import { HiOutlineShieldCheck } from 'react-icons/hi2';
import { useState, useEffect } from 'react';

export default function Navbar() {
    const cartItems = useSelector((s) => s.cart.items);
    const totalItems = cartItems.reduce((sum, i) => sum + i.quantity, 0);
    const [searchOpen, setSearchOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const { user } = useUser();
    const isAdmin = user?.primaryEmailAddress?.emailAddress === 'ishaanhnk@gmail.com';
    const navigate = useNavigate();
    const location = useLocation();

    // Close mobile menu on route change
    useEffect(() => {
        setMobileOpen(false);
    }, [location]);

    // Detect scroll for navbar background transition
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        if (query.trim()) {
            navigate(`/products?search=${encodeURIComponent(query.trim())}`);
            setSearchOpen(false);
            setMobileOpen(false);
            setQuery('');
        }
    };

    const navLinks = [
        { label: 'MEN', path: '/products?category=Men' },
        { label: 'WOMEN', path: '/products?category=Women' },
        { label: 'ACCESSORIES', path: '/products?category=Accessories' },
        { label: 'NEW ARRIVALS', path: '/products' },
    ];

    return (
        <>
            <nav
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled || mobileOpen
                    ? 'bg-black/95 backdrop-blur-xl border-b border-white/10'
                    : 'bg-transparent'
                    }`}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    {/* Logo */}
                    <Link to="/" className="group">
                        <h1
                            className="text-2xl font-bold text-white tracking-tight transition-all duration-300 group-hover:tracking-wide"
                            style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}
                        >
                            DRIPSTORE
                        </h1>
                    </Link>

                    {/* Nav Links (desktop) */}
                    <div className="hidden md:flex items-center gap-8">
                        {navLinks.map((l) => (
                            <Link
                                key={l.label}
                                to={l.path}
                                className="underline-hover text-xs font-semibold tracking-wider text-white/80 hover:text-white transition-colors duration-300"
                                style={{ fontFamily: "'Inter', sans-serif" }}
                            >
                                {l.label}
                            </Link>
                        ))}
                    </div>

                    {/* Right side */}
                    <div className="flex items-center gap-3">
                        {/* Search */}
                        {searchOpen ? (
                            <form onSubmit={handleSearch} className="flex items-center bg-white/10 border border-white/20 rounded-full overflow-hidden backdrop-blur-sm">
                                <input
                                    autoFocus
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Search products..."
                                    className="bg-transparent text-sm text-white px-3 py-1.5 w-40 outline-none placeholder:text-white/50"
                                    onBlur={() => !query && setSearchOpen(false)}
                                />
                                <button type="submit" className="px-2">
                                    <HiOutlineSearch className="w-4 h-4 text-white/70" />
                                </button>
                            </form>
                        ) : (
                            <button onClick={() => setSearchOpen(true)} className="p-2 hover:bg-white/10 rounded-full transition">
                                <HiOutlineSearch className="w-5 h-5 text-white/80" />
                            </button>
                        )}

                        {/* Cart */}
                        <Link to="/cart" className="relative p-2 hover:bg-white/10 rounded-full transition">
                            <HiOutlineShoppingBag className="w-5 h-5 text-white/80" />
                            {totalItems > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-white text-black text-[10px] font-bold rounded-full flex items-center justify-center">
                                    {totalItems}
                                </span>
                            )}
                        </Link>

                        {/* Admin Link */}
                        {isAdmin && (
                            <Link
                                to="/admin"
                                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-white text-xs font-bold tracking-wide hover:bg-white/20 transition-all"
                            >
                                <HiOutlineShieldCheck className="w-3.5 h-3.5" />
                                Admin
                            </Link>
                        )}

                        {/* Clerk Auth */}
                        <SignedIn>
                            <UserButton
                                afterSignOutUrl="/"
                                appearance={{
                                    elements: {
                                        avatarBox: 'w-8 h-8 border-2 border-white/30 hover:border-white transition-colors',
                                        userButtonPopoverCard: 'bg-black border border-white/20 shadow-xl',
                                    },
                                }}
                            />
                        </SignedIn>
                        <SignedOut>
                            <SignInButton mode="modal">
                                <button className="hidden sm:block px-5 py-2 rounded-full bg-white hover:bg-white/90 text-black text-xs font-bold tracking-wide transition-all duration-300 hover:shadow-lg hover:shadow-white/20">
                                    Sign In
                                </button>
                            </SignInButton>
                        </SignedOut>

                        {/* Hamburger — mobile only */}
                        <button
                            onClick={() => setMobileOpen((o) => !o)}
                            className="md:hidden p-2 hover:bg-white/10 rounded-full transition"
                            aria-label="Toggle menu"
                        >
                            {mobileOpen
                                ? <HiX className="w-6 h-6 text-white" />
                                : <HiMenu className="w-6 h-6 text-white/80" />
                            }
                        </button>
                    </div>
                </div>

                {/* Mobile Drawer */}
                <div
                    className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${mobileOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                        }`}
                >
                    <div className="px-4 pb-6 pt-2 space-y-1 border-t border-white/10 bg-black/95">
                        {navLinks.map((l) => (
                            <Link
                                key={l.label}
                                to={l.path}
                                className="block w-full px-4 py-3 rounded-xl text-sm font-bold tracking-wider text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200"
                                style={{ fontFamily: "'Inter', sans-serif" }}
                            >
                                {l.label}
                            </Link>
                        ))}
                        <SignedOut>
                            <SignInButton mode="modal">
                                <button className="mt-3 w-full py-3 rounded-xl bg-white text-black text-sm font-bold tracking-wide transition hover:bg-white/90">
                                    Sign In
                                </button>
                            </SignInButton>
                        </SignedOut>
                    </div>
                </div>
            </nav>
        </>
    );
}
