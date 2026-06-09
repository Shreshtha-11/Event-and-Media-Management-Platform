'use client';
import { useRef } from 'react';
import useInfiniteScroll from '@/hooks/useInfiniteScroll';
import MediaGrid from './MediaGrid';
import Loader from '../ui/Loader';
import './media.css';

export default function InfiniteGallery({ fetchUrl, pageSize = 20, onItemClick, filters = {} }) {
  const fetchFn = async (page) => {
    const params = new URLSearchParams({ page: page.toString(), limit: pageSize.toString(), ...filters });
    const res = await fetch(`${fetchUrl}?${params}`);
    const data = await res.json();
    return Array.isArray(data) ? data : data.media || data.items || [];
  };

  const { items, loading, hasMore, sentinelRef } = useInfiniteScroll(fetchFn, pageSize);

  return (
    <div className="infinite-gallery">
      <MediaGrid items={items} loading={loading && items.length === 0} onItemClick={onItemClick} />
      <div ref={sentinelRef} className="infinite-gallery-sentinel">
        {loading && items.length > 0 && <Loader type="dots" size="md" />}
        {!hasMore && items.length > 0 && (
          <p className="infinite-gallery-end">✨ You've seen it all!</p>
        )}
      </div>
    </div>
  );
}
