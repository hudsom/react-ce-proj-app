import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Character {
  id: string;
  name: string;
  status: string;
  species: string;
  image: string;
  location: {
    name: string;
  };
}

interface CharactersState {
  items: Character[];
  loading: boolean;
  error: string | null;
}

const initialState: CharactersState = {
  items: [],
  loading: false,
  error: null,
};

const charactersSlice = createSlice({
  name: 'characters',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setCharacters: (state, action: PayloadAction<Character[]>) => {
      state.items = action.payload;
      state.loading = false;
      state.error = null;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const { setLoading, setCharacters, setError } = charactersSlice.actions;
export default charactersSlice.reducer;