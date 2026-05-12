import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { COLORS } from '../../constants/colors';

type ToastType = 'success' | 'error' | 'neutral';

type ToastState = {
  id: number;
  message: string;
  type: ToastType;
};

type ToastContextValue = {
  showToast: (message: string, type?: ToastType) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

type ToastProviderProps = {
  children: ReactNode;
};

export function ToastProvider({ children }: ToastProviderProps) {
  const [toast, setToast] = useState<ToastState | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((message: string, type: ToastType = 'neutral') => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setToast({
      id: Date.now(),
      message,
      type,
    });
  }, []);

  useEffect(() => {
    if (!toast) {
      return undefined;
    }

    timeoutRef.current = setTimeout(() => {
      setToast(null);
    }, 2600);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [toast]);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      <View style={styles.root}>
        {children}
        {toast ? (
          <View style={[styles.toast, styles[toast.type]]}>
            <Text style={[styles.message, styles[`${toast.type}Text`]]}>
              {toast.message}
            </Text>
          </View>
        ) : null}
      </View>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const value = useContext(ToastContext);

  if (!value) {
    throw new Error('useToast must be used inside ToastProvider');
  }

  return value;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  toast: {
    position: 'absolute',
    right: 18,
    bottom: 28,
    left: 18,
    zIndex: 50,
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: COLORS.textPrimary,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.1,
    shadowRadius: 18,
    elevation: 4,
  },
  success: {
    borderColor: COLORS.accentLight,
    backgroundColor: COLORS.accentVeryLight,
  },
  error: {
    borderColor: '#FCA5A5',
    backgroundColor: '#FEF2F2',
  },
  neutral: {
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  message: {
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
  successText: {
    color: COLORS.accentDark,
  },
  errorText: {
    color: '#B91C1C',
  },
  neutralText: {
    color: COLORS.textPrimary,
  },
});
