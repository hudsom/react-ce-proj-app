import { configureStore } from '@reduxjs/toolkit';
import comunidadesReducer from './comunidadesSlice';
import timesReducer from './timesSlice';
import authReducer from './authSlice';
import charactersReducer from './charactersSlice';

export const store = configureStore({
  reducer: {
    comunidades: comunidadesReducer,
    times: timesReducer,
    auth: authReducer,
    characters: charactersReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;