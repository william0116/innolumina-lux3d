import { createContext, useContext, useEffect, useReducer, useCallback, type ReactNode } from 'react';
import {
  getUser as getUserFromStorage,
  setUser as setUserToStorage,
  getPointRecords,
  addPointRecord,
  genId,
  formatDate,
} from '@/lib/app-storage';
import type { IUser, IExtendedCreditRecord } from '@/data/types';
import { initializeAppData } from '@/lib/seed-data';
import { toast } from 'sonner';

// ===== Types =====
interface AuthState {
  user: IUser | null;
  isInitialized: boolean;
  pointRecords: IExtendedCreditRecord[];
}

type AuthAction =
  | { type: 'INIT'; user: IUser | null; records: IExtendedCreditRecord[] }
  | { type: 'LOGIN'; user: IUser }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; user: Partial<IUser> }
  | { type: 'SET_POINTS'; points: number; record: IExtendedCreditRecord };

// ===== Context =====
const AuthContext = createContext<{
  state: AuthState;
  login: (user: IUser) => void;
  logout: () => void;
  updateUser: (patch: Partial<IUser>) => void;
  deductPoints: (amount: number, bizType: IExtendedCreditRecord['bizType'], description: string, bizId?: string) => boolean;
  addPoints: (amount: number, bizType: IExtendedCreditRecord['bizType'], description: string, bizId?: string) => void;
  refreshUser: () => void;
} | null>(null);

// ===== Reducer =====
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'INIT':
      return { ...state, user: action.user, pointRecords: action.records, isInitialized: true };
    case 'LOGIN':
      return { ...state, user: action.user };
    case 'LOGOUT':
      return { ...state, user: null };
    case 'UPDATE_USER':
      if (!state.user) return state;
      return { ...state, user: { ...state.user, ...action.user } };
    case 'SET_POINTS':
      if (!state.user) return state;
      return {
        ...state,
        user: { ...state.user, points: action.points },
        pointRecords: [action.record, ...state.pointRecords],
      };
    default:
      return state;
  }
}

// ===== Provider =====
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    isInitialized: false,
    pointRecords: [],
  });

  // 初始化
  useEffect(() => {
    initializeAppData();
    const user = getUserFromStorage();
    const records = getPointRecords();
    dispatch({ type: 'INIT', user, records });

    // 多标签页同步
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'innolumina_user') {
        const u = getUserFromStorage();
        if (!u) {
          dispatch({ type: 'LOGOUT' });
        } else if (!state.user || u.id !== state.user.id || u.points !== state.user.points) {
          dispatch({ type: 'LOGIN', user: u });
        }
      }
      if (e.key === 'innolumina_point_records') {
        dispatch({ type: 'INIT', user: state.user, records: getPointRecords() });
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback((user: IUser) => {
    setUserToStorage(user);
    dispatch({ type: 'LOGIN', user });
  }, []);

  const logout = useCallback(() => {
    setUserToStorage(null);
    dispatch({ type: 'LOGOUT' });
    toast.info('已退出登录');
  }, []);

  const updateUser = useCallback((patch: Partial<IUser>) => {
    const current = getUserFromStorage();
    if (!current) return;
    const updated = { ...current, ...patch };
    setUserToStorage(updated);
    dispatch({ type: 'UPDATE_USER', user: patch });
  }, []);

  const deductPoints = useCallback((amount: number, bizType: IExtendedCreditRecord['bizType'], description: string, bizId?: string): boolean => {
    const current = getUserFromStorage();
    if (!current) {
      toast.error('请先登录');
      return false;
    }
    if (current.points < amount) {
      toast.error('积分不足，请先充值');
      return false;
    }
    const newPoints = current.points - amount;
    const record: IExtendedCreditRecord = {
      id: genId('pr_'),
      type: 'consume',
      amount,
      balance: newPoints,
      bizType,
      bizId,
      description,
      createdAt: formatDate(new Date()),
    };
    addPointRecord(record);
    const updatedUser = { ...current, points: newPoints };
    setUserToStorage(updatedUser);
    dispatch({ type: 'SET_POINTS', points: newPoints, record });
    return true;
  }, []);

  const addPoints = useCallback((amount: number, bizType: IExtendedCreditRecord['bizType'], description: string, bizId?: string) => {
    const current = getUserFromStorage();
    if (!current) return;
    const newPoints = current.points + amount;
    const record: IExtendedCreditRecord = {
      id: genId('pr_'),
      type: 'recharge',
      amount,
      balance: newPoints,
      bizType,
      bizId,
      description,
      createdAt: formatDate(new Date()),
    };
    addPointRecord(record);
    const updatedUser = { ...current, points: newPoints };
    setUserToStorage(updatedUser);
    dispatch({ type: 'SET_POINTS', points: newPoints, record });
  }, []);

  const refreshUser = useCallback(() => {
    const u = getUserFromStorage();
    if (u) {
      dispatch({ type: 'LOGIN', user: u });
    } else {
      dispatch({ type: 'LOGOUT' });
    }
  }, []);

  return (
    <AuthContext.Provider value={{ state, login, logout, updateUser, deductPoints, addPoints, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
