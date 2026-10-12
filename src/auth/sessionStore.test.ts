import { useSessionStore } from './sessionStore';

test('setUser stores the user and logout clears it', () => {
  const traveler = { id: '1', email: 't@emetis.net', name: 'Traveler', role: 'traveler' as const };

  useSessionStore.getState().setUser(traveler);
  expect(useSessionStore.getState().user).toEqual(traveler);

  useSessionStore.getState().logout();
  expect(useSessionStore.getState().user).toBeNull();
});
