import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { type AppType } from "next/app";
import { api } from "~/utils/api";
import "~/styles/globals.css";
import Providers from "~/components/providers";
import Navbar from "~/components/shared/navbar";
import { useRouter } from "next/router";
import { useEffect, useRef } from "react";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  const router = useRouter();

  useEffect(() => {
    const handleRouteChange = () => {
      // Check if body overflow is set to "hidden"
      if (document.body.style.overflow === "hidden") {
        // Reset body overflow to "visible"
        document.body.style.overflow = "visible";
      }
    };

    // Listen for route changes and execute the effect
    router.events.on("routeChangeComplete", handleRouteChange);

    // Clean up the event listener
    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, []);

  return (
    <SessionProvider session={session}>
      <Providers>
        <div id="modal">
          <div id="modal-root"></div>
        </div>
        <Navbar />
        <div className="bg-background pb-20 pt-8 md:pb-0">
          <Component {...pageProps} />
        </div>
      </Providers>
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
