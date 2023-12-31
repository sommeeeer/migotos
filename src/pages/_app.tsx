import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { type AppType } from "next/app";
import { api } from "~/utils/api";
import "~/styles/globals.css";
import Head from "next/head";
import Header from "~/components/Header";
import NextNProgress from "nextjs-progressbar";

import { Poppins, Playfair_Display } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
  display: "swap",
});
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <Head>
        <link
          rel="icon"
          href="/static/icons/cropped-socialicon-32x32.png"
          sizes="32x32"
        />
        <link
          rel="icon"
          href="/static/icons/cropped-socialicon-192x192.png"
          sizes="192x192"
        />
        <link
          rel="apple-touch-icon"
          href="/static/icons/cropped-socialicon-180x180.png"
        />
        <meta
          name="msapplication-TileImage"
          content="/static/icons/cropped-socialicon-270x270.png"
        />

        <link
          rel="icon"
          href="/static/icons/browser-150x150.png"
          sizes="150x150"
        />
        <link
          rel="icon"
          href="/static/icons/browser-300x300.png"
          sizes="300x300"
        />
        <link
          rel="icon"
          href="/static/icons/browser-480x480.png"
          sizes="480x480"
        />
        <link rel="icon" href="/static/icons/browser.png" />

        <link
          rel="icon"
          href="/static/icons/cropped-socialicon-150x150.png"
          sizes="150x150"
        />
        <link
          rel="icon"
          href="/static/icons/cropped-socialicon-480x480.png"
          sizes="480x480"
        />
        <link
          rel="icon"
          href="/static/icons/cropped-socialicon-512x400.png"
          sizes="512x400"
        />
        <link rel="icon" href="/static/icons/cropped-socialicon.png" />

        <link
          rel="icon"
          href="/static/icons/socialicon-150x150.png"
          sizes="150x150"
        />
        <link
          rel="icon"
          href="/static/icons/socialicon-300x300.png"
          sizes="300x300"
        />
        <link
          rel="icon"
          href="/static/icons/socialicon-480x480.png"
          sizes="480x480"
        />
        <link
          rel="icon"
          href="/static/icons/socialicon-512x400.png"
          sizes="512x400"
        />
        <link rel="icon" href="/static/icons/socialicon.png" />
      </Head>
      <div
        className={`flex flex-col ${poppins.className} ${playfair.variable}`}
      >
        <Header>
          <NextNProgress options={{ showSpinner: false }} />
          <Component {...pageProps} />
        </Header>
      </div>
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
