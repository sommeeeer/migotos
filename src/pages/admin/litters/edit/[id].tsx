import type { Litter } from "@prisma/client";

import AdminLayout from "../../AdminLayout";
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
import { type z } from "zod";
import { toast } from "~/components/ui/use-toast";
import { checkAdminSession } from "~/server/helpers";
import { litterSchema } from "~/lib/validators/litter";
import { CalendarIcon, Loader2 } from "lucide-react";
import { cn } from "~/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Calendar } from "~/components/ui/calendar";
import { format } from "date-fns";

type EditLitterProps = {
  litter: Litter;
};

export default function EditLitter({ litter }: EditLitterProps) {
  const form = useForm<z.infer<typeof litterSchema>>({
    resolver: zodResolver(litterSchema),
    defaultValues: {
      name: litter.name,
      pedigreeurl: litter.pedigreeurl ?? "",
      mother_name: litter.mother_name,
      father_name: litter.father_name,
      mother_stamnavn: litter.mother_stamnavn,
      father_stamnavn: litter.father_stamnavn,
      description: litter.description ?? "",
      born: litter.born,
    },
  });
  const router = useRouter();
  // const { mutate, isLoading } = api.cat.updateCat.useMutation({
  //   onSuccess: () => {
  //     toast({
  //       variant: "default",
  //       title: "Success",
  //       color: "green",
  //       description: "Cat updated successfully.",
  //     });
  //     void router.replace(router.asPath);
  //   },
  //   onError: () => {
  //     toast({
  //       variant: "destructive",
  //       title: "Error",
  //       description: "Something went wrong while updating. Please try again",
  //     });
  //   },
  // });
  function onSubmit(values: z.infer<typeof litterSchema>) {
    if (!form.formState.isDirty) {
      toast({
        variant: "destructive",
        description: "No changes detected.",
      });
      return;
    }
    console.log(values);
    // mutate({
    //   id: cat.id,
    //   ...values,
    //   birth: addHours(values.birth, 2),
    //   imageUrl: imageUrl,
    // });
    form.reset({
      ...values,
    });
  }

  const isLoading = false;
  return (
    <AdminLayout>
      <div className="flex items-center gap-2">
        <h1 className="text-2xl">
          Edit Litter: {litter.name} (ID: {litter.id})
        </h1>
        <AiFillEdit className="mb-4 h-12 w-12" />
      </div>
      <div className="mb-4 rounded-lg bg-white p-8 shadow">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
            <FormField
              control={form.control}
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
            <FormField
              control={form.control}
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
              control={form.control}
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
              control={form.control}
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
              control={form.control}
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
): Promise<GetServerSidePropsResult<EditLitterProps>> {
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

  const litter = await db.litter.findFirst({
    where: {
      id: +ctx.query.id,
    },
  });
  if (!litter) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      litter,
    },
  };
}
