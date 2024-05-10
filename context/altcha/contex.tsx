"use client";

import { createContext, useContext } from "react";

export interface AltchaContextType {
  verified: boolean;
  id?: string;
}

export const AltchaContext = createContext<AltchaContextType>({
  verified: false,
});

export const useAltcha = () => {
  return useContext(AltchaContext);
};
