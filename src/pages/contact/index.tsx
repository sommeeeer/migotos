import Footer from "~/components/Footer";
import TextareaAutosize from "react-textarea-autosize";
import { contactSchema } from "~/lib/validators/contact";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

export default function Contact() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(contactSchema),
  });

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
      <section className="mt-10 flex max-w-4xl flex-col p-4">
        <p className="text-lg text-[#7d7d7d]">YOU CAN DROP A LINE</p>
        <form
          onSubmit={handleSubmit((d) => console.log(d))}
          className="mb-14 flex flex-col gap-4"
        >
          <input
            className="h-14 rounded-sm border-2 border-solid border-gray-200 px-5 py-4 text-base"
            {...register("name")}
            placeholder="Name"
          />
          {errors?.name?.message && (
            <ErrorParagraph message={errors.name.message as string} />
          )}
          <input
            className="h-14 rounded-sm border-2 border-solid border-gray-200 px-5 py-4 text-base"
            {...register("email")}
            placeholder="Email"
          />
          {errors.email?.message && (
            <ErrorParagraph message={errors.email.message as string} />
          )}
          <input
            className="h-14 rounded-sm border-2 border-solid border-gray-200 px-5 py-4 text-base"
            {...register("subject")}
            placeholder="Subject"
          />
          {errors.subject?.message && (
            <ErrorParagraph message={errors.subject.message as string} />
          )}

          <TextareaAutosize
            className="h-14 rounded-sm border-2 border-solid border-gray-200 px-5 py-4 text-base"
            {...register("message")}
            placeholder="Message"
            minRows={4}
          />
          {errors.message?.message && (
            <ErrorParagraph message={errors.message.message as string} />
          )}

          <input
            className="h-14 w-4/6 cursor-pointer rounded-sm border-2 border-solid border-gray-200 px-5 py-4 text-base transition-all duration-300 ease-in-out hover:bg-hoverbg hover:text-white"
            type="submit"
          />
        </form>
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
