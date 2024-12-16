/* eslint-disable react/no-unescaped-entities */
import Head from 'next/head';
import Footer from '~/components/Footer';

export default function TermsOfService() {
  return (
    <>
      <Head>
        <title>
          Terms of Service - Migoto's Norwegian Forest Cat - Oslo based cattery
        </title>
      </Head>
      <div className="flex w-full flex-col items-center bg-zinc-100 px-6 py-12 lg:px-24">
        <article className="flex max-w-full flex-col gap-6 rounded-lg bg-white px-6 py-8 shadow-lg">
          <h1 className="text-center text-4xl font-semibold">
            Terms of Service
          </h1>
          <p className="text-gray-600">Last updated: January 3, 2024</p>
          <h2 className="text-2xl font-semibold">Acceptance of Terms</h2>
          <p className="text-gray-700">
            By using our services, you agree to these terms. Please read them
            carefully.
          </p>
          <h2 className="text-2xl font-semibold">Our Services</h2>
          <p className="text-gray-700">
            We provide a platform for users to comment on posts and cats.
          </p>
          <h2 className="text-2xl font-semibold">Your Responsibilities</h2>
          <p className="text-gray-700">
            You are responsible for your use of the service and any content you
            provide, including compliance with applicable laws, rules, and
            regulations.
          </p>
          <h2 className="text-2xl font-semibold">User Accounts</h2>
          <p className="text-gray-700">
            If you create an account on our platform, you are responsible for
            maintaining the security of your account and you are fully
            responsible for all activities that occur under the account.
          </p>

          <h2 className="text-2xl font-semibold">Content Ownership</h2>
          <p className="text-gray-700">
            All content posted by users belongs to the user who posted it.
            However, by posting content, you grant us a license to use, copy,
            reproduce, process, adapt, modify, publish, transmit, display, and
            distribute such content in any and all media or distribution
            methods.
          </p>

          <h2 className="text-2xl font-semibold">Prohibited Activities</h2>
          <p className="text-gray-700">
            Users are prohibited from using our platform to post or transmit any
            material which is or may be infringing on intellectual property
            rights of others, harassing, threatening, false, misleading, or
            otherwise harmful.
          </p>

          <h2 className="text-2xl font-semibold">Termination of Service</h2>
          <p className="text-gray-700">
            We may terminate or suspend your access to our services immediately,
            without prior notice or liability, for any reason whatsoever,
            including without limitation if you breach the Terms.
          </p>

          <h2 className="text-2xl font-semibold">Changes to Terms</h2>
          <p className="text-gray-700">
            We reserve the right, at our sole discretion, to modify or replace
            these Terms at any time. We will try to provide at least 30 days'
            notice prior to any new terms taking effect.
          </p>
        </article>
      </div>
      <Footer />
    </>
  );
}
