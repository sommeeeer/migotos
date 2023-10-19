import Footer from "~/components/Footer";
import TextareaAutosize from "react-textarea-autosize";
import { contactSchema } from "~/lib/validators/contact";
import { zodResolver } from "@hookform/resolvers/zod";
import { type SubmitHandler, useForm } from "react-hook-form";
import { api } from "~/utils/api";
import type { z } from "zod";
import { useState } from "react";
import clsx from "clsx";
import { BiCheck, BiError } from "react-icons/bi";
import { BsFacebook, BsInstagram } from "react-icons/bs";

type StatusType = "" | "sent" | "error";

export default function Contact() {
  const {
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof contactSchema>>({
    resolver: zodResolver(contactSchema),
  });
  const [status, setStatus] = useState<StatusType>("");
  const { mutate, isLoading } = api.contact.hello.useMutation({
    onSuccess(data) {
      if (data.success) {
        setStatus("sent");
        reset();
      } else {
        setStatus("error");
      }
    },
    onError() {
      setStatus("error");
    },
  });

  const onSubmit: SubmitHandler<z.infer<typeof contactSchema>> = (data) =>
    mutate(data);

  return (
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
      <section className="mt-10 flex w-full max-w-2xl flex-col p-4">
        <p className="text-lg text-[#7d7d7d]">YOU CAN DROP A LINE</p>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mb-14 flex flex-col gap-4"
        >
          <input
            className="h-14 rounded-sm border-2 border-solid border-gray-200 px-5 py-4 text-base"
            {...register("name")}
            placeholder="Name"
          />
          {errors?.name?.message && (
            <ErrorParagraph message={errors.name?.message} />
          )}
          <input
            className="h-14 rounded-sm border-2 border-solid border-gray-200 px-5 py-4 text-base"
            {...register("email")}
            placeholder="Email"
          />
          {errors.email?.message && (
            <ErrorParagraph message={errors.email?.message} />
          )}
          <input
            className="h-14 rounded-sm border-2 border-solid border-gray-200 px-5 py-4 text-base"
            {...register("subject")}
            placeholder="Subject"
          />
          {errors.subject?.message && (
            <ErrorParagraph message={errors.subject?.message} />
          )}

          <TextareaAutosize
            className="h-14 rounded-sm border-2 border-solid border-gray-200 px-5 py-4 text-base"
            {...register("message")}
            placeholder="Message"
            minRows={4}
          />
          {errors.message?.message && (
            <ErrorParagraph message={errors.message?.message} />
          )}

          <button
            className="h-14 w-4/6 cursor-pointer rounded-md border-2 border-solid border-gray-200 px-5 py-4 text-base transition-all duration-300 ease-in-out hover:bg-hoverbg hover:text-white disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-200 disabled:text-gray-600"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <LoadingSpinner />
                Loading...
              </>
            ) : (
              "Send Message"
            )}
          </button>
        </form>
        <ContactInfo />
        <Footer />
      </section>
    </div>
  );
}

function ErrorParagraph({ message }: { message: string }) {
  return (
    <p className="text-sm text-[#bf1650] before:content-['⚠_']">{message}</p>
  );
}

function StatusMessage({ status }: { status: StatusType }) {
  if (status === "") return null;

  const sent = status === "sent";
  const error = status === "error";

  let statusMessage;
  if (sent) {
    statusMessage = "Message sent!\nYou will hear from us soon.";
  }

  if (error) {
    statusMessage = "Error sending message. Please try again.";
  }

  return (
    <div className="mt-4 flex flex-col items-center gap-2">
      {error && <BiError className="h-10 w-10 fill-red-600" />}
      {sent && <BiCheck className="h-10 w-10 fill-green-600" />}
      <p
        className={clsx(
          "text-center text-lg text-green-600",
          sent ? "whitespace-break-spaces text-green-600" : "text-red-600",
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
        <a href={"mailto:eva@migotos.com"}>eva@migotos.com</a>
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="text-xl text-[#7d7d7d]">TELEPHONE NUMBER</h3>
        <a href={"tel:+4797689786"}>+47 97 68 97 86</a>
      </div>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <svg
      aria-hidden="true"
      role="status"
      className="mr-3 inline h-6 w-6 animate-spin text-gray-200 dark:text-gray-600"
      viewBox="0 0 100 101"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
        fill="currentColor"
      />
      <path
        d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
        fill="#1C64F2"
      />
    </svg>
  );
}
