import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Time, TimesState } from '../types';

const initialState: TimesState = {
  items: [],
  loading: false,
  error: null,
};

const timesSlice = createSlice({
  name: 'times',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setTimes: (state, action: PayloadAction<Time[]>) => {
      state.items = action.payload;
      state.loading = false;
      state.error = null;
    },
    addTime: (state, action: PayloadAction<Time>) => {
      state.items.push(action.payload);
    },
    updateTime: (state, action: PayloadAction<Time>) => {
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

export const { setLoading, setTimes, addTime, updateTime, setError } = timesSlice.actions;
export default timesSlice.reducer;