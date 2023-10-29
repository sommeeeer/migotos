import { z } from "zod";

export const commentSchema = z.object({
  name: z
    .string()
    .min(3, { message: "Name needs to be a minimum of 3 characters" })
    .max(50, { message: "Name is too long" }),
  message: z
    .string()
    .min(3, { message: "Message needs to be longer than 3 characters" })
    .max(1000, { message: "Message is too long" }),
});
