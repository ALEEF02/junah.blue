import { useCallback, useEffect, useMemo, useState } from 'react';

export const usePathRouter = () => {
  const [path, setPath] = useState(() => window.location.pathname || '/');

  useEffect(() => {
    const onPopState = () => setPath(window.location.pathname || '/');
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigate = useCallback((nextPath: string) => {
    if (nextPath === path) return;
    window.history.pushState({}, '', nextPath);
    setPath(nextPath);
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [path]);

  const replace = useCallback((nextPath: string) => {
    window.history.replaceState({}, '', nextPath);
    setPath(nextPath);
  }, []);

  return useMemo(
    () => ({
      path,
      navigate,
      replace
    }),
    [path, navigate, replace]
  );
};
