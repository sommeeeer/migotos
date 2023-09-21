import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { type AppType } from "next/app";

import { api } from "~/utils/api";

import "~/styles/globals.css";
import Head from "next/head";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <Head>
        <link
          rel="icon"
          href="static/icons/cropped-socialicon-1-32x32.png"
          sizes="32x32"
        />
        <link
          rel="icon"
          href="static/icons/cropped-socialicon-1-192x192.png"
          sizes="192x192"
        />
        <link
          rel="apple-touch-icon"
          href="static/icons/cropped-socialicon-1-180x180.png"
        />
        <meta
          name="msapplication-TileImage"
          content="static/icons/cropped-socialicon-1-270x270.png"
        />
      </Head>
      <Component {...pageProps} />
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
