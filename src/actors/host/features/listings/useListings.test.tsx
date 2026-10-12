import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useListings } from './useListings';
import * as api from './api';

jest.mock('./api');

function createWrapper() {
  const queryClient = new QueryClient();

  function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }

  return Wrapper;
}

test('returns listings once the query resolves', async () => {
  jest.spyOn(api, 'fetchHostListings').mockResolvedValue([{ id: '1', title: 'Loft Paris' }]);

  const { result } = renderHook(() => useListings(), { wrapper: createWrapper() });

  await waitFor(() => expect(result.current.isLoading).toBe(false));

  expect(result.current.data).toEqual([{ id: '1', title: 'Loft Paris' }]);
});
