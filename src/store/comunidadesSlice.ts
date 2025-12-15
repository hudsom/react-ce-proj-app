import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Comunidade, ComunidadesState } from '../types';

const initialState: ComunidadesState = {
  items: [],
  loading: false,
  error: null,
};

const comunidadesSlice = createSlice({
  name: 'comunidades',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setComunidades: (state, action: PayloadAction<Comunidade[]>) => {
      state.items = action.payload;
      state.loading = false;
      state.error = null;
    },
    addComunidade: (state, action: PayloadAction<Comunidade>) => {
      state.items.push(action.payload);
    },
    updateComunidade: (state, action: PayloadAction<Comunidade>) => {
      const index = state.items.findIndex(item => item.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const { setLoading, setComunidades, addComunidade, updateComunidade, setError } = comunidadesSlice.actions;
export default comunidadesSlice.reducer;