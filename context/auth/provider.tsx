"use client";

import { useEffect, useState } from "react";
import { TokenContext, TokenContextType } from "./context";

const operations = window.crypto.subtle;
const ALGO_NAME = "AES-GCM";
const iv = window.crypto.getRandomValues(new Uint8Array(12));
const superSecret = "password";

export const EncryptTokenData = async (
  tokenData: TokenContextType["authTokens"]
): Promise<string> => {
  if (!operations) {
    alert("Web Crypto is not supported on this browser");
    console.warn("Web Crypto API not supported");
    return JSON.stringify(tokenData);
  }

  const encoder = new TextEncoder();
  const key = await operations.generateKey(
    {
      name: ALGO_NAME,
      length: 256,
    },
    true,
    ["encrypt", "decrypt"]
  );

  const encryptedData = await operations.encrypt(
    {
      name: ALGO_NAME,
      iv,
    },
    key,
    encoder.encode(JSON.stringify(tokenData))
  );

  // change array buffer to string
  const encryptedDataString = Array.from(new Uint8Array(encryptedData))
    .map((byte) => String.fromCharCode(byte))
    .join("");

  return encryptedDataString;
};
export const DecryptTokenData = async (
  encryptedTokenData: string
): Promise<TokenContextType["authTokens"]> => {
  if (!operations) {
    alert("Web Crypto is not supported on this browser");
    console.warn("Web Crypto API not supported");
    return JSON.parse(encryptedTokenData);
  }

  const decoder = new TextDecoder();
  const key = await operations.generateKey(
    {
      name: ALGO_NAME,
      length: 256,
    },
    true,
    ["encrypt", "decrypt"]
  );

  // Convert string back to array buffer for decryption
  const encryptedData = new Uint8Array(
    encryptedTokenData.split("").map((char) => char.charCodeAt(0))
  ).buffer;

  const decryptedData = await operations.decrypt(
    {
      name: ALGO_NAME,
      iv,
    },
    key,
    encryptedData
  );

  const decryptedDataString = decoder.decode(decryptedData);
  return JSON.parse(decryptedDataString);
};

export const TokenContextProvider = ({
  children,
}: {
  children?: React.ReactNode;
}) => {
  const [authTokens, setAuthTokens] = useState<TokenContextType["authTokens"]>(
    {}
  );
  const [loading, setLoading] = useState(true);

  const loadTokens = async () => {
    const tokenData = localStorage.getItem("tokenData");
    if (tokenData) {
      const decryptedTokenData = await DecryptTokenData(tokenData);
      setAuthTokens(decryptedTokenData);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadTokens();
    // fetchTokens("authorisationCode");
  }, []);

  const fetchTokens = async (authorisationCode: string) => {
    // fetch tokens from server
    // for now I am hardcoding the tokens
    const accessToken = "accessToken";
    const refreshToken = "refreshToken";
    const expiresOn = Date.now() + 3600 * 1000; // 1 hour
    const tokenData = { accessToken, refreshToken, expiresOn };
    setAuthTokens(tokenData);
    // save tokens to loacal storage
    const encryptedTokenData = await EncryptTokenData(tokenData);
    localStorage.setItem("tokenData", encryptedTokenData);
  };

  return (
    <TokenContext.Provider
      value={{
        authTokens,
        fetchTokens,
        loading,
      }}
    >
      {children}
    </TokenContext.Provider>
  );
};
