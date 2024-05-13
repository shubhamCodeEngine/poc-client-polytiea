"use client";

import React, { useState, useEffect } from "react";

type CryptoTestProps = {};

interface EncryptedData {
  id: number;
  encryptedData: string;
}

// Done Using web crypto API

const CryptoTest: React.FC<CryptoTestProps> = () => {
  const [encryptedData, setEncryptedData] = useState<string>("");
  const [decryptedData, setDecryptedData] = useState<string>("");

  const iteration: number = 10;
  const encryptionAlgorithm: string = "AES-GCM";
  const ivLength: number = 12;
  const saltLength: number = 16;
  const digest: string = "SHA-256";
  const enc: TextEncoder = new TextEncoder();
  const dec: TextDecoder = new TextDecoder();

  const base64Encode = (u8: Uint8Array): string => {
    let binary = "";
    const bytes = new Uint8Array(u8);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  const base64Decode = (str: string): Uint8Array => {
    return Uint8Array.from(atob(str), (c) => c.charCodeAt(0));
  };

  const getPasswordKey = async (secretKey: string): Promise<CryptoKey> => {
    return window.crypto.subtle.importKey(
      "raw",
      enc.encode(secretKey),
      "PBKDF2",
      false,
      ["deriveKey"]
    );
  };

  const deriveKey = async (
    passwordKey: CryptoKey,
    salt: Uint8Array,
    iteration: number,
    digest: string,
    encryptionAlgorithm: string,
    keyUsage: KeyUsage[]
  ): Promise<CryptoKey> => {
    return window.crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt,
        iterations: iteration,
        hash: digest,
      },
      passwordKey,
      {
        name: encryptionAlgorithm,
        length: 256,
      },
      false,
      keyUsage
    );
  };

  const encrypt = async (secretKey: string, data: string): Promise<void> => {
    try {
      const salt = window.crypto.getRandomValues(new Uint8Array(saltLength));
      const iv = window.crypto.getRandomValues(new Uint8Array(ivLength));
      const passwordKey = await getPasswordKey(secretKey);
      const aesKey = await deriveKey(
        passwordKey,
        salt,
        iteration,
        digest,
        encryptionAlgorithm,
        ["encrypt"]
      );
      const encryptedContent = await window.crypto.subtle.encrypt(
        {
          name: encryptionAlgorithm,
          iv,
        },
        aesKey,
        enc.encode(data)
      );
      const encryptedContentArr = new Uint8Array(encryptedContent);
      const buff = new Uint8Array(
        salt.byteLength + iv.byteLength + encryptedContentArr.byteLength
      );
      buff.set(salt, 0);
      buff.set(iv, salt.byteLength);
      buff.set(encryptedContentArr, salt.byteLength + iv.byteLength);
      const base64Buff = base64Encode(buff);
      setEncryptedData(base64Buff);
      saveEncryptedData(base64Buff); // Save encrypted data to IndexedDB
    } catch (error) {
      console.error(`Error - ${error}`);
      setEncryptedData("");
    }
  };

  const decrypt = async (
    secretKey: string,
    ciphertext: string
  ): Promise<void> => {
    try {
      const encryptedDataBuff = base64Decode(ciphertext);
      const salt = encryptedDataBuff.slice(0, saltLength);
      const iv = encryptedDataBuff.slice(saltLength, saltLength + ivLength);
      const data = encryptedDataBuff.slice(saltLength + ivLength);
      const passwordKey = await getPasswordKey(secretKey);
      const aesKey = await deriveKey(
        passwordKey,
        salt,
        iteration,
        digest,
        encryptionAlgorithm,
        ["decrypt"]
      );
      const decryptedContent = await window.crypto.subtle.decrypt(
        {
          name: encryptionAlgorithm,
          iv,
        },
        aesKey,
        data
      );
      const decryptedData = dec.decode(decryptedContent);
      setDecryptedData(decryptedData);
    } catch (error) {
      console.error(`Error - ${error}`);
      setDecryptedData("");
    }
  };

  const saveEncryptedData = async (data: string): Promise<void> => {
    const dbName: string = "encryptedDataDB";
    const storeName: string = "encryptedDataStore";

    const openDatabase = (): Promise<IDBDatabase> => {
      return new Promise((resolve, reject) => {
        const request = window.indexedDB.open(dbName, 1);

        request.onerror = (event) => {
          reject(
            `IndexedDB error: ${(event.target as IDBOpenDBRequest).error}`
          );
        };

        request.onsuccess = (event) => {
          const db: IDBDatabase = (event.target as IDBOpenDBRequest).result;
          resolve(db);
        };

        request.onupgradeneeded = (event) => {
          const db: IDBDatabase = (event.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains(storeName)) {
            db.createObjectStore(storeName, { keyPath: "id" });
          }
        };
      });
    };

    const db: IDBDatabase = await openDatabase();
    const transaction: IDBTransaction = db.transaction(storeName, "readwrite");
    const store: IDBObjectStore = transaction.objectStore(storeName);

    const encryptedData: EncryptedData = {
      id: 1, // Assuming there's only one entry for simplicity
      encryptedData: data,
    };

    store.put(encryptedData);

    await new Promise<void>((resolve) => {
      transaction.oncomplete = () => resolve();
    });
  };

  const getEncryptedData = async (): Promise<string | null> => {
    const dbName: string = "encryptedDataDB";
    const storeName: string = "encryptedDataStore";

    const openDatabase = (): Promise<IDBDatabase> => {
      return new Promise((resolve, reject) => {
        const request = window.indexedDB.open(dbName, 1);

        request.onerror = (event) => {
          reject(
            `IndexedDB error: ${(event.target as IDBOpenDBRequest).error}`
          );
        };

        request.onsuccess = (event) => {
          const db: IDBDatabase = (event.target as IDBOpenDBRequest).result;
          resolve(db);
        };

        request.onupgradeneeded = (event) => {
          const db: IDBDatabase = (event.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains(storeName)) {
            db.createObjectStore(storeName, { keyPath: "id" });
          }
        };
      });
    };

    const db: IDBDatabase = await openDatabase();
    const transaction: IDBTransaction = db.transaction(storeName, "readonly");
    const store: IDBObjectStore = transaction.objectStore(storeName);

    const request: IDBRequest<EncryptedData | null> = store.get(1);

    return new Promise<string | null>((resolve, reject) => {
      request.onerror = (event) => {
        reject(
          `Error getting encrypted data: ${(event.target as IDBRequest).error}`
        );
      };

      request.onsuccess = (event) => {
        const result = (event.target as IDBRequest).result;
        if (result) {
          resolve((result as EncryptedData).encryptedData);
        } else {
          resolve(null); // No data found
        }
      };
    });
  };

  const handleEncrypt = (): void => {
    const data: string = "Sensitive information";
    encrypt("secretKey", data);
  };

  const handleDecrypt = async (): Promise<void> => {
    const encryptedData: string | null = await getEncryptedData();
    if (encryptedData) {
      decrypt("secretKey", encryptedData);
    } else {
      console.log("No encrypted data found in IndexedDB.");
    }
  };

  useEffect(() => {
    handleDecrypt(); // Automatically attempt to decrypt on component mount
  }, []); // Empty dependency array to run only once on mount

  return (
    <div>
      <h1>Web Crypto Test</h1>
      <button onClick={handleEncrypt}>Encrypt Data</button>
      <button onClick={handleDecrypt}>Decrypt Data</button>
      <p>Encrypted Data: {encryptedData}</p>
      <p>Decrypted Data: {decryptedData}</p>
    </div>
  );
};

export default CryptoTest;
