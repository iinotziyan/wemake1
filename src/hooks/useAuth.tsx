
import { useState, useEffect } from 'react';

export const useAuth = () => {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const authorized = localStorage.getItem('authorized');
      setIsAuthorized(authorized === 'true');
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const logout = () => {
    localStorage.removeItem('authorized');
    setIsAuthorized(false);
    window.location.href = '/';
  };

  return { isAuthorized, isLoading, logout };
};
