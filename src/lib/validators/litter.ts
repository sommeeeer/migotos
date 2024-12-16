import { addHours } from 'date-fns';
import { z } from 'zod';

export const kittenSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'Name must be atleast 2 characters long.' })
    .max(50, { message: 'Name must be less than 50 characters long.' }),
  stamnavn: z
    .string()
    .min(2, { message: 'Fargekode must be atleast 2 characters long' })
    .max(100, { message: 'Fargekode must be less than 100 characters long' }),
  gender: z.union([z.literal('female'), z.literal('man')]),
  info: z
    .string()
    .min(2, { message: 'Info must be atleast 2 characters long' })
    .max(255, { message: 'Info must be less than 255 characters long' })
    .optional()
    .or(z.literal('')),
  orderStatus: z
    .union([
      z.literal('AVAILABLE'),
      z.literal('BOOKED'),
      z.literal('HIDDEN'),
      z.literal('SOLD'),
    ])
    .optional(),
});

export const litterSchema = z.object({
  name: z
    .string()
    .min(1, { message: 'Name must be atleast 1 characters long.' })
    .max(50, { message: 'Name must be less than 50 characters long.' }),
  pedigreeurl: z.preprocess(
    (arg) => (arg === '' ? undefined : arg),
    z.string().url({ message: 'Pedigree URL must be a valid URL.' }).optional()
  ),
  mother_name: z
    .string()
    .min(2, { message: 'Mother must be atleast 2 characters long.' })
    .max(100, { message: 'Mother must be less than 100 characters long.' }),
  father_name: z
    .string()
    .min(2, { message: 'Father must be atleast 2 characters long.' })
    .max(100, { message: 'Father must be less than 100 characters long.' }),
  mother_stamnavn: z
    .string()
    .min(2, { message: 'Must be atleast 2 characters long.' })
    .max(100, { message: 'Must be less than 100 characters long.' }),
  father_stamnavn: z
    .string()
    .min(2, { message: 'Must be atleast 2 characters long.' })
    .max(100, { message: 'Must be less than 100 characters long.' }),
  description: z
    .string()
    .min(5, {
      message: 'Description must be longer than 5 characthers long.',
    })
    .max(2000, {
      message: 'Description must be less than 2000 characters long.',
    })
    .optional()
    .or(z.literal('')),
  born: z.date().max(addHours(new Date(), 4), {
    message: 'Date cannot be in the future.',
  }),
  mother_img: z
    .string({ required_error: 'Please upload a mother image.' })
    .url({ message: 'Image URL must be a valid URL.' }),
  father_img: z
    .string({ required_error: 'Please upload a father image.' })
    .url({ message: 'Image URL must be a valid URL.' }),
  post_image: z
    .string({ required_error: 'Please upload a post image.' })
    .url({ message: 'Image URL must be a valid URL.' }),
  kittens: z
    .array(kittenSchema)
    .min(1, { message: 'Must have atleast 1 kitten.' }),
  tags: z.array(z.object({ value: z.string(), label: z.string() })),
});

export const editLitterSchema = litterSchema.extend({
  post_image: z
    .string({ required_error: 'Please upload a post image.' })
    .url({ message: 'Image URL must be a valid URL.' })
    .optional()
    .or(z.literal('')),
});
