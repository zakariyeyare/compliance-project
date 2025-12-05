import { renderHook } from '@testing-library/react';
import AuthContext from '../../../src/components/AuthContextBase';
import { useAuth } from '../../../src/hooks/useAuth';

const createWrapper = (value) => {
  const Wrapper = ({ children }) => (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
  return Wrapper;
};

describe('useAuth hook', () => {
  it('returns the context value when wrapped in AuthProvider', () => {
    const mockValue = { user: { id: '123' }, loading: false };
    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper(mockValue) });

    expect(result.current).toEqual(mockValue);
  });

  it('throws when used outside of AuthProvider', () => {
    const renderOutsideProvider = () => renderHook(() => useAuth());

    expect(renderOutsideProvider).toThrow('useAuth must be used within an AuthProvider');
  });
});
