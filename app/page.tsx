"use client";
import Image from "next/image";

import { useEffect, useState } from "react";
import { AltchaContextProvider } from "@/context/altcha/provider";
export default function Home() {
  return (
    <AltchaContextProvider>hello you are now verified</AltchaContextProvider>
  );
}
