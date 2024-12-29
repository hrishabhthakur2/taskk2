'use client'

import { axiosClient } from "@/lib/axiosClient";
import { ReactNode, createContext, useContext, useEffect, useState } from "react";

// Define the type for your context value
type UserContextType = {
  username: string | null;
  setUsername: (username: string | null) => void;
  id: string | null;
  setId: (id: string | null) => void;
};

// Create the context with an initial value matching the type
const UserContext = createContext<UserContextType>({
  username: null,
  setUsername: () => {},
  id: null,
  setId: () => {},
});

export default function UserContextProvider({ children }: { children: ReactNode }) {
  const [username, setUsername] = useState<string | null>(null);
  const [id, setId] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axiosClient.get('/auth/profile');
        if (res.data.status !== 'error') {
          setId(res.data.data.id);
          setUsername(res.data.data.username);
        }
      } catch (err) {
        setId(null);
        setUsername(null);
      }
    };

    fetchProfile();
  }, []);

  const value = {
    username,
    setUsername,
    id,
    setId,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export function useUserContext() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUserContext must be used within a UserContextProvider');
  }
  return context;
}