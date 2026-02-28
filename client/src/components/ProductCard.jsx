import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useAuth, SignInButton } from '@clerk/clerk-react';
import { addToCart } from '../redux/slices/cartSlice';
import { toast } from 'react-toastify';
import { HiOutlineStar, HiStar, HiOutlineShoppingBag } from 'react-icons/hi';
import { useState } from 'react';

// Luxury placeholder shown when a product image fails to load or is missing
const LUXURY_PLACEHOLDER =
    'https://res.cloudinary.com/dzewuyhhx/image/upload/e_grayscale/v1771753576/drip-store/misc/luxury-placeholder.jpg';

/** Remove duplicate URLs from an images array (frontend safety layer). */
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

export default function ProductCard({ product }) {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { isSignedIn } = useAuth();
    const [imgLoaded, setImgLoaded] = useState(false);

    // Dedupe images at render time as a final safety net
    const images = uniqueImages(product?.images);
    const primaryImage = images[0] || LUXURY_PLACEHOLDER;

    const handleAddToCart = (e) => {
        e.stopPropagation();

        if (!isSignedIn) {
            toast.error('Please sign in to add items to your bag! 🔒', {
                position: 'bottom-right',
                autoClose: 3000,
                theme: 'dark',
            });
            return;
        }

        dispatch(addToCart({
            id: product.id,
            name: product.name,
            price: product.price,
            image: primaryImage,
            size: product.sizes?.[0] || 'One Size',
            color: product.colors?.[0] || 'Default',
        }));
        toast.success(`${product.name} added to bag! 🛍️`, {
            position: 'bottom-right',
            autoClose: 2000,
            theme: 'dark',
        });
    };

    const renderStars = (rating) => {
        const stars = [];
        const full = Math.floor(rating);
        for (let i = 0; i < 5; i++) {
            stars.push(
                i < full ? (
                    <HiStar key={i} className="w-3.5 h-3.5 text-yellow-400" />
                ) : (
                    <HiOutlineStar key={i} className="w-3.5 h-3.5 text-text-secondary/40" />
                )
            );
        }
        return stars;
    };

    return (
        <div
            onClick={() => navigate(`/products/${product.id}`)}
            className="group cursor-pointer rounded-2xl bg-surface-card border border-border overflow-hidden transition-all duration-300 hover:scale-[1.03] hover:border-primary/30 hover:shadow-xl hover:shadow-primary/10"
        >
            {/* Image */}
            <div className="relative aspect-[3/4] overflow-hidden bg-surface-light">
                {!imgLoaded && (
                    <div className="absolute inset-0 bg-surface-light animate-pulse" />
                )}
                <img
                    src={primaryImage}
                    alt={product.name}
                    loading="lazy"
                    onLoad={() => setImgLoaded(true)}
                    onError={(e) => { e.target.onerror = null; e.target.src = LUXURY_PLACEHOLDER; }}
                    className={`w-full h-full object-cover product-img-desat transition-transform duration-500 group-hover:scale-110 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
                />

                {/* Overlay — Add to Cart */}
                <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    {isSignedIn ? (
                        <button
                            onClick={handleAddToCart}
                            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-black/90 backdrop-blur-sm hover:bg-black text-white text-sm font-semibold transition-colors shadow-lg border border-white/20"
                        >
                            <HiOutlineShoppingBag className="w-4 h-4" />
                            Add to Bag
                        </button>
                    ) : (
                        <SignInButton mode="modal">
                            <button
                                onClick={(e) => e.stopPropagation()}
                                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-black/90 backdrop-blur-sm hover:bg-black text-white text-sm font-semibold transition-colors shadow-lg border border-white/20"
                            >
                                <HiOutlineShoppingBag className="w-4 h-4" />
                                Sign in to Shop
                            </button>
                        </SignInButton>
                    )}
                </div>

                {/* Out of stock badge */}
                {product.stock === 0 && (
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-accent/90 text-white text-[11px] font-bold">
                        Sold Out
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="p-4">
                <p className="text-[11px] text-primary-light font-semibold uppercase tracking-wider mb-1">{product.brand}</p>
                <h3 className="text-sm font-semibold text-text-primary truncate leading-snug">{product.name}</h3>
                <div className="flex items-center gap-2 mt-2">
                    <span className="text-lg font-bold text-text-primary">${product.price?.toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-1 mt-1.5">
                    {renderStars(product.rating)}
                    <span className="text-xs text-text-secondary ml-1">({product.rating?.toFixed(1)})</span>
                </div>
            </div>
        </div>
    );
}
