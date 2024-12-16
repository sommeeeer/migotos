import { addHours } from 'date-fns';
import { z } from 'zod';

export const blogPostSchema = z.object({
  title: z
    .string()
    .min(5, { message: 'Title must be atleast 5 characters long.' })
    .max(255, {
      message: 'Title must be less than 255 characters long.',
    }),
  body: z
    .string()
    .min(5, { message: 'Body must be atleast 5 characters long.' })
    .max(2000, {
      message: 'Body must be less than 2000 characters long.',
    }),
  post_date: z.date().max(addHours(new Date(), 4), {
    message: 'Date cannot be in the future.',
  }),
  image_url: z
    .string({ required_error: 'Please upload an image.' })
    .url({ message: 'Image URL must be a valid URL.' }),
  tags: z.array(z.object({ value: z.string(), label: z.string() })),
});
