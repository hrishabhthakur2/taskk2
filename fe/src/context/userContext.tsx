"use client"
import { axiosClient } from "@/lib/axiosClient";
import { ReactNode, createContext, useContext, useEffect, useState } from "react";

const UserContext = createContext<any>({});

export default function UserContextProviders({ children } : { children: ReactNode }) {
  const [username, setUsername] = useState(null);
  const [id, setId] = useState(null);

  useEffect(() => {
    try {
      axiosClient.get('/auth/profile').then(res => {
        if(res.data.status != 'error') {
          setId(res.data.data.id);
          setUsername(res.data.data.username);
        }
      })
    } catch(err) {
      setId(null);
      setUsername(null);
    }
  }, [])

  return (
    <UserContext.Provider value={{ username, setUsername, id, setId }}>
      {children}
    </UserContext.Provider>
  )
}

export function UseUserContext() {
  return useContext(UserContext);
}

