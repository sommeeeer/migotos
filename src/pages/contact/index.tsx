/* eslint-disable @typescript-eslint/no-explicit-any */
import TextareaAutosize from 'react-textarea-autosize';
import Footer from '~/components/Footer';
import { contactSchema } from '~/lib/validators/contact';
import { zodResolver } from '@hookform/resolvers/zod';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { api } from '~/utils/api';
import type { z } from 'zod';
import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { BiCheck, BiError } from 'react-icons/bi';
import { BsFacebook, BsInstagram } from 'react-icons/bs';
import LoadingSpinner from '~/components/ui/LoadingSpinner';
import ErrorParagraph from '~/components/ui/ErrorParagraph';
import Head from 'next/head';
import Script from 'next/script';

type StatusType = '' | 'sent' | 'error';

export default function Contact() {
  const {
    register,
    reset,
    handleSubmit,
    trigger,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<z.infer<typeof contactSchema>>({
    resolver: zodResolver(contactSchema),
  });
  const [status, setStatus] = useState<StatusType>('');
  const { mutate, isLoading } = api.contact.hello.useMutation({
    onSuccess(data) {
      if (data.success) {
        window.scrollTo(0, 0);
        setStatus('sent');
        reset();
      } else {
        setStatus('error');
      }
    },
    onError() {
      setStatus('error');
      setValue('turnstileToken', '', { shouldValidate: true });
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      (window as any).turnstile.reset();
    },
  });

  useEffect(() => {
    if (status !== '') {
      const timeout = setTimeout(() => {
        setStatus('');
      }, 7500);
      return () => clearTimeout(timeout);
    }
  }, [status]);

  useEffect(() => {
    // Expose callbacks for the Turnstile widget
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    (window as any).onTurnstileSuccess = (token: string) => {
      setValue('turnstileToken', token, { shouldValidate: true });
      clearErrors('turnstileToken');
    };
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    (window as any).onTurnstileExpired = () => {
      setValue('turnstileToken', '', { shouldValidate: true });
      setError('turnstileToken', {
        type: 'manual',
        message: 'Verification expired. Please retry.',
      });
    };
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    (window as any).onTurnstileError = () => {
      setValue('turnstileToken', '', { shouldValidate: true });
      setError('turnstileToken', {
        type: 'manual',
        message: 'Verification failed. Please try again.',
      });
    };
  }, [clearErrors, setError, setValue, trigger]);

  const onSubmit: SubmitHandler<z.infer<typeof contactSchema>> = (data) => {
    mutate(data);
  };

  return (
    <>
      <PageHead />

      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        async
        defer
      />
      <div className="flex w-full flex-col items-center">
        <section className="flex h-52 w-full flex-col items-center justify-center gap-4 bg-[#F7F7F7] text-center">
          <div className="flex flex-col gap-2">
            <h1 className="font-playfair text-4xl italic">Contact</h1>
            <h3 className="text-sm uppercase tracking-wider">
              Feel free to contact us
            </h3>
          </div>
        </section>
        {status && <StatusMessage status={status} />}
        <section className="mt-10 flex w-full max-w-4xl flex-col p-4 md:basis-[400px] md:flex-row md:justify-between">
          <div className="md:w-[400px]">
            <p className="text-lg text-[#7d7d7d]">YOU CAN DROP A LINE</p>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="mb-14 flex flex-col gap-4"
            >
              <input
                className="h-14 rounded-sm border-2 border-solid border-gray-200 px-4 py-4 text-base"
                {...register('name')}
                autoComplete="name"
                placeholder="Name"
              />
              {errors?.name?.message && (
                <ErrorParagraph message={errors.name?.message} />
              )}
              <input
                className="h-14 rounded-sm border-2 border-solid border-gray-200 px-4 py-4 text-base"
                {...register('email')}
                placeholder="Email"
                autoComplete="email"
              />
              {errors.email?.message && (
                <ErrorParagraph message={errors.email?.message} />
              )}
              <input
                className="h-14 rounded-sm border-2 border-solid border-gray-200 px-4 py-4 text-base"
                {...register('subject')}
                placeholder="Subject"
              />
              {errors.subject?.message && (
                <ErrorParagraph message={errors.subject?.message} />
              )}

              <TextareaAutosize
                className="h-14 rounded-sm border-2 border-solid border-gray-200 px-4 py-4 text-base"
                {...register('message')}
                placeholder="Message"
                minRows={4}
              />
              {errors.message?.message && (
                <ErrorParagraph message={errors.message?.message} />
              )}

              <input type="hidden" {...register('turnstileToken')} />

              <div
                className="cf-turnstile"
                data-sitekey={
                  process.env.NODE_ENV === 'development'
                    ? '3x00000000000000000000FF'
                    : process.env.NEXT_PUBLIC_TURNSTILE_KEY
                }
                data-callback="onTurnstileSuccess"
                data-expired-callback="onTurnstileExpired"
                data-error-callback="onTurnstileError"
              ></div>

              {errors.turnstileToken?.message && (
                <ErrorParagraph message={errors.turnstileToken?.message} />
              )}
              <button
                className="h-14 w-4/6 cursor-pointer rounded-md border-2 border-solid border-gray-200 px-5 py-4 text-base transition-all duration-300 ease-in-out hover:bg-hoverbg hover:text-white disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-200 disabled:text-gray-600"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner className="mr-3" />
                    Loading...
                  </>
                ) : (
                  'Send Message'
                )}
              </button>
            </form>
            <ContactInfo />
          </div>
        </section>
        <Footer />
      </div>
    </>
  );
}

function StatusMessage({ status }: { status: StatusType }) {
  if (status === '') return null;

  const sent = status === 'sent';
  const error = status === 'error';

  let statusMessage;
  if (sent) {
    statusMessage = 'Message sent!\nYou will hear from us soon.';
  }

  if (error) {
    statusMessage = 'Error sending message. Please try again.';
  }

  return (
    <div className="mt-4 flex flex-col items-center gap-2">
      {error && <BiError className="h-10 w-10 fill-red-600" />}
      {sent && <BiCheck className="h-10 w-10 fill-green-600" />}
      <p
        className={clsx(
          'text-center text-lg text-green-600',
          sent ? 'whitespace-break-spaces text-green-600' : 'text-red-600'
        )}
      >
        {statusMessage}
      </p>
    </div>
  );
}

function ContactInfo() {
  return (
    <div className="my-12 flex flex-col gap-12">
      <div className="flex flex-col gap-4">
        <h3 className="text-xl text-[#7d7d7d]">FOLLOW US ON</h3>
        <div className="flex gap-4">
          <a
            href="https://www.facebook.com/eva.d.eide"
            rel="noopener noreferrer"
            target="_blank"
          >
            <BsFacebook className="h-10 w-10 text-zinc-700 hover:relative hover:bottom-[2px] hover:text-zinc-400" />
          </a>
          <a
            href="https://www.instagram.com/migotos/"
            rel="noopener noreferrer"
            target="_blank"
          >
            <BsInstagram className="h-10 w-10 text-zinc-700 hover:relative hover:bottom-[2px] hover:text-zinc-400" />
          </a>
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="text-xl text-[#7d7d7d]">EMAIL</h3>
        <a className="hover:text-zinc-400" href={'mailto:eva@migotos.com'}>
          eva@migotos.com
        </a>
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="text-xl text-[#7d7d7d]">TELEPHONE NUMBER</h3>
        <a className="hover:text-zinc-400" href={'tel:+4797689786'}>
          +47 97 68 97 86
        </a>
      </div>
    </div>
  );
}

function PageHead() {
  return (
    <Head>
      <title>Contact - Migotos</title>
      <link rel="canonical" href="https://migotos.com/contact" />
      <meta name="description" content="Contact page for Migotos" />
      <meta property="og:site_name" content="Contact - Migoto" />
      <meta property="og:title" content="Contact - Migotos" />
      <meta property="og:description" content="Contact page for Migotos" />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://migotos.com/contact" />
      <meta
        property="og:image"
        content="https://migotos.com/static/icons/cropped-socialicon-480x480.png"
      />
      <meta property="og:image:alt" content="Migotos logo" />
      <meta property="og:image:type" content="image/png" />
      <meta property="og:image:width" content="480" />
      <meta property="og:image:height" content="480" />
      <meta
        property="article:published_time"
        content="2024-01-16T12:18:00+01:00"
      />
      <meta
        property="article:modified_time"
        content="2024-01-16T12:18:00+01:00"
      />
      <meta
        property="article:author"
        content="https://www.facebook.com/eva.d.eide"
      />
    </Head>
  );
}
