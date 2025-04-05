import { useCallback, useEffect, useState } from 'react';

/**
 * Hook for executing SQLite queries with loading, error states and refetch capability
 * @param queryFn Function that returns a promise with the query result
 * @param deps Dependency array that triggers re-fetching when changed
 */
export function useSQLiteQuery<T>(
  queryFn: () => Promise<T>,
  deps: React.DependencyList = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(async () => {
    setLoading(true);
    try {
      const result = await queryFn();
      setData(result);
      setError(null);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      setData(null);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [queryFn]);

  const refetch = useCallback(async () => {
    return execute();
  }, [execute]);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const result = await queryFn();
        if (isMounted) {
          setData(result);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error(String(err)));
          setData(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    setLoading(true);
    fetchData();

    return () => {
      isMounted = false;
    };
  }, [...deps]);

  return { data, loading, error, refetch };
}
