"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { AltchaContext } from "./contex";
import "altcha";
export const AltchaContextProvider = ({
  children,
}: {
  children?: React.ReactNode;
}) => {
  const [verified, setVerified] = useState(false);
  const [verifiedSignature, setVerifiedSignature] = useState(false);
  const [id, setID] = useState("");
  const [payload, setPayload] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  const challengeURL = process.env.NEXT_PUBLIC_CHALLENGE_URL;
  const verifySignature = useCallback(
    async (payload: string) => {
      const formData = new URLSearchParams();
      formData.append("payload", payload); // assuming 'payload' is a base64 string
      const url = `${challengeURL}/verify-challenge`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData,
      });

      const data = await response.json();
      if (data.verified) {
        setVerifiedSignature(true);
      }
    },
    [challengeURL]
  );

  useEffect(() => {
    const altchaElement = document.querySelector(".altcha");
    const config = { attributes: true };

    const callback = (mutationsList: any) => {
      for (let mutation of mutationsList) {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "data-state"
        ) {
          const newState = mutation.target.getAttribute("data-state");
          if (newState === "verified") {
            setVerified(true);
            const inputElement = document.querySelector(
              'input[name="altcha"]'
            ) as HTMLInputElement;
            if (inputElement) {
              setPayload(inputElement.value);
              verifySignature(inputElement.value);
              break;
            }
          }
        }
      }
    };

    const observer = new MutationObserver(callback);

    if (altchaElement) {
      observer.observe(altchaElement, config);
    }

    return () => {
      if (altchaElement) {
        observer.disconnect();
      }
    };
  }, [verifySignature]);

  const value = {
    verified: verifiedSignature,
    id: payload,
  };

  // we can later pass these things to the consumer
  // fo rnow since its a proof of concept we will just use the context
  if (!verifiedSignature) {
    return (
      <AltchaContext.Provider value={value}>
        <form ref={formRef}>
          <altcha-widget
            auto="onload"
            // challengeurl="http://localhost:8080/get-challenge"
            challengeurl={`${challengeURL}/get-challenge`}
          ></altcha-widget>
          <button disabled={!verified} type="submit">
            Submit
          </button>
        </form>
      </AltchaContext.Provider>
    );
  }

  return (
    <AltchaContext.Provider value={value}>{children}</AltchaContext.Provider>
  );
};
