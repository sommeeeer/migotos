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
import { Label } from "./ui/label";

export default function ShowCurrentImages() {
  const litterForm = useFormContext<z.infer<typeof litterSchema>>();

  const name = litterForm.getValues("name");
  const mother_img = litterForm.getValues("mother_img");
  const father_img = litterForm.getValues("father_img");
  const post_image = litterForm.getValues("post_image");

  const isAllImages = mother_img && father_img ? true : false;

  const isError =
    litterForm.formState.errors.mother_img ||
    litterForm.formState.errors.father_img ||
    litterForm.formState.errors.post_image
      ? true
      : false;
  return (
    <div className="flex gap-8">
      {isAllImages ? (
        <>
          <div className="flex flex-col items-center gap-4">
            <Label className="text-sm font-normal">Mother</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Image
                    src={mother_img}
                    width={112}
                    height={112}
                    className="h-28 w-28 rounded-full object-cover"
                    alt={`${name} mothers's image`}
                    quality={100}
                    priority
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="z-20 rounded-md bg-gray-100 p-2">
                    {mother_img}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="flex flex-col items-center gap-4">
            <Label className="text-sm font-normal">Father</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Image
                    src={father_img}
                    width={112}
                    height={112}
                    className="h-28 w-28 rounded-full object-cover"
                    alt={`${name} fathers's image`}
                    quality={100}
                    priority
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="z-20 rounded-md bg-gray-100 p-2">
                    {father_img}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          {post_image && (
            <div className="flex flex-col items-center gap-4">
              <Label className="text-sm font-normal">Post Image</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Image
                      src={post_image}
                      width={112}
                      height={112}
                      className="h-auto w-48 object-cover"
                      alt={`${name} post image`}
                      quality={100}
                      priority
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="z-20 rounded-md bg-gray-100 p-2">
                      {post_image}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
          {!post_image && (
            <Label className="text-sm font-normal">No post image</Label>
          )}
        </>
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
