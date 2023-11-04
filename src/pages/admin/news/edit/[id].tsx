import { type BlogPost, Role } from "@prisma/client";
import { useSession } from "next-auth/react";

import Layout from "../../Layout";
import { format } from "date-fns";
import { db } from "~/server/db";
import {
  type GetServerSidePropsContext,
  type GetServerSidePropsResult,
} from "next/types";
import { AiFillEdit } from "react-icons/ai";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";

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
import crypto from "crypto";
import { Bucket } from "sst/node/bucket";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { useState } from "react";
import Image from "next/image";
import { Label } from "~/components/ui/label";
import { toast } from "~/components/ui/use-toast";
import { api } from "~/utils/api";
import { uploadS3 } from "~/utils/helpers";

type EditBlogPostProps = {
  blogpost: BlogPost;
  uploadUrl: string;
};

const formSchema = z.object({
  title: z
    .string()
    .min(5, { message: "Title must be atleast 5 characters long." })
    .max(255, { message: "Title must be less than 255 characters long." }),
  body: z
    .string()
    .min(5, { message: "Body must be atleast 5 characters long." })
    .max(2000, { message: "Body must be less than 2000 characters long." }),
  post_date: z
    .date()
    .max(new Date(), { message: "Date cannot be in the future." }),
});

export default function EditBlogPost({
  blogpost,
  uploadUrl,
}: EditBlogPostProps) {
  const { data: session } = useSession();
  const router = useRouter();

  const [isUploading, setIsUploading] = useState(false);
  const [file, setFile] = useState<File | undefined>(undefined);
  const [imageUrl, setImageUrl] = useState<string | undefined>(
    blogpost.image_url ?? undefined,
  );
  const [imageKey, setImageKey] = useState(0); // Initialize with an initial key

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: blogpost.title,
      body: blogpost.body,
      post_date: blogpost.post_date,
    },
  });

  const { mutate } = api.blogpost.updateBlogPost.useMutation({
    onSuccess: (data) => {
      console.log(data);
      toast({
        variant: "default",
        title: "Success",
        color: "green",
        description: "Blogpost updated successfully.",
      });
      void router.replace(router.asPath);
    },
    onError: () => {
      console.log("Error while trying to give admin to user");
    },
  });

  if (!session || session.user.role !== Role.ADMIN) {
    return <div>Unauthorized.</div>;
  }

  async function handleUpload() {
    if (!file) {
      toast({
        variant: "destructive",
        title: "No image selected.",
        description: "Please select an image before uploading.",
      });
      return;
    }
    try {
      setIsUploading(true);
      const image = await uploadS3(file, uploadUrl);
      setImageUrl(image.url.split("?")[0]);
      toast({
        variant: "default",
        title: "Success",
        color: "green",
        description: "Image uploaded successfully.",
      });
      setImageKey(imageKey + 1);
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Something went wrong during upload",
      });
    } finally {
      setIsUploading(false);
    }
  }

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (!form.formState.isDirty) {
      toast({
        variant: "destructive",
        description: "No changes detected.",
      });
      return;
    }
    const { title, body, post_date } = values;
    if (!title || !body || !post_date) {
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
      post_date: addHours(post_date, 2),
      image_url: imageUrl ?? null,
    });
  }

  return (
    <Layout>
      <div className="flex items-center gap-2">
        <h1 className="text-2xl">Edit Blogpost (ID: {blogpost.id})</h1>
        <AiFillEdit className="mb-4 h-12 w-12" />
      </div>
      <div className="mb-4 rounded-lg bg-white p-8 shadow">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
                    <Textarea rows={10} {...field} />
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
              {imageUrl ? (
                <Image
                  key={imageKey}
                  src={`${imageUrl}?version=${imageKey}}`}
                  width={300}
                  height={300}
                  alt={`${blogpost.title} image`}
                  quality={100}
                />
              ) : (
                <span className="text-lg">NULL</span>
              )}
              <Label>URL to Image</Label>
              <Input value={imageUrl ?? ""} readOnly />
              <Label>Select New Image</Label>
              <Input
                type="file"
                className="cursor-pointer"
                disabled={isUploading}
                onChange={(e) => {
                  if (!e.target.files) return;
                  setFile(e.target.files[0]);
                }}
                accept="image/png, image/jpeg, image/jpg"
              />
              <Button
                disabled={isUploading}
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
                <Button type="submit">Save</Button>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </Layout>
  );
}

export async function getServerSideProps(
  ctx: GetServerSidePropsContext,
): Promise<GetServerSidePropsResult<EditBlogPostProps>> {
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
  const command = new PutObjectCommand({
    ACL: "public-read",
    Key: crypto.randomUUID(),
    Bucket: Bucket.public.bucketName,
  });
  const uploadUrl = await getSignedUrl(new S3Client({}), command);

  return {
    props: {
      blogpost,
      uploadUrl,
    },
  };
}
