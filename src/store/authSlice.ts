import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AuthState } from '../types';

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setUser: (state, action: PayloadAction<any>) => {
      state.user = action.payload;
      state.loading = false;
      state.error = null;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearAuth: (state) => {
      state.user = null;
      state.error = null;
      state.loading = false;
    },
  },
});

export const { setLoading, setUser, setError, clearAuth } = authSlice.actions;
export default authSlice.reducer;