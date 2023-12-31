import { type BlogPost, type BlogPostTag } from "@prisma/client";
import AdminLayout from "../../AdminLayout";
import { format } from "date-fns";
import { db } from "~/server/db";
import {
  type GetServerSidePropsContext,
  type GetServerSidePropsResult,
} from "next/types";
import { AiFillEdit } from "react-icons/ai";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { useRouter } from "next/router";
import { Textarea } from "~/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Calendar } from "~/components/ui/calendar";
import { CalendarIcon, Loader2 } from "lucide-react";
import { addHours } from "date-fns";
import { cn } from "~/lib/utils";
import Image from "next/image";
import { Label } from "~/components/ui/label";
import { toast } from "~/components/ui/use-toast";
import { api } from "~/utils/api";
import { blogPostSchema } from "~/lib/validators/blogpost";
import { type z } from "zod";
import { checkAdminSession, getSignedURL } from "~/server/helpers";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { useImageUpload } from "~/hooks/use-image-upload";
import { useEffect } from "react";

type EditBlogPostProps = {
  blogpost: BlogPost;
  uploadUrl: string;
  tags: BlogPostTag[];
};

export default function EditBlogPost({
  blogpost,
  uploadUrl,
}: EditBlogPostProps) {
  const router = useRouter();

  const form = useForm<z.infer<typeof blogPostSchema>>({
    resolver: zodResolver(blogPostSchema),
    defaultValues: {
      title: blogpost.title,
      body: blogpost.body,
      post_date: blogpost.post_date,
      image_url: blogpost.image_url!,
    },
  });

  const { isDirty } = form.formState;

  const { handleUpload, isUploading, setFile, imageURL, imageKey } =
    useImageUpload(uploadUrl);

  const { mutate, isLoading } = api.blogpost.updateBlogPost.useMutation({
    onSuccess: (data) => {
      form.reset({
        title: data.title,
        body: data.body,
        post_date: data.post_date,
        image_url: data.image_url!,
      });
      toast({
        variant: "default",
        title: "Success",
        color: "green",
        description: "Blogpost updated successfully.",
      });
      void router.push("/admin/news");
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Something went wrong while updating. Please try again",
      });
    },
  });

  function onSubmit(values: z.infer<typeof blogPostSchema>) {
    if (!isDirty) {
      toast({
        variant: "destructive",
        description: "No changes detected.",
      });
      return;
    }
    const { title, body, post_date, image_url } = values;
    if (!title || !body || !post_date || !image_url) {
      toast({
        variant: "destructive",
        description: "Please fill out all fields.",
      });
      return;
    }

    mutate({
      id: blogpost.id,
      title,
      body,
      image_url,
      post_date: addHours(post_date, 2),
    });
  }

  useEffect(() => {
    if (!imageURL) return;
    form.setValue("image_url", imageURL, { shouldDirty: true });
  }, [imageURL, form]);

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
                          variant={"outline"}
                          disabled={isLoading}
                          className={cn(
                            "w-[240px] pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground",
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
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
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex flex-col items-start gap-4">
              <Label>Current Image</Label>
              {form.getValues("image_url") ? (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Image
                        src={`${form.getValues(
                          "image_url",
                        )}?version=${imageKey}`}
                        width={300}
                        height={300}
                        alt={`${blogpost.title} image`}
                        quality={100}
                        priority
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{form.getValues("image_url")}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                <>
                  {form.formState.errors.image_url && (
                    <p className="text-red-500">
                      {form.formState.errors.image_url.message}
                    </p>
                  )}
                  {!form.formState.errors.image_url?.message && (
                    <span className="text-gray-600">
                      No image uploaded yet.
                    </span>
                  )}
                </>
              )}
              <Label>Select New Image</Label>
              <Input
                type="file"
                className="cursor-pointer"
                disabled={isUploading || isLoading}
                onChange={(e) => {
                  if (!e.target.files) return;
                  setFile(e.target.files[0]);
                }}
                accept="image/png, image/jpeg, image/jpg"
              />
              <Button
                disabled={isUploading || isLoading}
                type="button"
                variant="secondary"
                onClick={handleUpload}
              >
                {isUploading && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Upload
              </Button>
              <div className="mt-4 flex gap-1">
                <Button type="button" onClick={() => router.back()}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Save
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </AdminLayout>
  );
}

export async function getServerSideProps(
  ctx: GetServerSidePropsContext,
): Promise<GetServerSidePropsResult<EditBlogPostProps>> {
  const adminSession = await checkAdminSession(ctx);

  if (!adminSession) {
    return {
      notFound: true,
    };
  }

  if (!ctx.query?.id || typeof ctx.query.id !== "string") {
    return {
      notFound: true,
    };
  }

  const blogpost = await db.blogPost.findFirst({
    where: {
      id: +ctx.query.id,
    },
  });
  if (!blogpost) {
    return {
      notFound: true,
    };
  }

  const tags = await db.blogPostTag.findMany({
    orderBy: {
      value: "desc",
    },
  });
  const uploadUrl = await getSignedURL();

  return {
    props: {
      blogpost,
      uploadUrl,
      tags,
    },
  };
}
