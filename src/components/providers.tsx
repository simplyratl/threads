import React from "react";
import { ThemeProvider } from "next-themes";
import { Toaster } from "react-hot-toast";

function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class">
      {children}
      <Toaster />
    </ThemeProvider>
  );
}

export default Providers;
