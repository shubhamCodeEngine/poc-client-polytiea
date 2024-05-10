"use client";

import { AltchaContextProvider } from "@/context/altcha/provider";

export default function Home() {
  return (
    <AltchaContextProvider>hello you are now verified</AltchaContextProvider>
  );
}
