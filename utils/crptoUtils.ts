import crypto from "@/customCryptoInstance";

const KEY_ALGORITHM = "AES-GCM";
const KEY_LENGTH = 256;

export async function generateKey(): Promise<CryptoKey> {
  try {
    const key = await crypto.subtle.generateKey(
      { name: KEY_ALGORITHM, length: KEY_LENGTH },
      true,
      ["encrypt", "decrypt"]
    );
    return key;
  } catch (error) {
    console.error("Key generation error:", error);
    throw new Error("Key generation failed");
  }
}

export async function encryptData(data: string, key: string): Promise<{ encryptedData: string, key: CryptoKey }> {
  try {
    const key = await generateKey();
    const encodedData = new TextEncoder().encode(data);
    const encryptedBuffer = await crypto.subtle.encrypt(
      { name: KEY_ALGORITHM, iv: crypto.getRandomValues(new Uint8Array(12)) },
      key,
      encodedData
    );
    const encryptedData = Array.from(new Uint8Array(encryptedBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    return { encryptedData, key };
  } catch (error) {
    console.error("Encryption error:", error);
    throw new Error("Encryption failed");
  }
}

export async function decryptData(encryptedData: string, key: string): Promise<string> {
    try {
      const keyBuffer = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(key),
        { name: "AES-GCM" },
        false,
        ["decrypt"]
      );
      const encryptedBuffer = new Uint8Array(
        encryptedData.match(/[\da-f]{2}/gi)!.map((h) => parseInt(h, 16))
      );
      const decryptedBuffer = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv: new Uint8Array(12) },
        keyBuffer,
        encryptedBuffer
      );
      const decryptedData = new TextDecoder().decode(decryptedBuffer);
      return decryptedData;
    } catch (error) {
      console.error("Decryption error:", error);
      throw new Error("Decryption failed");
    }
  }
  
