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

  const verifySignature = useCallback(async (payload: string) => {
    const formData = new URLSearchParams();
    formData.append("payload", payload); // assuming 'payload' is a base64 string

    const response = await fetch("http://localhost:8080/verify-challenge", {
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
  }, []);

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
          console.log("New state:", newState);
          if (newState === "verified") {
            setVerified(true);
            const inputElement = document.querySelector(
              'input[name="altcha"]'
            ) as HTMLInputElement; // Typecast to HTMLInputElement
            if (inputElement) {
              setPayload(inputElement.value);
              verifySignature(inputElement.value);
              console.log("Payload:", inputElement.value);
              break; // Exit loop once the input is found and logged
            }
          }
        }
      }
    };

    const observer = new MutationObserver(callback);

    if (altchaElement) {
      observer.observe(altchaElement, config);
    }

    // Clean up the observer when the component unmounts
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

  if (!verifiedSignature) {
    return (
      <AltchaContext.Provider value={value}>
        <form ref={formRef}>
          <altcha-widget
            auto="onload"
            challengeurl="http://localhost:8080/get-challenge"
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
