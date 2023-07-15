import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { type AppType } from "next/app";
import { api } from "~/utils/api";
import "~/styles/globals.css";
import Providers from "~/components/providers";
import Navbar from "~/components/shared/navbar";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <Providers>
        <Navbar />
        <div className="bg-background pt-8">
          <Component {...pageProps} />
        </div>
      </Providers>
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
