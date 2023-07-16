import React from "react";
import { ThemeProvider } from "next-themes";
import { Toaster } from "react-hot-toast";

import { createClient } from "@supabase/supabase-js";
import { SessionContextProvider } from "@supabase/auth-helpers-react";

//CHANGE TO ENV VARIABLE!!!! ----------------------------------------
const supabase = createClient(
  "https://wxhaoxtosehvuuitysfj.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4aGFveHRvc2VodnV1aXR5c2ZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODkzNjI1NjcsImV4cCI6MjAwNDkzODU2N30.JCYSu7IgHrm9EZN6cXM2SrmhrIHjMfMO3_D1nKQKPxA"
);

function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class">
      <SessionContextProvider supabaseClient={supabase}>
        {children}
        <Toaster />
      </SessionContextProvider>
    </ThemeProvider>
  );
}

export default Providers;
