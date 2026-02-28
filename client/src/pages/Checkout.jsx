import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { clearCart } from '../redux/slices/cartSlice';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '@clerk/clerk-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { createOrder } from '../services/api';
import PaymentForm from '../components/PaymentForm';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PK);

const stripeAppearance = {
    theme: 'night',
    variables: {
        colorPrimary: '#ffffff',
        colorBackground: '#0a0a0a',
        colorText: '#ffffff',
        borderRadius: '12px',
    },
};

export default function Checkout() {
    const { items } = useSelector((s) => s.cart);
    const { isSignedIn } = useAuth();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const shipping = subtotal > 100 ? 0 : 9.99;
    const total = subtotal + shipping;

    const [form, setForm] = useState({ street: '', city: '', state: '', zip: '', country: '' });
    const [step, setStep] = useState('shipping'); // 'shipping' | 'payment'

    const update = (key, val) => setForm((f) => ({ ...f, [key]: val }));

    const handleShippingSubmit = (e) => {
        e.preventDefault();
        if (!isSignedIn) { toast.warn('Please sign in to place an order 🔒'); return; }
        if (items.length === 0) { toast.warn('Your bag is empty'); return; }
        setStep('payment');
    };

    const handlePaymentSuccess = async (paymentId) => {
        try {
            await createOrder({
                products: items.map((item) => ({
                    productId: item.id,
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price,
                })),
                shippingAddress: form,
                paymentMethod: 'card',
                totalPrice: total,
                stripePaymentIntentId: paymentId,
            });
        } catch (err) {
            console.error('Order save error:', err);
        }
        dispatch(clearCart());
        toast.success('Payment successful! 🎉', { theme: 'dark', autoClose: 3000 });
        navigate('/thank-you', { state: { paymentId } });
    };

    const inputClass = 'w-full px-4 py-3 rounded-xl bg-surface-card border border-border text-text-primary text-sm focus:border-primary focus:outline-none transition placeholder:text-text-secondary/50';

    return (
        <div className="min-h-screen pt-24 pb-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl sm:text-4xl font-black mb-2">Checkout</h1>

                {/* Step Indicator */}
                <div className="flex items-center gap-3 mb-8">
                    <span className={`text-xs uppercase tracking-wider font-bold ${step === 'shipping' ? 'text-primary-light' : 'text-text-secondary'}`}>
                        1. Shipping
                    </span>
                    <span className="text-text-secondary">→</span>
                    <span className={`text-xs uppercase tracking-wider font-bold ${step === 'payment' ? 'text-primary-light' : 'text-text-secondary'}`}>
                        2. Payment
                    </span>
                </div>

                <div className="grid lg:grid-cols-5 gap-8">
                    {/* Form Area */}
                    <div className="lg:col-span-3 space-y-6">
                        {step === 'shipping' ? (
                            <form onSubmit={handleShippingSubmit}>
                                <div className="rounded-2xl bg-surface-card border border-border p-6">
                                    <h3 className="text-lg font-bold mb-4">Shipping Address</h3>
                                    <div className="space-y-3">
                                        <input placeholder="Street Address" required value={form.street} onChange={(e) => update('street', e.target.value)} className={inputClass} />
                                        <div className="grid grid-cols-2 gap-3">
                                            <input placeholder="City" required value={form.city} onChange={(e) => update('city', e.target.value)} className={inputClass} />
                                            <input placeholder="State" required value={form.state} onChange={(e) => update('state', e.target.value)} className={inputClass} />
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <input placeholder="ZIP Code" required value={form.zip} onChange={(e) => update('zip', e.target.value)} className={inputClass} />
                                            <input placeholder="Country" required value={form.country} onChange={(e) => update('country', e.target.value)} className={inputClass} />
                                        </div>
                                    </div>
                                </div>
                                <button type="submit" disabled={items.length === 0} className="w-full mt-4 py-3.5 rounded-xl bg-white text-black font-bold text-sm hover:bg-primary-light transition-all disabled:opacity-50 border border-white/20">
                                    Proceed to Payment →
                                </button>
                            </form>
                        ) : (
                            <div className="space-y-4">
                                <button onClick={() => setStep('shipping')} className="text-xs uppercase tracking-wider text-text-secondary hover:text-primary-light transition-colors">
                                    ← Back to Shipping
                                </button>
                                <div className="rounded-2xl bg-surface-card border border-border p-6">
                                    <h3 className="text-lg font-bold mb-5">Payment</h3>
                                    <Elements stripe={stripePromise} options={{ appearance: stripeAppearance }}>
                                        <PaymentForm total={total} onSuccess={handlePaymentSuccess} disabled={items.length === 0} />
                                    </Elements>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Summary */}
                    <div className="lg:col-span-2">
                        <div className="rounded-2xl bg-surface-card border border-border p-6 lg:sticky lg:top-24">
                            <h3 className="text-lg font-bold mb-4">Order Summary</h3>
                            <div className="space-y-3 mb-6 max-h-60 overflow-y-auto hide-scrollbar">
                                {items.map((item, i) => (
                                    <div key={i} className="flex gap-3 items-center">
                                        <img src={item.image} alt="" className="w-12 h-14 rounded-lg object-cover flex-shrink-0" />
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-medium truncate">{item.name}</p>
                                            <p className="text-xs text-text-secondary">{item.size} · x{item.quantity}</p>
                                        </div>
                                        <span className="text-sm font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="space-y-2 text-sm border-t border-border pt-4">
                                <div className="flex justify-between text-text-secondary"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                                <div className="flex justify-between text-text-secondary"><span>Shipping</span><span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span></div>
                                <div className="flex justify-between text-lg font-bold pt-2 border-t border-border"><span>Total</span><span className="text-gradient">${total.toFixed(2)}</span></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
