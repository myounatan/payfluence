import { User } from '@repo/database/types'
import dotenv from 'dotenv'
import { useEffect, useState } from 'react';
dotenv.config()

export const useLocalUser = (authToken: string | undefined) => {
  const [localUser, setLocalUser] = useState<User | undefined>(undefined);

  useEffect(() => {
    const fetchApi = async () => {
      const options = {method: 'GET', headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${authToken}`
      }};
      fetch(`${process.env.NEXT_PUBLIC_WORKER_PAYFLUENCE}/auth/user`, options).then(response => response.json()).then(
        jsonData => { return setLocalUser(jsonData.data.user) });
    }

    fetchApi()
  }, [authToken]);

  return { localUser };
};
