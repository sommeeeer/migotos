import AdminLayout from "../AdminLayout";
import {
  type GetServerSidePropsResult,
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
import { CalendarIcon, Loader2, Trash2 } from "lucide-react";
import { cn } from "~/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Calendar } from "~/components/ui/calendar";
import { addHours, format } from "date-fns";
import { BiSolidCat } from "react-icons/bi";
import { useState } from "react";
import AddKittenModal from "~/components/AddKittenModal";
import { IoMdFemale, IoMdMale } from "react-icons/io";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { api } from "~/utils/api";
import CreateableSelect from "react-select/creatable";
import { db } from "~/server/db";
import { ImageUpload } from "~/components/ImageUpload";

interface NewLitterProps {
  motherNames: { name: string; stamnavn: string }[];
  fatherNames: { name: string; stamnavn: string }[];
}

export default function NewLitter({
  motherNames,
  fatherNames,
}: NewLitterProps) {
  const [isKittenDialogOpen, setIsKittenDialogOpen] = useState(false);

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
  const kittens = litterForm.watch("kittens");
  const router = useRouter();

  const { mutate: mutateCreateLitter, isLoading } =
    api.litter.createLitter.useMutation({
      onSuccess: () => {
        toast({
          variant: "default",
          title: "Success",
          color: "green",
          description: "Litter added successfully.",
        });
        void router.push("/admin/litters");
      },
      onError: (error) => {
        console.error(error);
        if (error.data?.code === "CONFLICT") {
          return toast({
            variant: "destructive",
            title: "Error",
            description: "Litter with this name already exists.",
          });
        }
        toast({
          variant: "destructive",
          title: "Error",
          description:
            "Something went wrong while creating litter. Please try again",
        });
      },
    });

  function onSubmitLitter(values: z.infer<typeof litterSchema>) {
    mutateCreateLitter({
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
            className="max-w-3xl space-y-6"
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
            <div className="flex w-full items-end gap-4">
              <FormField
                control={litterForm.control}
                name="mother_name"
                render={({ field: { onChange, onBlur, name, ref } }) => (
                  <FormItem className="w-2/3">
                    <FormLabel>Mother Name</FormLabel>
                    <FormControl>
                      <CreateableSelect
                        isLoading={isLoading}
                        onChange={(e) => {
                          onChange(e?.value);
                          if (!e?.value)
                            return litterForm.setValue("mother_stamnavn", "");
                          const motherName = motherNames.find(
                            (name) => name.name === e?.value,
                          );
                          if (motherName) {
                            litterForm.setValue(
                              "mother_stamnavn",
                              motherName.stamnavn,
                              {
                                shouldValidate: true,
                              },
                            );
                          }
                        }}
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
                control={litterForm.control}
                name="mother_stamnavn"
                render={({ field }) => (
                  <FormItem className="w-1/3">
                    <FormLabel className="flex">
                      Mother&apos;s Fargekode
                    </FormLabel>
                    <FormControl>
                      <Input disabled={isLoading} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex w-full items-end gap-4">
              <FormField
                control={litterForm.control}
                name="father_name"
                render={({ field: { onChange, onBlur, name, ref } }) => (
                  <FormItem className="w-2/3">
                    <FormLabel>Father Name</FormLabel>
                    <FormControl>
                      <CreateableSelect
                        isLoading={isLoading}
                        onChange={(e) => {
                          onChange(e?.value);
                          if (!e?.value)
                            return litterForm.setValue("father_stamnavn", "");
                          const fatherName = fatherNames.find(
                            (name) => name.name === e?.value,
                          );
                          if (fatherName) {
                            litterForm.setValue(
                              "father_stamnavn",
                              fatherName.stamnavn,
                              { shouldValidate: true },
                            );
                          }
                        }}
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
                control={litterForm.control}
                name="father_stamnavn"
                render={({ field }) => (
                  <FormItem className="w-1/3">
                    <FormLabel className="flex">
                      Father&apos;s Fargekode
                    </FormLabel>
                    <FormControl>
                      <Input disabled={isLoading} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
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
                        <div className="flex select-none flex-row-reverse items-center gap-2 rounded-xl bg-zinc-200 px-4 py-2">
                          <button
                            type="button"
                            className="transform rounded-full transition-all duration-200 ease-in-out hover:scale-110 hover:bg-gray-300"
                            onClick={() => handleRemoveKitten(kitten.name)}
                          >
                            <Trash2 className="h-5 w-5" />
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
              name="post_image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Post Image</FormLabel>
                  <FormControl>
                    <ImageUpload
                      value={field.value}
                      onChange={field.onChange}
                      postImage
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="!mb-10 flex gap-x-12">
              <FormField
                control={litterForm.control}
                name="mother_img"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mother Image</FormLabel>
                    <FormControl>
                      <ImageUpload
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={litterForm.control}
                name="father_img"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Father Image</FormLabel>
                    <FormControl>
                      <ImageUpload
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex gap-1">
              <Button
                variant="secondary"
                type="button"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create
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
): Promise<GetServerSidePropsResult<NewLitterProps>> {
  const adminSession = await checkAdminSession(ctx);

  if (!adminSession) {
    return {
      notFound: true,
    };
  }
  const motherNames = await db.cat.findMany({
    select: {
      name: true,
      stamnavn: true,
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
      stamnavn: true,
    },
    where: {
      gender: "Male",
    },
    orderBy: {
      name: "asc",
    },
  });

  return {
    props: {
      motherNames,
      fatherNames,
    },
  };
}
