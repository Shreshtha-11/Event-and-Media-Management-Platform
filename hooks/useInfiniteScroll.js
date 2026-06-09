'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * useInfiniteScroll
 *
 * @param {Function} fetchFn  — async (page, pageSize) => { data: [], hasMore: boolean }
 * @param {number}   pageSize — items per page (default 20)
 * @returns {{ items, loading, hasMore, loadMore, reset, sentinelRef }}
 */
export function useInfiniteScroll(fetchFn, pageSize = 20) {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const sentinelRef = useRef(null);
  const observerRef = useRef(null);
  const fetchFnRef = useRef(fetchFn);

  // Keep fetchFn ref current to avoid stale closures
  useEffect(() => {
    fetchFnRef.current = fetchFn;
  }, [fetchFn]);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const result = await fetchFnRef.current(page, pageSize);
      const newItems = result?.data ?? result ?? [];

      setItems((prev) => [...prev, ...newItems]);
      setHasMore(
        result?.hasMore !== undefined
          ? result.hasMore
          : newItems.length >= pageSize
      );
      setPage((prev) => prev + 1);
    } catch (err) {
      console.error('[useInfiniteScroll] loadMore failed:', err);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, page, pageSize]);

  const reset = useCallback(() => {
    setItems([]);
    setPage(1);
    setHasMore(true);
    setLoading(false);
  }, []);

  // Set up IntersectionObserver on the sentinel element
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    const node = sentinelRef.current;
    if (!node) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: '200px' }
    );

    observerRef.current.observe(node);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [loadMore]);

  return { items, loading, hasMore, loadMore, reset, sentinelRef };
}

export default useInfiniteScroll;
