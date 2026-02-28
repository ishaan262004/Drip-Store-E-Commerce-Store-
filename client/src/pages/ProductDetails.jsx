import { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useAuth, SignInButton } from '@clerk/clerk-react';
import { addToCart } from '../redux/slices/cartSlice';
import { toast } from 'react-toastify';
import { HiStar, HiOutlineStar, HiOutlineShoppingBag, HiOutlineHeart, HiOutlineChevronLeft } from 'react-icons/hi';

/** Luxury-themed fallback image shown when a product image fails to load. */
const LUXURY_PLACEHOLDER =
    'https://res.cloudinary.com/dzewuyhhx/image/upload/e_grayscale/v1771753576/drip-store/misc/luxury-placeholder.jpg';

/** Remove duplicate / invalid URLs from the images array (frontend safety layer). */
function uniqueImages(images) {
    if (!Array.isArray(images)) return [];
    const seen = new Set();
    return images.filter((url) => {
        if (!url || typeof url !== 'string') return false;
        const key = url.trim().toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

export default function ProductDetails() {
    const { id } = useParams();
    const dispatch = useDispatch();
    const { isSignedIn } = useAuth();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(0);
    const [selectedSize, setSelectedSize] = useState('');
    const [selectedColor, setSelectedColor] = useState('');

    // Deduplicated images — recomputed whenever the product changes
    const images = useMemo(() => uniqueImages(product?.images), [product]);
    // Clamp active index in case dedup shrinks the array
    const safeIndex = Math.min(selectedImage, Math.max(0, images.length - 1));

    useEffect(() => {
        fetch('/products.json')
            .then((r) => r.json())
            .then((data) => {
                const found = data.find((p) => p.id === Number(id));
                setProduct(found || null);
                if (found) {
                    setSelectedSize(found.sizes?.[0] || '');
                    setSelectedColor(found.colors?.[0] || '');
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [id]);

    const handleAddToCart = () => {
        if (!isSignedIn) {
            toast.error('Please sign in to shop! 🔒', { theme: 'dark' });
            return;
        }
        if (!selectedSize) { toast.warn('Please select a size'); return; }

        dispatch(addToCart({
            id: product.id,
            name: product.name,
            price: product.price,
            image: images[0] || LUXURY_PLACEHOLDER,
            size: selectedSize,
            color: selectedColor,
        }));
        toast.success(`${product.name} added to bag! 🛍️`, { theme: 'dark' });
    };

    if (loading) return (
        <div className="min-h-screen pt-24 flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
    );

    if (!product) return (
        <div className="min-h-screen pt-24 flex flex-col items-center justify-center gap-4">
            <p className="text-5xl">🤷</p>
            <h2 className="text-2xl font-bold">Product not found</h2>
            <Link to="/products" className="text-primary-light hover:underline">Back to shop</Link>
        </div>
    );

    return (
        <div className="min-h-screen pt-24 pb-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Breadcrumb */}
                <Link to="/products" className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-primary-light transition mb-8">
                    <HiOutlineChevronLeft className="w-4 h-4" /> Back to Products
                </Link>

                <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
                    {/* Images */}
                    <div className="space-y-4">
                        <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-surface-card border border-border">
                            <img
                                src={images[safeIndex] || LUXURY_PLACEHOLDER}
                                alt={product.name}
                                className="w-full h-full object-cover"
                                onError={(e) => { e.target.onerror = null; e.target.src = LUXURY_PLACEHOLDER; }}
                            />
                        </div>
                        <div className="flex gap-3 overflow-x-auto hide-scrollbar">
                            {images.map((img, i) => (
                                <button
                                    key={img}
                                    onClick={() => setSelectedImage(i)}
                                    className={`flex-shrink-0 w-20 h-24 rounded-xl overflow-hidden border-2 transition ${i === safeIndex ? 'border-primary' : 'border-border hover:border-primary/30'}`}
                                >
                                    <img
                                        src={img}
                                        alt={`${product.name} view ${i + 1}`}
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                        onError={(e) => { e.target.onerror = null; e.target.src = LUXURY_PLACEHOLDER; }}
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Details */}
                    <div className="flex flex-col">
                        <p className="text-primary-light text-sm font-semibold uppercase tracking-widest mb-2">{product.brand}</p>
                        <h1 className="text-3xl sm:text-4xl font-black mb-3">{product.name}</h1>

                        {/* Rating */}
                        <div className="flex items-center gap-2 mb-4">
                            <div className="flex">
                                {[1, 2, 3, 4, 5].map((s) => s <= Math.floor(product.rating)
                                    ? <HiStar key={s} className="w-5 h-5 text-yellow-400" />
                                    : <HiOutlineStar key={s} className="w-5 h-5 text-text-secondary/40" />
                                )}
                            </div>
                            <span className="text-sm text-text-secondary">({product.rating?.toFixed(1)})</span>
                        </div>

                        {/* Price */}
                        <div className="flex items-baseline gap-3 mb-6">
                            <span className="text-3xl font-black text-text-primary">${product.price?.toFixed(2)}</span>
                            {product.stock > 0 ? (
                                <span className="text-sm text-green-400 font-medium">In Stock ({product.stock})</span>
                            ) : (
                                <span className="text-sm text-accent font-medium">Out of Stock</span>
                            )}
                        </div>

                        {/* Description */}
                        <p className="text-text-secondary leading-relaxed mb-8">{product.description}</p>

                        {/* Sizes */}
                        {product.sizes?.length > 0 && (
                            <div className="mb-6">
                                <h4 className="text-sm font-bold uppercase tracking-wider text-text-secondary mb-3">Size</h4>
                                <div className="flex flex-wrap gap-2">
                                    {product.sizes.map((s) => (
                                        <button key={s} onClick={() => setSelectedSize(s)} className={`px-4 py-2 rounded-xl text-sm font-medium border transition ${selectedSize === s ? 'border-primary bg-primary/10 text-primary-light' : 'border-border text-text-secondary hover:border-primary/30'}`}>{s}</button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Colors */}
                        {product.colors?.length > 0 && (
                            <div className="mb-8">
                                <h4 className="text-sm font-bold uppercase tracking-wider text-text-secondary mb-3">Color — <span className="text-text-primary font-normal normal-case">{selectedColor}</span></h4>
                                <div className="flex flex-wrap gap-2">
                                    {product.colors.map((c) => (
                                        <button key={c} onClick={() => setSelectedColor(c)} className={`px-4 py-2 rounded-xl text-sm font-medium border transition ${selectedColor === c ? 'border-primary bg-primary/10 text-primary-light' : 'border-border text-text-secondary hover:border-primary/30'}`}>{c}</button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-3 mt-auto">
                            {isSignedIn ? (
                                <button onClick={handleAddToCart} disabled={product.stock === 0} className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-black hover:bg-gray-900 text-white font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-black/50 border border-white/20">
                                    <HiOutlineShoppingBag className="w-5 h-5" />
                                    {product.stock === 0 ? 'Sold Out' : 'Add to Bag'}
                                </button>
                            ) : (
                                <SignInButton mode="modal">
                                    <button className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-black hover:bg-gray-900 text-white font-bold text-sm transition-all hover:shadow-lg hover:shadow-black/50 border border-white/20">
                                        <HiOutlineShoppingBag className="w-5 h-5" />
                                        Sign in to Shop
                                    </button>
                                </SignInButton>
                            )}

                            <button className="w-14 h-14 rounded-xl border border-border hover:border-accent/50 flex items-center justify-center transition hover:bg-surface-light group">
                                <HiOutlineHeart className="w-5 h-5 text-text-secondary group-hover:text-accent" />
                            </button>
                        </div>

                        {/* Category tag */}
                        <div className="mt-8 pt-6 border-t border-border">
                            <span className="text-xs text-text-secondary">Category: </span>
                            <Link to={`/products?category=${product.category}`} className="text-xs text-primary-light hover:underline">{product.category}</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
