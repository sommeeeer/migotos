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
          href="https://www.migotos.com/wp-content/uploads/2017/03/cropped-socialicon-1-32x32.png"
          sizes="32x32"
        />
        <link
          rel="icon"
          href="https://www.migotos.com/wp-content/uploads/2017/03/cropped-socialicon-1-192x192.png"
          sizes="192x192"
        />
        <link
          rel="apple-touch-icon"
          href="https://www.migotos.com/wp-content/uploads/2017/03/cropped-socialicon-1-180x180.png"
        />
        <meta
          name="msapplication-TileImage"
          content="https://www.migotos.com/wp-content/uploads/2017/03/cropped-socialicon-1-270x270.png"
        />
      </Head>
      <div
        className={`flex flex-col ${poppins.className} ${playfair.variable}`}
      >
        <Header>
          <NextNProgress />
          <Component {...pageProps} />
        </Header>
      </div>
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
