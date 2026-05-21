import { createContext, useContext, ReactNode } from "react";
import useUserData from "@/hooks/useUserData";

type Ctx = ReturnType<typeof useUserData>;

const UserDataContext = createContext<Ctx | null>(null);

export function UserDataProvider({ children }: { children: ReactNode }) {
  const data = useUserData();
  return <UserDataContext.Provider value={data}>{children}</UserDataContext.Provider>;
}

export function useUser(): Ctx {
  const ctx = useContext(UserDataContext);
  if (!ctx) throw new Error("useUser must be used within UserDataProvider");
  return ctx;
}
