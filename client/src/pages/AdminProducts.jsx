import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { HiOutlineCube, HiOutlineTrash, HiOutlineMagnifyingGlass, HiOutlineXCircle } from 'react-icons/hi2';
import { fetchProducts, deleteProduct } from '../services/api';

export default function AdminProducts() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [deleting, setDeleting] = useState(null);
    const [confirmId, setConfirmId] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        document.title = 'Products — Admin Dashboard';
        loadProducts();
    }, []);

    const loadProducts = async () => {
        try {
            setLoading(true);
            const { data } = await fetchProducts({ limit: 500 });
            setProducts(data.products || data.data || []);
        } catch (err) {
            toast.error('Failed to load products');
            if (err.response?.status === 403) navigate('/');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            setDeleting(id);
            await deleteProduct(id);
            setProducts((prev) => prev.filter((p) => p._id !== id));
            toast.success('Product deleted');
        } catch {
            toast.error('Failed to delete product');
        } finally {
            setDeleting(null);
            setConfirmId(null);
        }
    };

    const filtered = search.trim()
        ? products.filter((p) =>
            p.name?.toLowerCase().includes(search.toLowerCase()) ||
            p.category?.toLowerCase().includes(search.toLowerCase()) ||
            p.brand?.toLowerCase().includes(search.toLowerCase())
        )
        : products;

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-2 border-primary-light border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-black">Products</h1>
                    <p className="text-sm text-text-secondary">{products.length} products in catalog</p>
                </div>
                <div className="relative">
                    <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search products..."
                        className="pl-9 pr-4 py-2 rounded-xl bg-surface-card border border-border text-sm focus:border-primary focus:outline-none w-56"
                    />
                </div>
            </div>

            {/* Confirm Delete Modal */}
            {confirmId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="bg-surface-card border border-border rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl">
                        <div className="flex items-center gap-3 mb-4">
                            <HiOutlineXCircle className="w-8 h-8 text-red-400 flex-shrink-0" />
                            <div>
                                <h3 className="font-bold">Delete Product?</h3>
                                <p className="text-sm text-text-secondary">This action cannot be undone.</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setConfirmId(null)} className="flex-1 py-2.5 rounded-xl bg-surface border border-border text-sm font-medium hover:border-border/80 transition">
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDelete(confirmId)}
                                disabled={deleting === confirmId}
                                className="flex-1 py-2.5 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 text-sm font-medium hover:bg-red-500/30 transition disabled:opacity-50"
                            >
                                {deleting === confirmId ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="rounded-2xl bg-surface-card border border-border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-border">
                                <th className="text-left px-5 py-3 text-xs font-semibold text-text-secondary tracking-wider">Product</th>
                                <th className="text-left px-5 py-3 text-xs font-semibold text-text-secondary tracking-wider hidden sm:table-cell">Category</th>
                                <th className="text-left px-5 py-3 text-xs font-semibold text-text-secondary tracking-wider hidden md:table-cell">Brand</th>
                                <th className="text-right px-5 py-3 text-xs font-semibold text-text-secondary tracking-wider">Price</th>
                                <th className="text-right px-5 py-3 text-xs font-semibold text-text-secondary tracking-wider hidden sm:table-cell">Stock</th>
                                <th className="text-right px-5 py-3 text-xs font-semibold text-text-secondary tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filtered.map((product) => (
                                <tr key={product._id} className="hover:bg-surface/50 transition-colors">
                                    <td className="px-5 py-3.5">
                                        <div className="flex items-center gap-3">
                                            {product.images?.[0] ? (
                                                <img
                                                    src={product.images[0]}
                                                    alt={product.name}
                                                    className="w-9 h-9 rounded-lg object-cover bg-surface flex-shrink-0"
                                                    onError={(e) => { e.target.style.display = 'none'; }}
                                                />
                                            ) : (
                                                <div className="w-9 h-9 rounded-lg bg-surface flex items-center justify-center flex-shrink-0">
                                                    <HiOutlineCube className="w-4 h-4 text-text-secondary" />
                                                </div>
                                            )}
                                            <span className="font-medium truncate max-w-[140px] sm:max-w-[200px]">{product.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3.5 text-text-secondary hidden sm:table-cell">
                                        <span className="truncate">{product.category}</span>
                                        {product.subcategory && <span className="text-xs"> / {product.subcategory}</span>}
                                    </td>
                                    <td className="px-5 py-3.5 text-text-secondary hidden md:table-cell">{product.brand || '—'}</td>
                                    <td className="px-5 py-3.5 text-right font-semibold">${product.price?.toFixed(2)}</td>
                                    <td className="px-5 py-3.5 text-right hidden sm:table-cell">
                                        <span className={product.stock > 0 ? 'text-green-400' : 'text-red-400'}>
                                            {product.stock ?? '—'}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3.5 text-right">
                                        <button
                                            onClick={() => setConfirmId(product._id)}
                                            className="p-2 rounded-lg text-text-secondary hover:text-red-400 hover:bg-red-500/10 transition"
                                            title="Delete product"
                                        >
                                            <HiOutlineTrash className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="text-center py-16 text-text-secondary">
                                        No products found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
