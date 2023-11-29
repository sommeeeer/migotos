import AdminLayout from "../AdminLayout";
import { format } from "date-fns";
import type {
  GetServerSidePropsContext,
  GetServerSidePropsResult,
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
import { type z } from "zod";
import { catSchema } from "~/lib/validators/cat";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { toast } from "~/components/ui/use-toast";
import { Checkbox } from "~/components/ui/checkbox";
import { api } from "~/utils/api";
import { uploadS3 } from "~/utils/helpers";
import { Label } from "~/components/ui/label";
import Image from "next/image";
import { useState } from "react";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { Bucket } from "sst/node/bucket";
import { checkAdminSession } from "~/server/helpers";

export default function NewCat({ uploadUrl }: { uploadUrl: string }) {
  const router = useRouter();

  const [isUploading, setIsUploading] = useState(false);
  const [file, setFile] = useState<File | undefined>(undefined);
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const [imageKey, setImageKey] = useState(0);

  const form = useForm<z.infer<typeof catSchema>>({
    resolver: zodResolver(catSchema),
    defaultValues: {
      name: "",
      stamnavn: "",
      breeder: "",
      description: "",
      father: "",
      mother: "",
      gender: "Female",
      owner: "",
      pedigreeurl: "",
      nickname: "",
      birth: new Date(),
      fertile: false,
    },
  });
  const { mutate, isLoading } = api.cat.createCat.useMutation({
    onSuccess: () => {
      toast({
        variant: "default",
        title: "Success",
        color: "green",
        description: "Cat created successfully.",
      });
      void router.push("/admin/cats");
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          "Something went wrong while creating cat. Please try again",
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

  function onSubmit(values: z.infer<typeof catSchema>) {
    if (!imageUrl) {
      toast({
        variant: "destructive",
        title: "No image selected.",
        description: "Please select an image before uploading.",
      });
      return;
    }
    mutate({
      ...values,
      birth: addHours(values.birth, 2),
      imageUrl: imageUrl,
    });
  }

  return (
    <AdminLayout>
      <div className="flex items-center gap-2">
        <h1 className="text-2xl">New Cat</h1>
        <AiFillEdit className="mb-4 h-12 w-12" />
      </div>
      <div className="mb-4 rounded-lg bg-white p-8 shadow">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input disabled={isLoading} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="stamnavn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fargekode</FormLabel>
                  <FormControl>
                    <Input disabled={isLoading} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="birth"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Birth</FormLabel>
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
            <FormField
              control={form.control}
              name="nickname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nickname</FormLabel>
                  <FormControl>
                    <Input disabled={isLoading} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="fertile"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel>Fertile</FormLabel>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem className="">
                  <FormLabel>Gender</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex gap-2 rounded border p-4"
                    >
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="Female" />
                        </FormControl>
                        <FormLabel className="font-normal">Female</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="Male" />
                        </FormControl>
                        <FormLabel className="font-normal">Male</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea disabled={isLoading} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="breeder"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Breeder</FormLabel>
                  <FormControl>
                    <Input disabled={isLoading} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="father"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Father</FormLabel>
                  <FormControl>
                    <Input disabled={isLoading} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="mother"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mother</FormLabel>
                  <FormControl>
                    <Input disabled={isLoading} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="owner"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Owner</FormLabel>
                  <FormControl>
                    <Input disabled={isLoading} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="pedigreeurl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pedigree URL (can be empty)</FormLabel>
                  <FormControl>
                    <Input type="text" disabled={isLoading} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex flex-col items-start gap-4">
              <Label>Current Profile Picture</Label>
              {imageUrl ? (
                <Image
                  key={imageKey}
                  src={`${imageUrl}?version=${imageKey}}`}
                  width={300}
                  height={300}
                  alt={`${
                    form.formState.touchedFields.name ?? "new cat"
                  }'s profile image`}
                  quality={100}
                  priority
                />
              ) : (
                <span className="text-lg">NULL</span>
              )}
              <Label>URL to Image</Label>
              <Input value={imageUrl ?? ""} readOnly disabled={isLoading} />
              <Label>Select Profile Picture</Label>
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
            </div>
            <div className="mt-4 flex gap-1">
              <Button type="button" onClick={() => router.back()}>
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
  ctx: GetServerSidePropsContext,
): Promise<GetServerSidePropsResult<{ uploadUrl: string }>> {
  const adminSession = await checkAdminSession(ctx);

  if (!adminSession) {
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
      uploadUrl,
    },
  };
}
