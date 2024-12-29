'use client';

import { ApolloProvider } from "@apollo/client";
import { client } from "../lib/apolloClient";
import UserContextProviders from "@/context/userContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ApolloProvider client={client}>
      <UserContextProviders>
        {children}
      </UserContextProviders>
    </ApolloProvider>
  );
}