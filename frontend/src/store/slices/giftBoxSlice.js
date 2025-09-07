import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { toast } from 'react-toastify';

// Async thunks
export const fetchGiftBoxes = createAsyncThunk(
  'giftBox/fetchGiftBoxes',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASEURL}/giftbox`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('cracker_token')}`
          }
        }
      );
      return response.data;
    } catch (error) {
      toast.error('Failed to load gift boxes');
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch gift boxes'
      );
    }
  }
);

export const createGiftBox = createAsyncThunk(
  'giftBox/createGiftBox',
  async (giftBoxData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASEURL}/giftbox`,
        giftBoxData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('cracker_token')}`
          }
        }
      );
      toast.success('Gift box created successfully!');
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || 'Failed to create gift box';
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

export const updateGiftBox = createAsyncThunk(
  'giftBox/updateGiftBox',
  async (giftBoxData, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BASEURL}/giftbox`,
        giftBoxData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('cracker_token')}`
          }
        }
      );
      toast.success('Gift box updated successfully!');
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || 'Failed to update gift box';
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

export const deleteGiftBox = createAsyncThunk(
  'giftBox/deleteGiftBox',
  async (giftBoxId, { rejectWithValue }) => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_BASEURL}/giftbox/${giftBoxId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('cracker_token')}`
          }
        }
      );
      toast.success('Gift box deleted successfully!');
      return giftBoxId;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || 'Failed to delete gift box';
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

export const toggleGiftBoxStatus = createAsyncThunk(
  'giftBox/toggleStatus',
  async ({ id, currentStatus }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BASEURL}/giftbox`,
        { _id: id, status: !currentStatus },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('cracker_token')}`
          }
        }
      );
      toast.success(
        `Gift box ${!currentStatus ? 'activated' : 'deactivated'} successfully!`
      );
      return { id, status: !currentStatus };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || 'Failed to update status';
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

const giftBoxSlice = createSlice({
  name: 'giftBox',
  initialState: {
    giftBoxes: [],
    cart: [],
    loading: false,
    error: null,
    selectedGiftBox: null,
    isCreating: false,
    isUpdating: false,
    isDeleting: false
  },
  reducers: {
    addToCart: (state, action) => {
      const existingItem = state.cart.find(
        (item) => item._id === action.payload._id
      );
      if (existingItem) {
        existingItem.quantity = action.payload.quantity;
      } else {
        state.cart.push(action.payload);
      }
    },
    removeFromCart: (state, action) => {
      state.cart = state.cart.filter((item) => item._id !== action.payload);
    },
    updateCartQuantity: (state, action) => {
      const { id, quantity } = action.payload;
      const item = state.cart.find((item) => item._id === id);
      if (item) {
        item.quantity = quantity;
      }
    },
    clearCart: (state) => {
      state.cart = [];
    },
    setSelectedGiftBox: (state, action) => {
      state.selectedGiftBox = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch gift boxes
      .addCase(fetchGiftBoxes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGiftBoxes.fulfilled, (state, action) => {
        state.loading = false;
        state.giftBoxes = action.payload;
      })
      .addCase(fetchGiftBoxes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create gift box
      .addCase(createGiftBox.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createGiftBox.fulfilled, (state, action) => {
        state.isCreating = false;
        // Backend returns { message, data: giftBox }
        const newGiftBox = action.payload.data || action.payload;
        state.giftBoxes.push(newGiftBox);
        state.cart = [];
      })
      .addCase(createGiftBox.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload;
      })

      // Update gift box
      .addCase(updateGiftBox.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateGiftBox.fulfilled, (state, action) => {
        state.isUpdating = false;
        // Backend returns { message, data: giftBox }
        const updatedGiftBox = action.payload.data || action.payload;
        const index = state.giftBoxes.findIndex(
          (gb) => gb._id === updatedGiftBox._id
        );
        if (index !== -1) {
          state.giftBoxes[index] = updatedGiftBox;
        }
        state.selectedGiftBox = null;
      })
      .addCase(updateGiftBox.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload;
      })

      // Delete gift box
      .addCase(deleteGiftBox.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteGiftBox.fulfilled, (state, action) => {
        state.isDeleting = false;
        state.giftBoxes = state.giftBoxes.filter(
          (gb) => gb._id !== action.payload
        );
      })
      .addCase(deleteGiftBox.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload;
      })

      // Toggle status
      .addCase(toggleGiftBoxStatus.fulfilled, (state, action) => {
        const { id, status } = action.payload;
        const giftBox = state.giftBoxes.find((gb) => gb._id === id);
        if (giftBox) {
          giftBox.status = status;
        }
      });
  }
});

export const {
  addToCart,
  removeFromCart,
  updateCartQuantity,
  clearCart,
  setSelectedGiftBox,
  clearError
} = giftBoxSlice.actions;

export default giftBoxSlice.reducer;
