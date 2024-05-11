"use client";

import { AltchaContextProvider } from "@/context/altcha/provider";
import { TokenContextConsumer } from "@/context/auth/consumer";
import { TokenContextProvider } from "@/context/auth/provider";
import { useFingerPrint } from "@/hooks/use-fingerprint";

export default function Home() {
  const fingerPrint = useFingerPrint();
  return (
    <AltchaContextProvider>
      <TokenContextProvider>
        <TokenContextConsumer>
          hello you are now verified
          <p>Your fingerprint is: {fingerPrint}</p>
        </TokenContextConsumer>
      </TokenContextProvider>
    </AltchaContextProvider>
  );
}
