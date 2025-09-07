import { configureStore } from '@reduxjs/toolkit';
import giftBoxReducer from './slices/giftBoxSlice';
import productsReducer from './slices/productsSlice';

export const store = configureStore({
  reducer: {
    giftBox: giftBoxReducer,
    products: productsReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE']
      }
    })
});

export default store;
