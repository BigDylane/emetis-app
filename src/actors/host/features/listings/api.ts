import { apiClient } from '@/lib/apiClient';

export interface Listing {
  id: string;
  title: string;
}

export function fetchHostListings(): Promise<Listing[]> {
  return apiClient.get<Listing[]>('/host/listings');
}
