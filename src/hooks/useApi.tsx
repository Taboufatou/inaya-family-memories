import { useState, useCallback } from 'react';
import { apiClient } from '@/utils/apiClient';
import { useToast } from '@/hooks/use-toast';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useApi<T = any>() {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null
  });
  
  const { toast } = useToast();

  const execute = useCallback(async (
    apiCall: () => Promise<any>,
    options?: {
      successMessage?: string;
      errorMessage?: string;
      showSuccessToast?: boolean;
      showErrorToast?: boolean;
    }
  ) => {
    const {
      successMessage,
      errorMessage = 'Une erreur est survenue',
      showSuccessToast = false,
      showErrorToast = true
    } = options || {};

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await apiCall();
      
      if (response.success) {
        setState({
          data: response.data,
          loading: false,
          error: null
        });

        if (showSuccessToast && successMessage) {
          toast({
            title: "Succès",
            description: successMessage,
          });
        }

        return response.data;
      } else {
        const error = response.error || errorMessage;
        setState(prev => ({
          ...prev,
          loading: false,
          error
        }));

        if (showErrorToast) {
          toast({
            title: "Erreur",
            description: error,
            variant: "destructive",
          });
        }

        throw new Error(error);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : errorMessage;
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMsg
      }));

      if (showErrorToast) {
        toast({
          title: "Erreur",
          description: errorMsg,
          variant: "destructive",
        });
      }

      throw error;
    }
  }, [toast]);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null
    });
  }, []);

  return {
    ...state,
    execute,
    reset
  };
}

// Hook spécialisé pour les listes avec pagination
export function useApiList<T = any>() {
  const [items, setItems] = useState<T[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    hasMore: false
  });
  
  const api = useApi<T[]>();

  const loadItems = useCallback(async (
    apiCall: () => Promise<any>,
    options?: {
      append?: boolean;
      resetPagination?: boolean;
    }
  ) => {
    const { append = false, resetPagination = false } = options || {};

    try {
      const data = await api.execute(apiCall);
      
      if (data) {
        if (append) {
          setItems(prev => [...prev, ...data]);
        } else {
          setItems(data);
        }

        if (resetPagination) {
          setPagination(prev => ({
            ...prev,
            page: 1,
            total: data.length,
            hasMore: data.length >= prev.limit
          }));
        }
      }
    } catch (error) {
      // L'erreur est déjà gérée par useApi
    }
  }, [api]);

  const loadMore = useCallback(async (apiCall: () => Promise<any>) => {
    setPagination(prev => ({ ...prev, page: prev.page + 1 }));
    await loadItems(apiCall, { append: true });
  }, [loadItems]);

  const addItem = useCallback((item: T) => {
    setItems(prev => [item, ...prev]);
    setPagination(prev => ({ ...prev, total: prev.total + 1 }));
  }, []);

  const updateItem = useCallback((id: number, updatedItem: Partial<T>) => {
    setItems(prev => prev.map(item => 
      (item as any).id === id ? { ...item, ...updatedItem } : item
    ));
  }, []);

  const removeItem = useCallback((id: number) => {
    setItems(prev => prev.filter(item => (item as any).id !== id));
    setPagination(prev => ({ ...prev, total: Math.max(0, prev.total - 1) }));
  }, []);

  return {
    items,
    pagination,
    loading: api.loading,
    error: api.error,
    loadItems,
    loadMore,
    addItem,
    updateItem,
    removeItem,
    reset: () => {
      setItems([]);
      setPagination({ page: 1, limit: 10, total: 0, hasMore: false });
      api.reset();
    }
  };
}