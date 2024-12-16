/* eslint-disable react/no-unescaped-entities */
import { ExternalLink } from 'lucide-react';
import Head from 'next/head';
import Link from 'next/link';
import Footer from '~/components/Footer';

export default function Privacy() {
  return (
    <>
      <Head>
        <title>
          Privacy Policy - Migoto&#039;s Norwegian Forest Cat &#8211; Oslo based
          cattery
        </title>
      </Head>
      <div className="flex w-full flex-col items-center bg-zinc-100 px-6 py-12 lg:px-24">
        <article className="flex max-w-full flex-col gap-6 rounded-lg bg-white px-6 py-8 shadow-lg">
          <h1 className="text-3xl">Privacy Policy</h1>
          <p className="text-gray-700">Last updated: January 31, 2024</p>
          <p className="text-lg">
            Welcome to Migotos. This Privacy Policy describes how we collect,
            use, and disclose your personal information when you use our website
            and services.
          </p>
          <h2 className="text-xl font-semibold">Information We Collect</h2>
          <p>
            When you comment on posts or cats, we collect the content of your
            comments and the date and time of your comment. If you log in
            through Facebook or Google OAuth, we receive your name and email
            address.
          </p>
          <h2 className="text-xl font-semibold">How We Use Your Information</h2>
          <p>
            We use your information to manage and display comments, and to
            personalize and improve our services. We DO NOT sell your personal
            data to third parties.
          </p>
          <h2 className="text-xl font-semibold">
            How We Share Your Information
          </h2>
          <p>
            We may share your information with third-party service providers
            that provide services on our behalf, such as hosting services and
            data analytics. We may also disclose your information if required by
            law or in response to a legal request.
          </p>
          <p>
            We also keep track of how many visitors we have on our website, and
            that is only a counter of how many times the website has been
            visited. We do not collect any personal information from this.
          </p>
          <h2 className="text-xl font-semibold">Your Rights</h2>
          <p>
            You have the right to access the personal data we hold about you,
            and to ask that your personal data be corrected, updated, or
            deleted. If you would like to exercise this right, please contact us
            through the contact form {` `}
            <Link
              className="inline-flex items-center underline hover:text-hoverbg"
              href="/contact"
            >
              here <ExternalLink className="ml-1 inline-block h-5 w-5" />
            </Link>
          </p>
          <h2 className="text-xl font-semibold">Data Security</h2>
          <p>
            We take reasonable measures to protect your personal information
            from loss, theft, misuse, and unauthorized access, disclosure,
            alteration, and destruction.
          </p>
          <h2 className="text-xl font-semibold">
            Changes to This Privacy Policy
          </h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify
            you of any changes by posting the new Privacy Policy on this page.
          </p>
          <h2 className="text-xl font-semibold">Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact
            us at: <a href={'mailto:eva@migotos.com'}>eva@migotos.com</a>
          </p>
        </article>
      </div>
      <Footer />
    </>
  );
}
