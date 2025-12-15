export interface Comunidade {
  id: string;
  nome: string;
  liderComunidade: string;
  gerencia: string;
  descricao?: string;
  imageUri?: string | null;
}

export interface Time {
  id: string;
  nome: string;
  analistaRelacionamento: string;
  desenvolvedor: string;
  comunidadeId: string;
}

export interface AuthState {
  user: any | null;
  loading: boolean;
  error: string | null;
}

export interface RootState {
  comunidades: ComunidadesState;
  times: TimesState;
  auth: AuthState;
}

export interface ComunidadesState {
  items: Comunidade[];
  loading: boolean;
  error: string | null;
}

export interface TimesState {
  items: Time[];
  loading: boolean;
  error: string | null;
}