import { useState, useCallback, useEffect } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import { router } from 'expo-router';
import { isPasswordSet, verifyPassword, setPassword, changePassword, removePassword } from '@/lib/auth';

interface AuthState {
  isLocked: boolean;
  isPasswordConfigured: boolean;
  isLoading: boolean;
  error: string | null;
}

export function useAuth() {
  const db = useSQLiteContext();
  const [state, setState] = useState<AuthState>({
    isLocked: true,
    isPasswordConfigured: false,
    isLoading: true,
    error: null,
  });

  const checkAuth = useCallback(async () => {
    setState((s) => ({ ...s, isLoading: true }));
    try {
      const configured = await isPasswordSet(db);
      setState({ isLocked: configured, isPasswordConfigured: configured, isLoading: false, error: null });
    } catch {
      setState((s) => ({ ...s, isLoading: false }));
    }
  }, [db]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = useCallback(async (password: string): Promise<boolean> => {
    setState((s) => ({ ...s, error: null }));
    const ok = await verifyPassword(password);
    if (ok) {
      setState((s) => ({ ...s, isLocked: false }));
      router.replace('/(main)');
      return true;
    } else {
      setState((s) => ({ ...s, error: 'Password salah. Coba lagi.' }));
      return false;
    }
  }, []);

  const setup = useCallback(async (password: string): Promise<void> => {
    await setPassword(db, password);
    setState({ isLocked: false, isPasswordConfigured: true, isLoading: false, error: null });
    router.replace('/(main)');
  }, [db]);

  const handleChangePassword = useCallback(
    async (current: string, next: string): Promise<{ success: boolean; error?: string }> => {
      return changePassword(db, current, next);
    }, [db]);

  const handleRemovePassword = useCallback(async (): Promise<void> => {
    await removePassword(db);
    setState((s) => ({ ...s, isPasswordConfigured: false }));
  }, [db]);

  const lock = useCallback(() => {
    setState((s) => ({ ...s, isLocked: true }));
    router.replace('/(auth)/login');
  }, []);

  return {
    ...state,
    login,
    setup,
    changePassword: handleChangePassword,
    removePassword: handleRemovePassword,
    lock,
    checkAuth,
  };
}
