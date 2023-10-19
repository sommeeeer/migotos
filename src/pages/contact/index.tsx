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
      <section className="mt-10 flex max-w-4xl flex-col p-4">
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

          <input
            className="h-14 w-4/6 cursor-pointer rounded-sm border-2 border-solid border-gray-200 px-5 py-4 text-base transition-all duration-300 ease-in-out hover:bg-hoverbg hover:text-white"
            type="submit"
            disabled={isLoading}
          />
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
