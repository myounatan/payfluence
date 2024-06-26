import { User } from '@repo/database/types'
import dotenv from 'dotenv'
import { useEffect, useState } from 'react';
dotenv.config()

export const useLocalUser = (authToken: string | undefined): { localUser: User | undefined } => {
  const [localUser, setLocalUser] = useState<User | undefined>(undefined);

  useEffect(() => {
    const fetchApi = async () => {
      console.log("authToken", authToken)
      const options = {method: 'GET', headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${authToken}`
      }};
      fetch(`${process.env.NEXT_PUBLIC_WORKER_PAYFLUENCE}/auth/user/local`, options).then(response => response.json()).then(
        jsonData => { return setLocalUser(jsonData.data.user) });
    }

    fetchApi()
  }, [authToken]);

  return { localUser };
};

export const useAvailableTipEngine = (authToken: string | undefined): { checkAvailability: (slug: string, tipstring: string) => Promise<{ slugAvailable: boolean, tipStringAvailable: boolean }> } => {
  const checkAvailability = async (slug: string, tipstring: string): Promise<{ slugAvailable: boolean, tipStringAvailable: boolean }> => {
    const options = {method: 'GET', headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${authToken}`
    }};
    const response = await fetch(`${process.env.NEXT_PUBLIC_WORKER_PAYFLUENCE}/auth/tipengine/available?slug=${slug}&tipstring=${tipstring}`, options)
    const jsonData = await response.json()

    console.log(jsonData)
    
    return { slugAvailable: jsonData.data.availableSlug, tipStringAvailable: jsonData.data.availableTipString };
  }

  return { checkAvailability };
}
