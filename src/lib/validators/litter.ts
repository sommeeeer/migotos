import { addHours } from "date-fns";
import { z } from "zod";

export const litterSchema = z.object({
  name: z
    .string()
    .min(5, { message: "Name must be atleast 5 characters long." })
    .max(100, { message: "Name must be less than 100 characters long." }),
  pedigreeurl: z.preprocess(
    (arg) => (arg === "" ? undefined : arg),
    z.string().url({ message: "Pedigree URL must be a valid URL." }).optional(),
  ),
  mother_name: z
    .string()
    .min(5, { message: "Mother must be atleast 5 characters long." })
    .max(100, { message: "Mother must be less than 100 characters long." }),
  father_name: z
    .string()
    .min(5, { message: "Father must be atleast 5 characters long." })
    .max(100, { message: "Father must be less than 100 characters long." }),
  mother_stamnavn: z
    .string()
    .min(5, { message: "Stamnavn must be atleast 5 characters long." })
    .max(100, { message: "Stamnavn must be less than 100 characters long." }),
  father_stamnavn: z
    .string()
    .min(5, { message: "Stamnavn must be atleast 5 characters long." })
    .max(100, { message: "Stamnavn must be less than 100 characters long." }),
  description: z
    .string()
    .min(5, {
      message: "Description must be longer than 5 characthers long.",
    })
    .max(2000, {
      message: "Description must be less than 2000 characters long.",
    })
    .optional()
    .or(z.literal("")),
  born: z.date().max(addHours(new Date(), 4), {
    message: "Date cannot be in the future.",
  }),
  mother_img: z
    .string({ required_error: "Please upload an image." })
    .url({ message: "Image URL must be a valid URL." }),
  father_img: z
    .string({ required_error: "Please upload an image." })
    .url({ message: "Image URL must be a valid URL." }),
  post_image: z
    .string({ required_error: "Please upload an image." })
    .url({ message: "Image URL must be a valid URL." }),
});
