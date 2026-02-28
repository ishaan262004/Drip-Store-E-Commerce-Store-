import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import HeroBanner from '../components/HeroBanner';
import ProductCard from '../components/ProductCard';
import Newsletter from '../components/Newsletter';
import { HiOutlineArrowRight, HiOutlineChevronLeft, HiOutlineChevronRight } from 'react-icons/hi';
import { HiOutlineTruck, HiOutlineShieldCheck, HiOutlineSparkles, HiOutlineCreditCard } from 'react-icons/hi2';

const categories = [
    { name: 'Men', image: 'https://res.cloudinary.com/dzewuyhhx/image/upload/e_grayscale/v1771753572/drip-store/categories/men.jpg', query: 'Men' },
    { name: 'Women', image: 'https://res.cloudinary.com/dzewuyhhx/image/upload/e_grayscale/v1771753573/drip-store/categories/women.jpg', query: 'Women' },
    { name: 'Accessories', image: 'https://res.cloudinary.com/dzewuyhhx/image/upload/e_grayscale/v1771753574/drip-store/categories/accessories.jpg', query: 'Accessories' },
    { name: 'New Arrivals', image: 'https://res.cloudinary.com/dzewuyhhx/image/upload/e_grayscale/v1771753575/drip-store/categories/new-arrivals.jpg', query: '' },
];

const marqueeWords = [
    'STREETWEAR', '✦', 'DRIP', '✦', 'SNEAKERS', '✦', 'VINTAGE', '✦',
    'Y2K', '✦', 'ACCESSORIES', '✦', 'TRENDING', '✦', 'EXCLUSIVE', '✦',
    'STREETWEAR', '✦', 'DRIP', '✦', 'SNEAKERS', '✦', 'VINTAGE', '✦',
    'Y2K', '✦', 'ACCESSORIES', '✦', 'TRENDING', '✦', 'EXCLUSIVE', '✦',
];

const features = [
    { icon: HiOutlineTruck, title: 'Free Shipping', desc: 'On orders over $100. No cap.', color: 'from-primary/20 to-primary/5' },
    { icon: HiOutlineShieldCheck, title: '100% Authentic', desc: 'Only real drip. No fakes ever.', color: 'from-neon/20 to-neon/5' },
    { icon: HiOutlineSparkles, title: 'Fresh Drops', desc: 'New styles added every week.', color: 'from-accent/20 to-accent/5' },
    { icon: HiOutlineCreditCard, title: 'Easy Returns', desc: '7-day hassle-free returns.', color: 'from-primary-light/20 to-primary-light/5' },
];

// Hook for scroll reveal — uses MutationObserver to catch dynamically added elements
function useScrollReveal() {
    const ref = useRef(null);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const io = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        io.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.08, rootMargin: '0px 0px -30px 0px' }
        );

        const observeAll = () => {
            el.querySelectorAll('.reveal:not(.visible)').forEach((child) => io.observe(child));
        };
        observeAll();

        // Watch for dynamically added .reveal elements (e.g., after products load)
        const mo = new MutationObserver(() => observeAll());
        mo.observe(el, { childList: true, subtree: true });

        return () => { io.disconnect(); mo.disconnect(); };
    }, []);
    return ref;
}

export default function Home() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const carouselRef = useRef(null);
    const sectionRef = useScrollReveal();

    useEffect(() => {
        fetch('/products.json')
            .then((r) => r.json())
            .then((data) => { setProducts(data); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    const featured = products.filter((p) => p.rating >= 4).slice(0, 10);
    const accessories = products.filter((p) => p.category === 'Accessories').slice(0, 15);

    const scrollCarousel = (dir) => {
        if (carouselRef.current) {
            carouselRef.current.scrollBy({ left: dir * 300, behavior: 'smooth' });
        }
    };

    return (
        <div ref={sectionRef}>
            {/* ─── Hero ─── */}
            <HeroBanner />

            {/* ─── Infinite Marquee Ticker ─── */}
            <div className="relative py-6 bg-surface-light/50 border-y border-border overflow-hidden">
                <div className="flex animate-marquee whitespace-nowrap">
                    {marqueeWords.map((word, i) => (
                        <span
                            key={`a-${i}`}
                            className={`mx-4 text-sm font-black tracking-[0.3em] uppercase ${word === '✦' ? 'text-primary-light text-xs' : 'text-text-secondary/40'
                                }`}
                        >
                            {word}
                        </span>
                    ))}
                </div>
            </div>

            {/* ─── Why Choose DRIP ─── */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="text-center mb-14 reveal">
                    <p className="text-neon text-sm font-semibold uppercase tracking-widest mb-2">Why Us</p>
                    <h2 className="text-3xl sm:text-4xl font-black">
                        The DRIP <span className="text-gradient">Difference</span>
                    </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {features.map((feat, i) => (
                        <div
                            key={feat.title}
                            className={`reveal reveal-delay-${i + 1} group relative p-6 rounded-2xl bg-surface-card border border-border hover:border-primary/30 transition-all duration-300 hover-lift cursor-default`}
                        >
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feat.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                                <feat.icon className="w-6 h-6 text-text-primary" />
                            </div>
                            <h3 className="text-lg font-bold mb-1">{feat.title}</h3>
                            <p className="text-sm text-text-secondary leading-relaxed">{feat.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ─── Categories ─── */}
            <section id="categories" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="text-center mb-12 reveal">
                    <p className="text-primary-light text-sm font-semibold uppercase tracking-widest mb-2">Shop by Category</p>
                    <h2 className="text-3xl sm:text-4xl font-black">Find Your <span className="text-gradient">Style</span></h2>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    {categories.map((cat, i) => (
                        <Link
                            key={cat.name}
                            to={`/products${cat.query ? `?category=${cat.query}&sort=rating` : '?sort=rating'}`}
                            className={`reveal reveal-delay-${i + 1} group relative aspect-[3/4] rounded-2xl overflow-hidden hover-lift`}
                        >
                            <img src={cat.image} alt={cat.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20" />
                            {/* Hover overlay glow */}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
                            <div className="absolute bottom-0 left-0 right-0 p-5">
                                <h3 className="text-xl font-bold text-white mb-1 drop-shadow-lg">{cat.name}</h3>
                                <span className="flex items-center gap-1 text-sm text-gray-200 group-hover:text-white transition-colors duration-300 drop-shadow-md">
                                    Shop Now <HiOutlineArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-2 duration-300" />
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* ─── Trending Banner ─── */}
            <section className="relative py-24 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full animate-pulse-glow"
                    style={{ background: 'radial-gradient(circle, rgba(155,135,245,0.2) 0%, transparent 70%)' }} />
                <div className="relative max-w-3xl mx-auto text-center px-4 reveal">
                    <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-strong text-xs font-bold tracking-[0.2em] uppercase text-primary-light mb-6">
                        🔥 Hot Right Now
                    </span>
                    <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight mb-6">
                        The Streets Are <span className="text-gradient">Talking</span>
                    </h2>
                    <p className="text-text-secondary text-lg mb-8 max-w-xl mx-auto">
                        Our most hyped pieces, curated from what&apos;s trending across social media. Limited drops, unlimited clout.
                    </p>
                    <Link
                        to="/products"
                        className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white text-black font-bold text-sm transition-all duration-500 hover:bg-black hover:text-white hover:shadow-2xl hover:shadow-white/20 hover:scale-105 border border-white/30"
                    >
                        See What&apos;s Trending
                        <HiOutlineArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </section>

            {/* ─── Featured Products ─── */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="flex items-end justify-between mb-10 reveal">
                    <div>
                        <p className="text-primary-light text-sm font-semibold uppercase tracking-widest mb-2">Trending Now</p>
                        <h2 className="text-3xl sm:text-4xl font-black">Featured <span className="text-gradient">Drops</span></h2>
                    </div>
                    <Link to="/products" className="hidden sm:flex items-center gap-1.5 text-sm text-text-secondary hover:text-primary-light transition font-medium group">
                        View All <HiOutlineArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                </div>
                {loading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
                        {Array.from({ length: 10 }).map((_, i) => (
                            <div key={i} className="rounded-2xl bg-surface-card animate-pulse aspect-[3/4]" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
                        {featured.map((p, i) => (
                            <div key={p.id} className={`reveal reveal-delay-${(i % 4) + 1}`}>
                                <ProductCard product={p} />
                            </div>
                        ))}
                    </div>
                )}
                <div className="mt-6 text-center sm:hidden">
                    <Link to="/products" className="text-sm text-primary-light font-medium">View All Products →</Link>
                </div>
            </section>

            {/* ─── Accessories Carousel ─── */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="flex items-end justify-between mb-10 reveal">
                    <div>
                        <p className="text-accent-light text-sm font-semibold uppercase tracking-widest mb-2">Drip Extras</p>
                        <h2 className="text-3xl sm:text-4xl font-black">Accessories</h2>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => scrollCarousel(-1)} className="w-10 h-10 rounded-full border border-border hover:border-primary/50 flex items-center justify-center transition hover:bg-surface-light active:scale-95">
                            <HiOutlineChevronLeft className="w-5 h-5 text-text-secondary" />
                        </button>
                        <button onClick={() => scrollCarousel(1)} className="w-10 h-10 rounded-full border border-border hover:border-primary/50 flex items-center justify-center transition hover:bg-surface-light active:scale-95">
                            <HiOutlineChevronRight className="w-5 h-5 text-text-secondary" />
                        </button>
                        <Link to="/products?category=Accessories&sort=rating" className="hidden sm:flex items-center gap-1.5 text-sm text-text-secondary hover:text-accent-light transition font-medium ml-2 group">
                            View All <HiOutlineArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                    </div>
                </div>
                <div ref={carouselRef} className="flex gap-4 sm:gap-6 overflow-x-auto hide-scrollbar pb-4 snap-x snap-mandatory">
                    {accessories.map((p) => (
                        <div key={p.id} className="flex-shrink-0 w-[200px] sm:w-[220px] snap-start">
                            <ProductCard product={p} />
                        </div>
                    ))}
                </div>
            </section>

            {/* ─── Newsletter ─── */}
            <Newsletter />
        </div>
    );
}
