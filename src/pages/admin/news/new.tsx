import AdminLayout from "../AdminLayout";
import { format } from "date-fns";
import type {
  GetServerSidePropsContext,
  GetServerSidePropsResult,
} from "next/types";
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
import { useState } from "react";
import Image from "next/image";
import { Label } from "~/components/ui/label";
import { toast } from "~/components/ui/use-toast";
import { api } from "~/utils/api";
import { uploadS3 } from "~/utils/helpers";
import { MdOutlinePostAdd } from "react-icons/md";
import { checkAdminSession, getSignedURL } from "~/server/helpers";

type NewBlogPostProps = {
  uploadUrl: string | null;
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
  post_date: z.date(),
});

export default function EditBlogPost({ uploadUrl }: NewBlogPostProps) {
  const router = useRouter();

  const [isUploading, setIsUploading] = useState(false);
  const [file, setFile] = useState<File | undefined>(undefined);
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const [imageKey, setImageKey] = useState(0); // Initialize with an initial key

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      body: "",
      post_date: new Date(),
      title: "",
    },
  });

  const { mutate, isLoading } = api.blogpost.createBlogPost.useMutation({
    onSuccess: () => {
      toast({
        variant: "default",
        title: "Success",
        color: "green",
        description: "Blogpost successfully added.",
      });
      void router.back();
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Something went wrong. Please try again.",
      });
    },
  });

  async function handleUpload() {
    if (!file) {
      toast({
        variant: "destructive",
        title: "No image selected.",
        description: "Please select an image before uploading.",
      });
      return;
    }
    if (!uploadUrl) {
      toast({
        variant: "destructive",
        title: "No upload URL available from Amazon S3.",
        description: "Please try again later.",
      });
      return;
    }
    try {
      setIsUploading(true);
      const imageURL = await uploadS3(file, uploadUrl);
      setImageUrl(imageURL);
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
    const { title, body, post_date } = values;
    if (!title || !body || !post_date || !imageUrl) {
      toast({
        variant: "destructive",
        description: "Please fill out all fields and upload an image.",
      });
      return;
    }
    mutate({
      title,
      body,
      post_date: addHours(post_date, 2),
      image_url: imageUrl ?? null,
    });
  }

  return (
    <AdminLayout>
      <div className="flex items-center gap-2">
        <h1 className="text-2xl">Create New BlogPost</h1>
        <MdOutlinePostAdd className="mb-4 h-12 w-12" />
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
                    <Input {...field} disabled={isLoading} />
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
                          disabled={isLoading}
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
                  alt={`blogpost image`}
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
                <Button
                  type="button"
                  onClick={() => router.back()}
                  disabled={isLoading}
                >
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
): Promise<GetServerSidePropsResult<NewBlogPostProps>> {
  const adminSession = await checkAdminSession(ctx);

  if (!adminSession) {
    return {
      notFound: true,
    };
  }

  const uploadUrl = await getSignedURL();

  return {
    props: {
      uploadUrl,
    },
  };
}
