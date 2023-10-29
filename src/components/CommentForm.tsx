import { zodResolver } from "@hookform/resolvers/zod";
import { type SubmitHandler, useForm } from "react-hook-form";
import TextareaAutosize from "react-textarea-autosize";
import type { z } from "zod";
import { commentSchema } from "~/lib/validators/comment";
import ErrorParagraph from "./ui/ErrorParagraph";

interface CommentFormProps {
  submitHandler?: (e: React.FormEvent<HTMLFormElement>) => void;
}

export default function CommentForm({ submitHandler }: CommentFormProps) {
  const {
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof commentSchema>>({
    resolver: zodResolver(commentSchema),
  });

  const onSubmit: SubmitHandler<z.infer<typeof commentSchema>> = (data) =>
    console.log(data);
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-2">
      <h3 className="text-base">LEAVE A REPLY</h3>

      <input
        className="h-8 rounded-sm border-2 border-solid border-gray-200 px-4 py-5 text-base"
        {...register("name")}
        placeholder="Name"
      />
      {errors?.name?.message && (
        <ErrorParagraph message={errors.name?.message} />
      )}

      <TextareaAutosize
        className="h-14 rounded-sm border-2 border-solid border-gray-200 px-4 py-4 text-base"
        {...register("message")}
        placeholder="Message"
        minRows={4}
      />
      {errors.message?.message && (
        <ErrorParagraph message={errors.message?.message} />
      )}
      <button
        className="h-14 w-4/6 cursor-pointer rounded-md border-2 border-solid border-gray-200 p-4 text-base transition-all duration-300 ease-in-out hover:bg-hoverbg hover:text-white disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-200 disabled:text-gray-600"
        type="submit"
      >
        Post Comment
      </button>
    </form>
  );
}
