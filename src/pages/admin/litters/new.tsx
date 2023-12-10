import AdminLayout from "../AdminLayout";
import {
  type GetServerSidePropsContext,
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
import { type z } from "zod";
import { toast } from "~/components/ui/use-toast";
import { checkAdminSession } from "~/server/helpers";
import { litterSchema } from "~/lib/validators/litter";
import { CalendarIcon, Delete, Loader2 } from "lucide-react";
import { cn } from "~/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Calendar } from "~/components/ui/calendar";
import { addHours, format } from "date-fns";
import { BiSolidCat } from "react-icons/bi";
import { useEffect, useRef, useState } from "react";
import AddKittenModal from "~/components/AddKittenModal";
import { IoMdFemale, IoMdMale } from "react-icons/io";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { Label } from "~/components/ui/label";
import { uploadS3 } from "~/utils/helpers";
import { api } from "~/utils/api";
import ShowCurrentImages from "~/components/ShowCurrentImages";

export default function NewLitter() {
  const [isKittenDialogOpen, setIsKittenDialogOpen] = useState(false);
  const [motherImage, setMotherImage] = useState<File | undefined>(undefined);
  const [fatherImage, setFatherImage] = useState<File | undefined>(undefined);
  const [postImage, setPostImage] = useState<File | undefined>(undefined);
  const [isUploading, setIsUploading] = useState(false);

  const litterForm = useForm<z.infer<typeof litterSchema>>({
    resolver: zodResolver(litterSchema),
    defaultValues: {
      name: "",
      pedigreeurl: "",
      mother_name: "",
      father_name: "",
      mother_stamnavn: "",
      father_stamnavn: "",
      description: "",
      born: new Date(),
      father_img: undefined,
      mother_img: undefined,
      post_image: undefined,
      kittens: [],
    },
  });
  const isDirty = litterForm.formState.isDirty;
  const kittens = litterForm.watch("kittens");

  const router = useRouter();

  const { mutate, isLoading } = api.litter.createLitter.useMutation({
    onSuccess: () => {
      toast({
        variant: "default",
        title: "Success",
        color: "green",
        description: "Litter added successfully.",
      });
      void router.push("/admin/litters");
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Something went wrong while updating. Please try again",
      });
    },
  });

  async function handleUpload() {
    const filesToUpload = [motherImage, fatherImage, postImage];

    if (filesToUpload.some((file) => !file)) {
      return toast({
        variant: "destructive",
        title: "Error",
        description: "Please select all images before uploading.",
      });
    }

    setIsUploading(true);
    try {
      const imgs: string[] = [];
      const res = await fetch(
        `/api/getSignedURLS?amount=${filesToUpload.length}`,
      );
      if (!res.ok) {
        throw new Error("Something went wrong while getting signed URLs");
      }
      const { urls } = (await res.json()) as { urls: string[] };
      for (let i = 0; i < filesToUpload.length; i++) {
        const file = filesToUpload[i];
        const url = urls[i];
        if (!url || !file)
          throw new Error("Something went wrong while uploading images.");
        const imageURL = await uploadS3(file, url);
        if (!imageURL) {
          throw new Error("Something went wrong while uploading images.");
        }
        imgs.push(imageURL);
      }
      if (imgs.length !== 3) {
        throw new Error("Something went wrong while uploading images.");
      }
      litterForm.setValue("mother_img", imgs[0]!);
      litterForm.setValue("father_img", imgs[1]!);
      litterForm.setValue("post_image", imgs[2]!);
    } catch (err) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Something went wrong while uploading images.",
      });
    } finally {
      setIsUploading(false);
    }
  }
  function onSubmitLitter(values: z.infer<typeof litterSchema>) {
    console.log(values);
    if (!isDirty) {
      toast({
        variant: "destructive",
        description: "No changes detected.",
      });
      return;
    }
    mutate({
      ...values,
      born: addHours(values.born, 2),
    });
    litterForm.reset({
      ...values,
    });
  }

  function handleRemoveKitten(name: string) {
    litterForm.setValue(
      "kittens",
      kittens.filter((kitten) => kitten.name !== name),
    );
  }

  const prevFilesRef = useRef<(File | undefined)[]>([
    undefined,
    undefined,
    undefined,
  ]);
  useEffect(() => {
    prevFilesRef.current = [motherImage, fatherImage, postImage];
  }, [motherImage, fatherImage, postImage]);

  return (
    <AdminLayout>
      <div className="flex items-center gap-2">
        <h1 className="text-2xl">New Litter</h1>
        <BiSolidCat className="mb-4 h-8 w-8" />
      </div>
      <div className="mb-4 rounded-lg bg-white p-8 shadow">
        <Form {...litterForm}>
          <form
            onSubmit={litterForm.handleSubmit(onSubmitLitter)}
            className="space-y-6"
          >
            <FormField
              control={litterForm.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input disabled={isLoading} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={litterForm.control}
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
            <FormField
              control={litterForm.control}
              name="mother_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mother Name</FormLabel>
                  <FormControl>
                    <Input disabled={isLoading} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={litterForm.control}
              name="father_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Father Name</FormLabel>
                  <FormControl>
                    <Input disabled={isLoading} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={litterForm.control}
              name="mother_stamnavn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mother&apos;s Fargekode</FormLabel>
                  <FormControl>
                    <Input disabled={isLoading} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={litterForm.control}
              name="father_stamnavn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Father&apos;s Fargekode</FormLabel>
                  <FormControl>
                    <Input disabled={isLoading} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={litterForm.control}
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
            <div className="flex flex-col space-y-2">
              <FormLabel>Kittens</FormLabel>
              <div className="flex flex-wrap gap-2 gap-y-3">
                {kittens.map((kitten, index) => (
                  <TooltipProvider key={index}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex flex-row-reverse items-center gap-2 rounded-xl bg-zinc-200 px-4 py-2">
                          <button
                            type="button"
                            onClick={() => handleRemoveKitten(kitten.name)}
                          >
                            <Delete className="h-5 w-5" />
                          </button>
                          <p>{kitten.name}</p>
                          {kitten.gender === "female" ? (
                            <IoMdFemale className="fill-pink-500" />
                          ) : (
                            <IoMdMale className="fill-blue-500" />
                          )}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div>
                          <p>{kitten.info}</p>
                          {kitten.stamnavn && <p>{kitten.stamnavn}</p>}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
                {!litterForm.formState.errors.kittens &&
                  kittens.length === 0 && (
                    <p className="text-gray-500">No kittens added yet.</p>
                  )}
                <>
                  {litterForm.formState.errors.kittens && (
                    <p className="text-red-500">
                      {litterForm.formState.errors.kittens.message}
                    </p>
                  )}
                </>
              </div>
            </div>
            <AddKittenModal
              isKittenDialogOpen={isKittenDialogOpen}
              setIsKittenDialogOpen={setIsKittenDialogOpen}
            />
            <FormField
              control={litterForm.control}
              name="born"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Born</FormLabel>
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
              <Label>Current Images</Label>
              <ShowCurrentImages />
              <div className="flex gap-8">
                <div className="flex-col">
                  <Label>Select New Mother Image (200x200)</Label>
                  <Input
                    type="file"
                    className="cursor-pointer"
                    disabled={isUploading || isLoading}
                    onChange={(e) => {
                      if (!e.target.files) return;
                      setMotherImage(e.target.files[0]);
                    }}
                    accept="image/png, image/jpeg, image/jpg"
                  />
                </div>
                <div className="flex-col gap-2">
                  <Label>Select New Father Image (200x200)</Label>
                  <Input
                    type="file"
                    className="cursor-pointer"
                    disabled={isUploading || isLoading}
                    onChange={(e) => {
                      if (!e.target.files) return;
                      setFatherImage(e.target.files[0]);
                    }}
                    accept="image/png, image/jpeg, image/jpg"
                  />
                </div>
              </div>
              <div className="mt-4 flex-col gap-2">
                <Label>Select New Post Image</Label>
                <Input
                  type="file"
                  className="cursor-pointer"
                  disabled={isUploading || isLoading}
                  onChange={(e) => {
                    if (!e.target.files) return;
                    setPostImage(e.target.files[0]);
                  }}
                  accept="image/png, image/jpeg, image/jpg"
                />
              </div>
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

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const adminSession = await checkAdminSession(ctx);

  if (!adminSession) {
    return {
      notFound: true,
    };
  }

  return {
    props: {},
  };
}
