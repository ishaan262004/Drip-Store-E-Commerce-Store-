import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HiOutlineShoppingBag, HiOutlineHome } from 'react-icons/hi2';

export default function ThankYou() {
    const location = useLocation();
    const paymentId = location.state?.paymentId || null;
    const [showContent, setShowContent] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const [showButtons, setShowButtons] = useState(false);
    const [tickProgress, setTickProgress] = useState(0);

    useEffect(() => {
        document.title = 'Order Confirmed — DRIP Store';
        // Staggered reveal
        const t1 = setTimeout(() => setTickProgress(100), 300);
        const t2 = setTimeout(() => setShowContent(true), 1200);
        const t3 = setTimeout(() => setShowDetails(true), 1800);
        const t4 = setTimeout(() => setShowButtons(true), 2400);
        return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
    }, []);

    return (
        <div className="min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
            <div className="max-w-md w-full text-center">

                {/* Animated Checkmark Circle */}
                <div className="mb-10 flex justify-center">
                    <div className="relative w-28 h-28">
                        {/* Outer glow ring */}
                        <div className="absolute inset-0 rounded-full bg-green-500/10 animate-ping" style={{ animationDuration: '2s', animationIterationCount: 3 }} />

                        {/* SVG Circle + Checkmark */}
                        <svg className="w-28 h-28" viewBox="0 0 100 100">
                            {/* Background circle */}
                            <circle cx="50" cy="50" r="45" fill="none" stroke="#1a1a1a" strokeWidth="3" />
                            {/* Animated progress circle */}
                            <circle
                                cx="50" cy="50" r="45"
                                fill="none"
                                stroke="#22c55e"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeDasharray={`${tickProgress * 2.83} 283`}
                                transform="rotate(-90 50 50)"
                                style={{ transition: 'stroke-dasharray 0.8s ease-out' }}
                            />
                            {/* Animated checkmark */}
                            <path
                                d="M30 52 L44 66 L70 38"
                                fill="none"
                                stroke="#22c55e"
                                strokeWidth="4"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeDasharray="60"
                                strokeDashoffset={tickProgress === 100 ? 0 : 60}
                                style={{ transition: 'stroke-dashoffset 0.5s ease-out 0.6s' }}
                            />
                        </svg>
                    </div>
                </div>

                {/* Heading */}
                <div className={`transition-all duration-700 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
                    <h1 className="text-3xl sm:text-5xl font-black mb-3">
                        Order <span className="text-gradient">Confirmed!</span>
                    </h1>
                    <p className="text-text-secondary leading-relaxed">
                        Your payment was successful. Your drip is on the way! 🔥
                    </p>
                </div>

                {/* Payment ID */}
                {paymentId && (
                    <div className={`mt-6 transition-all duration-700 delay-200 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
                        <div className="px-4 py-3 rounded-xl bg-surface-card border border-border inline-block">
                            <p className="text-xs text-text-secondary uppercase tracking-wider mb-1">Payment ID</p>
                            <p className="text-xs font-mono text-primary-light break-all">{paymentId}</p>
                        </div>
                    </div>
                )}

                {/* Order Details Card */}
                <div className={`mt-8 transition-all duration-700 ${showDetails ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
                    <div className="bg-surface-card border border-border rounded-2xl p-6 text-left space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-text-secondary">Status</span>
                            <span className="flex items-center gap-1.5 text-sm font-semibold text-green-400">
                                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                                Paid
                            </span>
                        </div>
                        <div className="h-px bg-border" />
                        <div className="flex justify-between text-sm">
                            <span className="text-text-secondary">Estimated Delivery</span>
                            <span className="text-text-primary font-medium">3-5 Business Days</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-text-secondary">Confirmation Email</span>
                            <span className="text-text-primary font-medium">Sent ✓</span>
                        </div>

                        {/* Mini progress bar */}
                        <div className="pt-2">
                            <p className="text-xs text-text-secondary mb-2">Order Progress</p>
                            <div className="h-1.5 bg-surface rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full" style={{ width: '25%', transition: 'width 1s ease-out 2s' }} />
                            </div>
                            <div className="flex justify-between text-xs text-text-secondary mt-1.5">
                                <span className="text-green-400 font-medium">Confirmed</span>
                                <span>Shipped</span>
                                <span>Delivered</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CTA Buttons */}
                <div className={`mt-8 flex flex-col sm:flex-row gap-3 justify-center transition-all duration-700 ${showButtons ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
                    <Link
                        to="/products"
                        className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-white text-black font-bold text-sm hover:bg-primary-light transition-all hover:scale-105"
                    >
                        <HiOutlineShoppingBag className="w-4 h-4" />
                        Continue Shopping
                    </Link>
                    <Link
                        to="/"
                        className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-surface-card border border-border text-text-primary font-bold text-sm hover:border-primary/30 transition-all hover:scale-105"
                    >
                        <HiOutlineHome className="w-4 h-4" />
                        Go Home
                    </Link>
                </div>

                {/* Confetti-style dots decoration */}
                <div className={`mt-10 flex justify-center gap-1 transition-all duration-1000 ${showButtons ? 'opacity-100' : 'opacity-0'}`}>
                    {['bg-green-400', 'bg-primary-light', 'bg-accent', 'bg-green-400', 'bg-primary-light'].map((c, i) => (
                        <span key={i} className={`w-1.5 h-1.5 rounded-full ${c}`} style={{ animation: `bounceSubtle 1.5s ease-in-out ${i * 0.15}s infinite` }} />
                    ))}
                </div>
            </div>
        </div>
    );
}
