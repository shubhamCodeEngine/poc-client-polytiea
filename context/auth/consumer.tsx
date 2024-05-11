"use client";
import { useToken } from "./context";

export const TokenContextConsumer = ({
  children,
}: {
  children?: React.ReactNode;
}) => {
  const { loading } = useToken();
  return <>{loading ? "loading" : children}</>;
};
