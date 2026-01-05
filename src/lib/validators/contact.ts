import { z } from 'zod';

export const contactSchema = z.object({
  name: z
    .string()
    .min(3, { message: 'Name needs to be a minimum of 3 characters' })
    .max(50, { message: 'Name is too long' }),
  email: z
    .string()
    .email({ message: 'Invalid email' })
    .min(3, { message: 'Email needs to be a minimum of 3 characters' })
    .max(100, { message: 'Email is too long' }),
  subject: z
    .string()
    .min(3, { message: 'Subject needs to be a minimum of 3 characters' })
    .max(100, { message: 'Subject is too long' }),
  message: z
    .string()
    .min(3, { message: 'Message needs to be longer than 3 characters' })
    .max(1000, { message: 'Message is too long' }),
  turnstileToken: z
    .string()
    .min(1, { message: 'Please verify that you are a human' }),
});
