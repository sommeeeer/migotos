import {
  type GetServerSidePropsContext,
  type GetServerSidePropsResult,
} from 'next/types';
import { useRouter } from 'next/router';
import { type z } from 'zod';
import CreatableSelect from 'react-select/creatable';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { addHours } from 'date-fns';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { useForm } from 'react-hook-form';
import { AiFillEdit } from 'react-icons/ai';
import {
  type BlogPostTag,
  type Prisma,
} from '../../../../../prisma/generated/browser';

import AdminLayout from '~/pages/admin/AdminLayout';
import { db } from '~/server/db';
import { Button } from '~/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form';
import { Input } from '~/components/ui/input';
import { Textarea } from '~/components/ui/textarea';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/components/ui/popover';
import { Calendar } from '~/components/ui/calendar';
import { cn } from '~/lib/utils';
import { toast } from '~/components/ui/use-toast';
import { api } from '~/utils/api';
import { blogPostSchema } from '~/lib/validators/blogpost';
import { checkAdminSession } from '~/server/helpers';
import { ImageUpload } from '~/components/ImageUpload';

type BlogPostWithTags = Prisma.BlogPostGetPayload<{
  include: { tags: true };
}>;

type EditBlogPostProps = {
  blogpost: BlogPostWithTags;
  tags: BlogPostTag[];
};

export default function EditBlogPost({ blogpost, tags }: EditBlogPostProps) {
  const router = useRouter();

  const form = useForm<z.infer<typeof blogPostSchema>>({
    resolver: zodResolver(blogPostSchema),
    defaultValues: {
      title: blogpost.title,
      body: blogpost.body,
      post_date: blogpost.post_date,
      image_url: blogpost.image_url ?? undefined,
      tags: [
        ...blogpost.tags.map((tag) => ({
          label: tags.find((t) => t.id === tag.blogposttag_id)?.value ?? '',
          value: tags.find((t) => t.id === tag.blogposttag_id)?.value ?? '',
        })),
      ],
    },
  });

  const { isDirty } = form.formState;

  const { mutate, isLoading } = api.blogpost.updateBlogPost.useMutation({
    onSuccess: () => {
      toast({
        variant: 'default',
        title: 'Success',
        color: 'green',
        description: 'Blogpost updated successfully.',
      });
      void router.push('/admin/news');
    },
    onError: () => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Something went wrong while updating. Please try again',
      });
    },
  });

  function onSubmit(values: z.infer<typeof blogPostSchema>) {
    if (!isDirty) {
      toast({
        variant: 'destructive',
        description: 'No changes detected.',
      });
      return;
    }
    const { title, body, post_date, image_url, tags } = values;

    mutate({
      id: blogpost.id,
      title,
      body,
      image_url,
      tags,
      post_date: addHours(post_date, 2),
    });
  }

  const imageValue = form.watch('image_url');

  function handleCreate(inputValue: string) {
    form.setValue(
      'tags',
      [...form.getValues('tags'), { label: inputValue, value: inputValue }],
      {
        shouldDirty: true,
      }
    );
  }

  return (
    <AdminLayout>
      <div className="flex items-center gap-2">
        <h1 className="text-2xl">Edit Blogpost (ID: {blogpost.id})</h1>
        <AiFillEdit className="mb-4 h-12 w-12" />
      </div>
      <div className="mb-4 rounded-lg bg-white p-8 shadow">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="max-2-xl space-y-6"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input disabled={isLoading} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="body"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Body</FormLabel>
                  <FormControl>
                    <Textarea disabled={isLoading} rows={10} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="post_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={'outline'}
                          disabled={isLoading}
                          className={cn(
                            'w-[240px] pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value ? (
                            format(field.value, 'PPP')
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date('1900-01-01')
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    <CreatableSelect
                      name="tags"
                      isMulti
                      onBlur={field.onBlur}
                      instanceId="tags"
                      ref={field.ref}
                      isClearable
                      isDisabled={isLoading}
                      isLoading={isLoading}
                      onChange={field.onChange}
                      onCreateOption={handleCreate}
                      options={tags.map((tag) => {
                        return { label: tag.value, value: tag.value };
                      })}
                      value={field.value}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="image_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image</FormLabel>
                  <FormControl>
                    <ImageUpload
                      value={imageValue}
                      onChange={field.onChange}
                      postImage
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="mt-4 flex gap-1">
              <Button
                variant="secondary"
                type="button"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </AdminLayout>
  );
}

export async function getServerSideProps(
  ctx: GetServerSidePropsContext
): Promise<GetServerSidePropsResult<EditBlogPostProps>> {
  const adminSession = await checkAdminSession(ctx);

  if (!adminSession) {
    return {
      notFound: true,
    };
  }

  if (!ctx.query?.id || typeof ctx.query.id !== 'string') {
    return {
      notFound: true,
    };
  }

  const blogpost = await db.blogPost.findFirst({
    where: {
      id: +ctx.query.id,
    },
    include: {
      tags: true,
    },
  });
  if (!blogpost) {
    return {
      notFound: true,
    };
  }

  const tags = await db.blogPostTag.findMany({
    orderBy: {
      value: 'desc',
    },
  });

  return {
    props: {
      blogpost,
      tags,
    },
  };
}
