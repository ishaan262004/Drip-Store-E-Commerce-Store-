import { useSelector, useDispatch } from 'react-redux';
import { removeFromCart, updateQuantity, clearCart } from '../redux/slices/cartSlice';
import { Link } from 'react-router-dom';
import { HiOutlineTrash, HiOutlinePlus, HiOutlineMinus, HiOutlineShoppingBag } from 'react-icons/hi';
import { toast } from 'react-toastify';

export default function Cart() {
    const { items } = useSelector((s) => s.cart);
    const dispatch = useDispatch();

    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const shipping = subtotal > 100 ? 0 : 9.99;
    const total = subtotal + shipping;

    const handleRemove = (index, name) => {
        dispatch(removeFromCart(index));
        toast.info(`${name} removed from bag`, { theme: 'dark' });
    };

    if (items.length === 0) {
        return (
            <div className="min-h-screen pt-24 flex flex-col items-center justify-center gap-4 px-4">
                <div className="w-24 h-24 rounded-full bg-surface-card flex items-center justify-center">
                    <HiOutlineShoppingBag className="w-10 h-10 text-text-secondary" />
                </div>
                <h2 className="text-2xl font-bold">Your bag is empty</h2>
                <p className="text-text-secondary text-center">Looks like you haven't added any drip yet.</p>
                <Link to="/products" className="mt-2 px-8 py-3 rounded-full bg-black hover:bg-gray-900 text-white font-bold text-sm transition border border-white/20">Start Shopping</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 pb-16">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl sm:text-4xl font-black mb-8">Your <span className="text-gradient">Bag</span></h1>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Items */}
                    <div className="lg:col-span-2 space-y-4">
                        {items.map((item, i) => (
                            <div key={`${item.id}-${item.size}-${item.color}-${i}`} className="flex gap-4 p-4 rounded-2xl bg-surface-card border border-border">
                                <img src={item.image} alt={item.name} className="w-24 h-28 rounded-xl object-cover flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-text-primary truncate">{item.name}</h3>
                                    <p className="text-xs text-text-secondary mt-1">Size: {item.size} · Color: {item.color}</p>
                                    <p className="text-lg font-bold text-text-primary mt-2">${(item.price * item.quantity).toFixed(2)}</p>

                                    <div className="flex items-center justify-between mt-3">
                                        <div className="flex items-center gap-1 border border-border rounded-lg">
                                            <button onClick={() => dispatch(updateQuantity({ index: i, quantity: item.quantity - 1 }))} disabled={item.quantity <= 1} className="p-1.5 hover:bg-surface-light rounded-l-lg disabled:opacity-30 transition">
                                                <HiOutlineMinus className="w-3.5 h-3.5" />
                                            </button>
                                            <span className="px-3 text-sm font-semibold">{item.quantity}</span>
                                            <button onClick={() => dispatch(updateQuantity({ index: i, quantity: item.quantity + 1 }))} className="p-1.5 hover:bg-surface-light rounded-r-lg transition">
                                                <HiOutlinePlus className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                        <button onClick={() => handleRemove(i, item.name)} className="p-2 rounded-lg hover:bg-accent/10 transition group">
                                            <HiOutlineTrash className="w-4 h-4 text-text-secondary group-hover:text-accent" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}

                        <button onClick={() => { dispatch(clearCart()); toast.info('Bag cleared', { theme: 'dark' }); }} className="text-sm text-text-secondary hover:text-accent transition">
                            Clear All
                        </button>
                    </div>

                    {/* Summary */}
                    <div className="lg:sticky lg:top-24 h-fit">
                        <div className="rounded-2xl bg-surface-card border border-border p-6">
                            <h3 className="text-lg font-bold mb-4">Order Summary</h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between text-text-secondary">
                                    <span>Subtotal ({items.reduce((a, i) => a + i.quantity, 0)} items)</span>
                                    <span>${subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-text-secondary">
                                    <span>Shipping</span>
                                    <span>{shipping === 0 ? <span className="text-green-400">Free</span> : `$${shipping.toFixed(2)}`}</span>
                                </div>
                                {subtotal < 100 && <p className="text-xs text-primary-light">Free shipping on orders over $100!</p>}
                                <div className="border-t border-border pt-3 flex justify-between text-lg font-bold">
                                    <span>Total</span>
                                    <span className="text-gradient">${total.toFixed(2)}</span>
                                </div>
                            </div>
                            <Link to="/checkout" className="block w-full mt-6 py-3.5 rounded-xl bg-black hover:bg-gray-900 text-white font-bold text-sm text-center transition-all hover:shadow-lg hover:shadow-black/50 border border-white/20">
                                Checkout
                            </Link>
                            <Link to="/products" className="block w-full mt-3 py-3 rounded-xl border border-border text-text-secondary text-sm text-center hover:border-primary/50 transition">
                                Continue Shopping
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
