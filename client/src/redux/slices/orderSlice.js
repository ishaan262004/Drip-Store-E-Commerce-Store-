import { createSlice } from '@reduxjs/toolkit';

const orderSlice = createSlice({
  name: 'orders',
  initialState: { items: [], loading: false, error: null },
  reducers: {
    setLoading: (state) => { state.loading = true; },
    setOrders: (state, action) => { state.loading = false; state.items = action.payload; },
    setError: (state, action) => { state.loading = false; state.error = action.payload; },
  },
});

export const { setLoading, setOrders, setError } = orderSlice.actions;
export default orderSlice.reducer;
