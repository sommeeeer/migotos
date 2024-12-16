import { z } from 'zod';

export const commentSchema = z.object({
  message: z
    .string()
    .min(5, { message: 'Message needs to be longer than 5 characters' })
    .max(500, { message: 'Message is too long' }),
});
