import { type Session } from "next-auth";
import { getSession, SessionProvider } from "next-auth/react";
import { type AppType } from "next/app";
import { api } from "~/utils/api";
import "~/styles/globals.css";
import Providers from "~/components/providers";
import Navbar from "~/components/shared/navbar";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import "react-loading-skeleton/dist/skeleton.css";
import Head from "next/head";
import { GetServerSideProps } from "next";
import AddUsernameModal from "~/components/modals/add-username-modal";
import { useSessionData } from "~/hooks/useSessionData";
import Loading from "~/components/shared/loading";
import { getServerAuthSession } from "~/server/auth";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps,
}) => {
  const router = useRouter();
  const { session, isSessionLoading } = useSessionData();

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

  if (isSessionLoading) {
    return <div className="flex h-screen items-center">{/*<Loading />*/}</div>;
  }

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
          <>
            <AddUsernameModal />

            <div id="modal">
              <div id="modal-root"></div>
            </div>
            <Navbar />
            <div className="bg-background pb-20 pt-8 md:pb-0">
              <Component {...pageProps} />
            </div>
          </>
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
