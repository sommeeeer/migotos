import { addHours } from "date-fns";
import { z } from "zod";

export const catSchema = z.object({
  name: z
    .string()
    .min(5, { message: "Name must be atleast 5 characters long." })
    .max(100, { message: "Name must be less than 100 characters long." }),
  description: z
    .string()
    .min(5, {
      message: "Description must be longer than 5 characthers long.",
    })
    .max(500, {
      message: "Description must be less than 500 characters long.",
    })
    .optional()
    .or(z.literal("")),
  stamnavn: z
    .string()
    .min(5, { message: "Stamnavn must be atleast 5 characters long." })
    .max(100, { message: "Stamnavn must be less than 100 characters long." }),
  birth: z.date().max(addHours(new Date(), 4), {
    message: "Date cannot be in the future.",
  }),
  nickname: z
    .string()
    .min(3, { message: "Nickname must be atleast 3 characters long." })
    .max(50, { message: "Nickname must be less than 50 characters long." }),
  owner: z
    .string()
    .min(5, { message: "Owner must be atleast 5 characters long." })
    .max(100, { message: "Owner must be less than 100 characters long." }),
  gender: z.enum(["Female", "Male"]),
  pedigreeurl: z.preprocess(
    (arg) => (arg === "" ? undefined : arg),
    z.string().url({ message: "Pedigree URL must be a valid URL." }).optional(),
  ),
  mother: z
    .string()
    .min(5, { message: "Mother must be atleast 5 characters long." })
    .max(100, { message: "Mother must be less than 100 characters long." }),
  father: z
    .string()
    .min(5, { message: "Father must be atleast 5 characters long." })
    .max(100, { message: "Father must be less than 100 characters long." }),
  breeder: z
    .string()
    .min(5, { message: "Breeder must be atleast 5 characters long." })
    .max(100, { message: "Breeder must be less than 100 characters long." }),
  fertile: z.optional(z.boolean()),
});
