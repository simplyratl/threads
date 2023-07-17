import { getServerSession, type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { type AppType } from "next/app";
import { api } from "~/utils/api";
import "~/styles/globals.css";
import Providers from "~/components/providers";
import Navbar from "~/components/shared/navbar";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { authOptions } from "~/server/auth";

import "react-loading-skeleton/dist/skeleton.css";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  const router = useRouter();
  const [isSessionLoading, setIsSessionLoading] = useState(true);

  useEffect(() => {
    const handleRouteChange = () => {
      if (document.body.style.overflow === "hidden") {
        document.body.style.overflow = "visible";
      }
    };

    router.events.on("routeChangeComplete", handleRouteChange);

    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, []);

  useEffect(() => {
    if (session !== null) {
      setIsSessionLoading(false);
    }
  }, [session]);

  return (
    <SessionProvider session={session}>
      <Providers>
        {isSessionLoading ? (
          // Show a loading indicator, you can customize this part as you like
          <div className="flex h-screen items-center"></div>
        ) : (
          <>
            <div id="modal">
              <div id="modal-root"></div>
            </div>
            <Navbar />
            <div className="bg-background pb-20 pt-8 md:pb-0">
              <Component {...pageProps} />
            </div>
          </>
        )}
      </Providers>
    </SessionProvider>
  );
};

export async function getServerSideProps(context: any) {
  const session = await getServerSession(context.req, context.res, authOptions);

  if (!session) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return {
    props: {
      session,
    },
  };
}
export default api.withTRPC(MyApp);
