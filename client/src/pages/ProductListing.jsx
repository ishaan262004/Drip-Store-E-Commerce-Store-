import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { HiOutlineAdjustments, HiOutlineX } from 'react-icons/hi';

const ITEMS_PER_PAGE = 12;

export default function ProductListing() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(false);
    const [page, setPage] = useState(1);

    const category = searchParams.get('category') || '';
    const search = searchParams.get('search') || '';
    const sortParam = searchParams.get('sort') || 'newest';

    const [filters, setFilters] = useState({ category, subcategory: '', brand: '', minPrice: '', maxPrice: '', sort: sortParam });

    useEffect(() => {
        fetch('/products.json')
            .then((r) => r.json())
            .then((data) => { setProducts(data); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    useEffect(() => {
        setFilters((f) => ({ ...f, category: searchParams.get('category') || '', subcategory: '', brand: '', sort: searchParams.get('sort') || 'newest' }));
        setPage(1);
    }, [searchParams]);

    useEffect(() => {
        let result = [...products];
        if (filters.category) result = result.filter((p) => p.category.toLowerCase() === filters.category.toLowerCase());
        if (filters.subcategory) result = result.filter((p) => p.subcategory === filters.subcategory);
        if (search) result = result.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
        if (filters.brand) result = result.filter((p) => p.brand === filters.brand);
        if (filters.minPrice) result = result.filter((p) => p.price >= Number(filters.minPrice));
        if (filters.maxPrice) result = result.filter((p) => p.price <= Number(filters.maxPrice));

        if (filters.sort === 'price_asc') result.sort((a, b) => a.price - b.price);
        else if (filters.sort === 'price_desc') result.sort((a, b) => b.price - a.price);
        else if (filters.sort === 'rating') result.sort((a, b) => b.rating - a.rating);
        else result.sort((a, b) => b.id - a.id);

        setFiltered(result);
    }, [products, filters, search]);

    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    const displayed = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

    const updateFilter = (key, value) => setFilters((f) => ({ ...f, [key]: value }));
    const clearFilters = () => { setFilters({ category: '', subcategory: '', brand: '', minPrice: '', maxPrice: '', sort: 'newest' }); setSearchParams({}); };

    const cats = ['Men', 'Women', 'Accessories'];

    // Get unique subcategories from products (filtered by category if selected)
    const availableSubcategories = [...new Set(
        products
            .filter((p) => !filters.category || p.category.toLowerCase() === filters.category.toLowerCase())
            .map((p) => p.subcategory)
            .filter(Boolean)
    )].sort();

    // Get unique brands from products (filtered by category if selected)
    const availableBrands = [...new Set(
        products
            .filter((p) => !filters.category || p.category.toLowerCase() === filters.category.toLowerCase())
            .filter((p) => !filters.subcategory || p.subcategory === filters.subcategory)
            .map((p) => p.brand)
    )].sort();

    return (
        <div className="min-h-screen pt-24 pb-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-black">
                            {filters.category || 'All'} <span className="text-gradient">Products</span>
                        </h1>
                        <p className="text-text-secondary text-sm mt-1">{filtered.length} products found{search && ` for "${search}"`}</p>
                    </div>
                    <button onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2 px-4 py-2 rounded-full border border-border hover:border-primary/50 text-sm text-text-secondary hover:text-primary-light transition lg:hidden">
                        <HiOutlineAdjustments className="w-4 h-4" /> Filters
                    </button>
                </div>

                <div className="flex gap-8">
                    {/* Sidebar Filters */}
                    <aside className={`${showFilters ? 'fixed inset-0 z-50 bg-surface/95 p-6 overflow-y-auto' : 'hidden'} lg:block lg:static lg:bg-transparent lg:p-0 lg:w-60 flex-shrink-0`}>
                        <div className="flex items-center justify-between lg:hidden mb-6">
                            <h3 className="text-xl font-bold">Filters</h3>
                            <button onClick={() => setShowFilters(false)}><HiOutlineX className="w-6 h-6" /></button>
                        </div>

                        <div className="space-y-6">
                            {/* Category */}
                            <div>
                                <h4 className="text-sm font-bold uppercase tracking-wider text-text-secondary mb-3">Category</h4>
                                <div className="space-y-2">
                                    <button onClick={() => updateFilter('category', '')} className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition ${!filters.category ? 'bg-primary/10 text-primary-light font-semibold' : 'text-text-secondary hover:bg-surface-light'}`}>All</button>
                                    {cats.map((c) => (
                                        <button key={c} onClick={() => updateFilter('category', c)} className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition ${filters.category === c ? 'bg-primary/10 text-primary-light font-semibold' : 'text-text-secondary hover:bg-surface-light'}`}>{c}</button>
                                    ))}
                                </div>
                            </div>

                            {/* Subcategory */}
                            {availableSubcategories.length > 0 && (
                                <div>
                                    <h4 className="text-sm font-bold uppercase tracking-wider text-text-secondary mb-3">Section</h4>
                                    <div className="space-y-2 max-h-60 overflow-y-auto">
                                        <button onClick={() => updateFilter('subcategory', '')} className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition ${!filters.subcategory ? 'bg-primary/10 text-primary-light font-semibold' : 'text-text-secondary hover:bg-surface-light'}`}>All Sections</button>
                                        {availableSubcategories.map((sub) => (
                                            <button key={sub} onClick={() => updateFilter('subcategory', sub)} className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition ${filters.subcategory === sub ? 'bg-primary/10 text-primary-light font-semibold' : 'text-text-secondary hover:bg-surface-light'}`}>{sub}</button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Brand Filter */}
                            {availableBrands.length > 0 && (
                                <div>
                                    <h4 className="text-sm font-bold uppercase tracking-wider text-text-secondary mb-3">Brand</h4>
                                    <div className="space-y-2 max-h-60 overflow-y-auto">
                                        <button onClick={() => updateFilter('brand', '')} className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition ${!filters.brand ? 'bg-primary/10 text-primary-light font-semibold' : 'text-text-secondary hover:bg-surface-light'}`}>All Brands</button>
                                        {availableBrands.map((brand) => (
                                            <button key={brand} onClick={() => updateFilter('brand', brand)} className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition ${filters.brand === brand ? 'bg-primary/10 text-primary-light font-semibold' : 'text-text-secondary hover:bg-surface-light'}`}>{brand}</button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Price */}
                            <div>
                                <h4 className="text-sm font-bold uppercase tracking-wider text-text-secondary mb-3">Price Range</h4>
                                <div className="flex gap-2">
                                    <input type="number" placeholder="Min" value={filters.minPrice} onChange={(e) => updateFilter('minPrice', e.target.value)} className="w-full px-3 py-2 rounded-lg bg-surface-card border border-border text-sm text-text-primary focus:border-primary focus:outline-none" />
                                    <input type="number" placeholder="Max" value={filters.maxPrice} onChange={(e) => updateFilter('maxPrice', e.target.value)} className="w-full px-3 py-2 rounded-lg bg-surface-card border border-border text-sm text-text-primary focus:border-primary focus:outline-none" />
                                </div>
                            </div>

                            {/* Sort */}
                            <div>
                                <h4 className="text-sm font-bold uppercase tracking-wider text-text-secondary mb-3">Sort By</h4>
                                <select value={filters.sort} onChange={(e) => updateFilter('sort', e.target.value)} className="w-full px-3 py-2 rounded-lg bg-surface-card border border-border text-sm text-text-primary focus:border-primary focus:outline-none">
                                    <option value="newest">Newest</option>
                                    <option value="price_asc">Price: Low → High</option>
                                    <option value="price_desc">Price: High → Low</option>
                                    <option value="rating">Top Rated</option>
                                </select>
                            </div>

                            <button onClick={clearFilters} className="w-full py-2 rounded-lg border border-border text-sm text-text-secondary hover:text-accent hover:border-accent/50 transition">Clear All Filters</button>
                            <button onClick={() => setShowFilters(false)} className="w-full py-2.5 rounded-lg bg-black hover:bg-gray-900 text-white font-semibold text-sm lg:hidden border border-white/20">Apply Filters</button>
                        </div>
                    </aside>

                    {/* Products Grid */}
                    <div className="flex-1">
                        {loading ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                                {Array.from({ length: 12 }).map((_, i) => <div key={i} className="rounded-2xl bg-surface-card animate-pulse aspect-[3/4]" />)}
                            </div>
                        ) : displayed.length === 0 ? (
                            <div className="text-center py-20">
                                <p className="text-5xl mb-4">😔</p>
                                <h3 className="text-xl font-bold mb-2">No products found</h3>
                                <p className="text-text-secondary mb-6">Try adjusting your filters or search</p>
                                <button onClick={clearFilters} className="px-6 py-2.5 rounded-full bg-black hover:bg-gray-900 text-white font-semibold text-sm border border-white/20">Clear Filters</button>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                                    {displayed.map((p) => <ProductCard key={p.id} product={p} />)}
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="flex items-center justify-center gap-2 mt-12">
                                        <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="px-4 py-2 rounded-lg border border-border text-sm disabled:opacity-30 hover:border-primary/50 transition">Prev</button>
                                        {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                                            const p = i + 1;
                                            return (
                                                <button key={p} onClick={() => setPage(p)} className={`w-10 h-10 rounded-lg text-sm font-semibold transition ${p === page ? 'bg-black text-white border border-white/20' : 'border border-border text-text-secondary hover:border-primary/50'}`}>{p}</button>
                                            );
                                        })}
                                        {totalPages > 7 && <span className="text-text-secondary">...</span>}
                                        <button disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="px-4 py-2 rounded-lg border border-border text-sm disabled:opacity-30 hover:border-primary/50 transition">Next</button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
