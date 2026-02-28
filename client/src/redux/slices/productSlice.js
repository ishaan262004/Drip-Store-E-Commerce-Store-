import { createSlice } from '@reduxjs/toolkit';

const productSlice = createSlice({
  name: 'products',
  initialState: {
    items: [],
    currentProduct: null,
    loading: false,
    error: null,
    filters: { category: '', search: '', minPrice: '', maxPrice: '', sort: 'newest' },
    pagination: { currentPage: 1, totalPages: 1, total: 0 },
  },
  reducers: {
    setLoading: (state) => { state.loading = true; },
    setProducts: (state, action) => {
      state.loading = false;
      state.items = action.payload.products;
      state.pagination = {
        currentPage: action.payload.currentPage,
        totalPages: action.payload.totalPages,
        total: action.payload.total,
      };
    },
    setCurrentProduct: (state, action) => { state.loading = false; state.currentProduct = action.payload; },
    setFilters: (state, action) => { state.filters = { ...state.filters, ...action.payload }; },
    setError: (state, action) => { state.loading = false; state.error = action.payload; },
    clearProduct: (state) => { state.currentProduct = null; },
  },
});

export const { setLoading, setProducts, setCurrentProduct, setFilters, setError, clearProduct } = productSlice.actions;
export default productSlice.reducer;
