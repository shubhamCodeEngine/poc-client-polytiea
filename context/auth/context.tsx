"use client";

import { createContext, useContext } from "react";

export interface TokenContextType {
  authTokens: {
    accessToken?: string;
    refreshToken?: string;
    expiresOn?: number; // timestamp
  };
  fetchTokens: (authorisationCode: string) => void;
  loading: boolean;
}

export const TokenContext = createContext<TokenContextType>({
  loading: false,
  authTokens: {},
  fetchTokens: () => {},
});

export const useToken = () => {
  return useContext(TokenContext);
};
