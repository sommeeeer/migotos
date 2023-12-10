import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@radix-ui/react-tooltip";
import { useFormContext } from "react-hook-form";
import { type z } from "zod";
import { type litterSchema } from "~/lib/validators/litter";
import Image from "next/image";

export default function ShowCurrentImages() {
  const litterForm = useFormContext<z.infer<typeof litterSchema>>();

  const isAllImages =
    litterForm.getValues("mother_img") &&
    litterForm.getValues("father_img") &&
    litterForm.getValues("post_image")
      ? true
      : false;

  const isError =
    litterForm.formState.errors.mother_img ||
    litterForm.formState.errors.father_img ||
    litterForm.formState.errors.post_image
      ? true
      : false;
  return (
    <div className="flex gap-8">
      {isAllImages ? (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Image
                src={litterForm.getValues("mother_img")}
                width={112}
                height={112}
                className="h-28 w-28 rounded-full object-cover"
                alt={`${litterForm.getValues("name")} mothers's image`}
                quality={100}
                priority
              />
            </TooltipTrigger>
            <TooltipContent>
              <p className="z-20 rounded-md bg-gray-100 p-2">
                {litterForm.getValues("mother_img")}
              </p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Image
                src={litterForm.getValues("father_img")}
                width={112}
                height={112}
                className="h-28 w-28 rounded-full object-cover"
                alt={`${litterForm.getValues("name")} fathers's image`}
                quality={100}
                priority
              />
            </TooltipTrigger>
            <TooltipContent>
              <p className="z-20 rounded-md bg-gray-100 p-2">
                {litterForm.getValues("father_img")}
              </p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Image
                src={litterForm.getValues("post_image") || "default_image_url"}
                width={112}
                height={112}
                className="h-auto w-48 object-cover"
                alt={`${litterForm.getValues("name")} post image`}
                quality={100}
                priority
              />
            </TooltipTrigger>
            <TooltipContent>
              <p className="z-20 rounded-md bg-gray-100 p-2">
                {litterForm.getValues("post_image")}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        <>
          {isError && (
            <p className="text-red-500">
              Please upload all images before saving.
            </p>
          )}
        </>
      )}
    </div>
  );
}
