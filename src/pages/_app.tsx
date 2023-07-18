import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { type AppType } from "next/app";
import { api } from "~/utils/api";
import "~/styles/globals.css";
import Providers from "~/components/providers";
import Navbar from "~/components/shared/navbar";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { getServerAuthSession } from "~/server/auth";

import "react-loading-skeleton/dist/skeleton.css";
import { GetServerSideProps } from "next";
import Head from "next/head";

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
    if (session?.user !== null) {
      setIsSessionLoading(false);
    }
  }, [session]);

  return (
    <>
      <Head>
        <link
          rel="icon"
          type="image/png"
          sizes="192x192"
          href="/favicons/android-chrome-192x192.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="512x512"
          href="/favicons/android-chrome-512x512.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/favicons/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicons/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicons/favicon-16x16.png"
        />
        <link rel="manifest" href="/favicons/site.webmanifest" />
        <link
          rel="mask-icon"
          href="/favicons/safari-pinned-tab.svg"
          color="#5bbad5"
        />
        <link rel="shortcut icon" href="/favicons/favicon.ico" />
        <meta name="msapplication-TileColor" content="#da532c" />
        <meta
          name="msapplication-config"
          content="/favicons/browserconfig.xml"
        />
        <meta name="theme-color" content="#ffffff" />
      </Head>
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
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerAuthSession(ctx);
  return {
    props: { session },
  };
};

export default api.withTRPC(MyApp);
