import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@repo/database/types';
import dotenv from 'dotenv';
dotenv.config();

// Define the context
interface UserContextProps {
  localUser: User | undefined;
}

const UserContext = createContext<UserContextProps | undefined>(undefined);

interface UserContextProviderProps {
  authToken: string | undefined;
  children: React.ReactNode;
}

// Define the TipEngine provider component
const UserContextProvider = ({ children, authToken }: UserContextProviderProps) => {
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

  return (
    <UserContext.Provider value={{ localUser }}>
      {children}
    </UserContext.Provider>
  );
};

// Custom hook to access the WalletContext
const useUserContext = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUserContext must be used within a UserContextProvider');
  }
  return context;
};

export { UserContextProvider, useUserContext };