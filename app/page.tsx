"use client";

import { AltchaContextProvider } from "@/context/altcha/provider";
import { TokenContextConsumer } from "@/context/auth/consumer";
import { TokenContextProvider } from "@/context/auth/provider";

export default function Home() {
  return (
    <AltchaContextProvider>
      <TokenContextProvider>
        <TokenContextConsumer>hello you are now verified</TokenContextConsumer>
      </TokenContextProvider>
    </AltchaContextProvider>
  );
}
