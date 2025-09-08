import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { toast } from 'react-toastify';

// Async thunks
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (_, { rejectWithValue }) => {
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
  async (_, { rejectWithValue }) => {
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
    filteredProducts: []
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

export const { setSearchTerm, clearSearch, clearError } = productsSlice.actions;

export default productsSlice.reducer;
