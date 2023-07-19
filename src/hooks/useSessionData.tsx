// customHooks/useSession.ts
import { useEffect, useState } from "react";
import { getSession } from "next-auth/react";
import { Session } from "next-auth";

interface SessionData {
  session: Session | null;
  isSessionLoading: boolean;
}

export function useSessionData(): SessionData {
  const [session, setSession] = useState<Session | null>(null);
  const [isSessionLoading, setIsSessionLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchSession() {
      const session = await getSession();
      setSession(session);
      setIsSessionLoading(false);
    }
    void fetchSession();
  }, []);

  return { session, isSessionLoading };
}
