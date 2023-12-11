import AdminLayout from "../AdminLayout";
import { format } from "date-fns";
import type {
  GetServerSidePropsContext,
  GetServerSidePropsResult,
} from "next/types";
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
import { Label } from "~/components/ui/label";
import Image from "next/image";
import { useEffect } from "react";
import { checkAdminSession, getSignedURL } from "~/server/helpers";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { useImageUpload } from "~/hooks/use-image-upload";
import { FaCat } from "react-icons/fa";
import CreateableSelect from "react-select/creatable";

import { db } from "~/server/db";

interface NewCatProps {
  uploadUrl: string;
  motherNames: { name: string }[];
  fatherNames: { name: string }[];
}

export default function NewCat({
  uploadUrl,
  motherNames,
  fatherNames,
}: NewCatProps) {
  const router = useRouter();
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
      image_url: undefined,
    },
  });
  const { handleUpload, isUploading, setFile, imageURL, imageKey } =
    useImageUpload(uploadUrl);
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
    onError: (error) => {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description:
          "Something went wrong while creating cat. Please try again",
      });
    },
  });

  function onSubmit(values: z.infer<typeof catSchema>) {
    mutate({
      ...values,
      birth: addHours(values.birth, 2),
    });
  }

  useEffect(() => {
    if (!imageURL) return;
    form.setValue("image_url", imageURL, { shouldDirty: true });
  }, [imageURL, form]);

  return (
    <AdminLayout>
      <div className="flex items-center gap-2">
        <h1 className="text-2xl">New Cat</h1>
        <FaCat className="mb-4 h-8 w-8" />
      </div>
      <div className="mb-4 rounded-lg bg-white p-8 shadow">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="max-w-2xl space-y-6"
          >
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
              render={({ field: { onChange, onBlur, name, ref } }) => (
                <FormItem>
                  <FormLabel>Father</FormLabel>
                  <FormControl>
                    <CreateableSelect
                      isLoading={isLoading}
                      onChange={(e) => onChange(e?.value)}
                      onBlur={onBlur}
                      name={name}
                      ref={ref}
                      isClearable
                      options={fatherNames.map((name) => ({
                        value: name.name,
                        label: name.name,
                      }))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="mother"
              render={({ field: { onChange, onBlur, name, ref } }) => (
                <FormItem>
                  <FormLabel>Mother</FormLabel>
                  <FormControl>
                    <CreateableSelect
                      isLoading={isLoading}
                      onChange={(e) => onChange(e?.value)}
                      onBlur={onBlur}
                      name={name}
                      ref={ref}
                      isClearable
                      options={motherNames.map((name) => ({
                        value: name.name,
                        label: name.name,
                      }))}
                    />
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
              <Label>Current Profile Image</Label>
              {form.getValues("image_url") ? (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Image
                        src={`${form.getValues(
                          "image_url",
                        )}?version=${imageKey}}`}
                        width={300}
                        height={300}
                        alt={`${form.getValues("name")}'s image`}
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
              <Label>Select New Profile Image (300x300)</Label>
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
): Promise<GetServerSidePropsResult<NewCatProps>> {
  const adminSession = await checkAdminSession(ctx);

  if (!adminSession) {
    return {
      notFound: true,
    };
  }

  const motherNames = await db.cat.findMany({
    select: {
      name: true,
    },
    where: {
      gender: "Female",
    },
    orderBy: {
      name: "asc",
    },
  });

  const fatherNames = await db.cat.findMany({
    select: {
      name: true,
    },
    where: {
      gender: "Male",
    },
    orderBy: {
      name: "asc",
    },
  });

  const uploadUrl = await getSignedURL();

  return {
    props: {
      uploadUrl,
      motherNames,
      fatherNames,
    },
  };
}
