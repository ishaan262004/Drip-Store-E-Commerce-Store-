import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { HiOutlineTruck, HiOutlineCheckCircle, HiOutlineClock, HiOutlineXCircle } from 'react-icons/hi2';
import { getAdminOrders, updateOrderStatus as apiUpdateOrderStatus } from '../services/api';

const statusColors = {
    Processing: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    Shipped: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    Delivered: 'bg-green-500/10 text-green-400 border-green-500/20',
    Cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const statusIcons = {
    Processing: HiOutlineClock,
    Shipped: HiOutlineTruck,
    Delivered: HiOutlineCheckCircle,
    Cancelled: HiOutlineXCircle,
};

const paymentColors = {
    Paid: 'text-green-400',
    Pending: 'text-yellow-400',
    Failed: 'text-red-400',
    Refunded: 'text-orange-400',
};

export default function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [updating, setUpdating] = useState(null);

    useEffect(() => {
        document.title = 'Orders — Admin Dashboard';
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            setError(null);
            const { data } = await getAdminOrders();
            if (data.success) {
                setOrders(data.orders);
            } else {
                setError(data.message || 'Failed to load orders');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (orderId, newStatus) => {
        try {
            setUpdating(orderId);
            const { data } = await apiUpdateOrderStatus(orderId, { orderStatus: newStatus });
            if (data.success) {
                setOrders((prev) => prev.map((o) => (o._id === orderId ? { ...o, orderStatus: newStatus } : o)));
                toast.success(`Order updated to ${newStatus}`, { theme: 'dark' });
            } else {
                toast.error(data.message || 'Failed to update');
            }
        } catch {
            toast.error('Failed to update order');
        } finally {
            setUpdating(null);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-2 border-primary-light border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
                <HiOutlineXCircle className="w-12 h-12 text-red-400" />
                <p className="text-red-400 text-sm">{error}</p>
                <button onClick={fetchOrders} className="text-xs text-primary-light hover:underline">Retry</button>
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-black">Orders</h1>
                    <p className="text-sm text-text-secondary">{orders.length} total orders</p>
                </div>
                <button onClick={fetchOrders} className="px-4 py-2 rounded-xl bg-surface-card border border-border text-sm hover:border-primary/30 transition">
                    Refresh
                </button>
            </div>

            {orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 gap-3">
                    <HiOutlineTruck className="w-12 h-12 text-text-secondary" />
                    <p className="text-text-secondary text-sm">No orders yet</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => {
                        const StatusIcon = statusIcons[order.orderStatus] || HiOutlineClock;
                        return (
                            <div key={order._id} className="rounded-2xl bg-surface-card border border-border p-5 transition hover:border-border/80">
                                {/* Header */}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-xl border ${statusColors[order.orderStatus]}`}>
                                            <StatusIcon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-mono text-text-secondary">#{order._id.slice(-8).toUpperCase()}</p>
                                            <p className="text-sm font-semibold">{order.userId?.name || 'Guest'}</p>
                                            {order.userId?.email && (
                                                <p className="text-xs text-text-secondary">{order.userId.email}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={`text-xs font-semibold ${paymentColors[order.paymentStatus]}`}>
                                            {order.paymentStatus}
                                        </span>
                                        <span className="text-lg font-black">${order.totalPrice?.toFixed(2)}</span>
                                    </div>
                                </div>

                                {/* Items */}
                                <div className="mb-4 space-y-1.5">
                                    {order.products?.map((item, i) => (
                                        <div key={i} className="flex justify-between text-sm">
                                            <span className="text-text-secondary">
                                                {item.name || item.productId?.name || 'Product'} × {item.quantity}
                                            </span>
                                            <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Shipping */}
                                {order.shippingAddress && (
                                    <p className="text-xs text-text-secondary mb-4">
                                        📍 {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}
                                    </p>
                                )}

                                {/* Stripe ID */}
                                {order.stripePaymentIntentId && (
                                    <p className="text-xs text-text-secondary mb-4 font-mono">
                                        💳 {order.stripePaymentIntentId}
                                    </p>
                                )}

                                {/* Footer */}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-border">
                                    <p className="text-xs text-text-secondary">
                                        {new Date(order.createdAt).toLocaleDateString('en-US', {
                                            month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
                                        })}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <select
                                            value={order.orderStatus}
                                            onChange={(e) => updateStatus(order._id, e.target.value)}
                                            disabled={updating === order._id}
                                            className="px-3 py-1.5 rounded-lg bg-surface border border-border text-xs font-medium text-text-primary focus:border-primary focus:outline-none cursor-pointer disabled:opacity-50"
                                        >
                                            <option value="Processing">Processing</option>
                                            <option value="Shipped">Shipped</option>
                                            <option value="Delivered">Delivered</option>
                                            <option value="Cancelled">Cancelled</option>
                                        </select>
                                        {updating === order._id && (
                                            <div className="w-4 h-4 border-2 border-primary-light border-t-transparent rounded-full animate-spin" />
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
