import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { toa      .addCase(fetchAllProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.allProducts = action.payload;
        state.lastFetched = Date.now();
      }); from 'react-toastify';

// Async thunks
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (forceRefresh = false, { getState, rejectWithValue }) => {
    const state = getState();
    const { lastFetched, cacheTimeout, products } = state.products;
    
    // Check if we have cached data and it's still valid
    if (!forceRefresh && lastFetched && products.length > 0) {
      const timeSinceLastFetch = Date.now() - lastFetched;
      if (timeSinceLastFetch < cacheTimeout) {
        // Return cached data without making API call
        return products;
      }
    }

    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASEURL}/product/active`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('cracker_token')}`
          }
        }
      );
      return response.data;
    } catch (error) {
      toast.error('Failed to load products');
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch products'
      );
    }
  }
);

export const fetchAllProducts = createAsyncThunk(
  'products/fetchAllProducts',
  async (forceRefresh = false, { getState, rejectWithValue }) => {
    const state = getState();
    const { lastFetched, cacheTimeout, allProducts } = state.products;
    
    // Check if we have cached data and it's still valid
    if (!forceRefresh && lastFetched && allProducts.length > 0) {
      const timeSinceLastFetch = Date.now() - lastFetched;
      if (timeSinceLastFetch < cacheTimeout) {
        // Return cached data without making API call
        return allProducts;
      }
    }

    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASEURL}/product/`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('cracker_token')}`
          }
        }
      );
      return response.data;
    } catch (error) {
      toast.error('Failed to load all products');
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch all products'
      );
    }
  }
);

const productsSlice = createSlice({
  name: 'products',
  initialState: {
    products: [],
    allProducts: [],
    loading: false,
    error: null,
    searchTerm: '',
    filteredProducts: [],
    lastFetched: null,
    cacheTimeout: 5 * 60 * 1000 // 5 minutes cache
  },
  reducers: {
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
      state.filteredProducts = state.products.filter((product) =>
        product.name.toLowerCase().includes(action.payload.toLowerCase())
      );
    },
    clearSearch: (state) => {
      state.searchTerm = '';
      state.filteredProducts = state.products;
    },
    clearError: (state) => {
      state.error = null;
    },
    invalidateCache: (state) => {
      state.lastFetched = null;
    },
    forceRefresh: (state) => {
      state.lastFetched = null;
      state.products = [];
      state.allProducts = [];
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch active products
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
        state.filteredProducts = action.payload;
        state.lastFetched = Date.now();
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch all products
      .addCase(fetchAllProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.allProducts = action.payload;
      })
      .addCase(fetchAllProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { setSearchTerm, clearSearch, clearError, invalidateCache, forceRefresh } = productsSlice.actions;

export default productsSlice.reducer;
