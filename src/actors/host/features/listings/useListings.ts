import { useQuery } from '@tanstack/react-query';
import { fetchHostListings } from './api';

export const listingsKeys = {
  all: ['host', 'listings'] as const,
};

export function useListings() {
  return useQuery({
    queryKey: listingsKeys.all,
    queryFn: fetchHostListings,
  });
}
