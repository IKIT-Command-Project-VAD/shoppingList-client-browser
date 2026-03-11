import { useEffect, useState } from 'react';

type UserInfo = {
  name: string;
  claims: { type: string; value: string }[];
};

export function useUser() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await fetch('/bff/user', {
          credentials: 'include',
        });
        if (res.status === 401) {
          setUser(null);
        } else {
          const data = await res.json();
          setUser(data);
        }
      } catch (e) {
        console.error(e);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    void loadUser();
  }, []);

  const userId = user?.claims.find(
    (c) =>
      c.type === 'sub' ||
      c.type === 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier',
  )?.value;

  return { user, userId, loading };
}
