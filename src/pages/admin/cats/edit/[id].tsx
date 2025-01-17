import {
  type GetServerSidePropsContext,
  type GetServerSidePropsResult,
} from 'next/types';
import CreateableSelect from 'react-select/creatable';
import { useRouter } from 'next/router';
import { format } from 'date-fns';
import type { Prisma } from '@prisma/client';
import { AiFillEdit } from 'react-icons/ai';
import { zodResolver } from '@hookform/resolvers/zod';
import { addHours } from 'date-fns';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { type z } from 'zod';

import AdminLayout from '../../AdminLayout';
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
import { catSchema } from '~/lib/validators/cat';
import { RadioGroup, RadioGroupItem } from '~/components/ui/radio-group';
import { toast } from '~/components/ui/use-toast';
import { Checkbox } from '~/components/ui/checkbox';
import { api } from '~/utils/api';
import { checkAdminSession } from '~/server/helpers';
import { ImageUpload } from '~/components/ImageUpload';

type CatWithImage = Prisma.CatGetPayload<{
  include: {
    CatImage: true;
  };
}>;

type EditCatProps = {
  cat: CatWithImage;
  motherNames: { name: string }[];
  fatherNames: { name: string }[];
};

export default function EditCat({
  cat,
  motherNames,
  fatherNames,
}: EditCatProps) {
  const router = useRouter();

  const form = useForm<z.infer<typeof catSchema>>({
    resolver: zodResolver(catSchema),
    defaultValues: {
      name: cat.name,
      stamnavn: cat.stamnavn,
      breeder: cat.breeder,
      description: cat.description ?? '',
      father: cat.father,
      mother: cat.mother,
      gender: cat.gender,
      owner: cat.owner,
      pedigreeurl: cat.pedigreeurl ?? '',
      nickname: cat.nickname,
      birth: cat.birth,
      fertile: cat.fertile,
      image_url: cat.CatImage[0]?.src ?? '',
    },
  });

  const { isDirty } = form.formState;

  const { mutate, isLoading } = api.cat.updateCat.useMutation({
    onSuccess: () => {
      toast({
        variant: 'default',
        title: 'Success',
        color: 'green',
        description: 'Cat updated successfully.',
      });
      void router.push('/admin/cats');
    },
    onError: (error) => {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Something went wrong while updating. Please try again',
      });
    },
  });

  function onSubmit(values: z.infer<typeof catSchema>) {
    if (!isDirty) {
      toast({
        variant: 'destructive',
        description: 'No changes detected.',
      });
      return;
    }
    mutate({
      id: cat.id,
      ...values,
      birth: addHours(values.birth, 2),
    });
  }

  return (
    <AdminLayout>
      <div className="flex items-center gap-2">
        <h1 className="text-2xl">
          Edit Cat: {cat.name} (ID: {cat.id})
        </h1>
        <AiFillEdit className="mb-4 h-12 w-12" />
      </div>
      <div className="mb-4 rounded-lg bg-white p-8 shadow">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="max-w-2xl space-y-6"
          >
            <div className="flex items-center gap-4">
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
            </div>
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
            <div className="flex items-end gap-4">
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
                name="fertile"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        className="rounded-none"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel>Fertile</FormLabel>
                  </FormItem>
                )}
              />
            </div>
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
              render={({ field: { onChange, onBlur, name, ref, value } }) => (
                <FormItem>
                  <FormLabel>Father</FormLabel>
                  <FormControl>
                    <CreateableSelect
                      instanceId="father"
                      isLoading={isLoading}
                      onChange={(e) => onChange(e?.value)}
                      defaultValue={{ value: value, label: value }}
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
              render={({ field: { onChange, onBlur, name, ref, value } }) => (
                <FormItem>
                  <FormLabel>Mother</FormLabel>
                  <FormControl>
                    <CreateableSelect
                      instanceId="mother"
                      isLoading={isLoading}
                      defaultValue={{ value: value, label: value }}
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
            <FormField
              control={form.control}
              name="image_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profile Image</FormLabel>
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
): Promise<GetServerSidePropsResult<EditCatProps>> {
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

  const cat = await db.cat.findFirst({
    where: {
      id: +ctx.query.id,
    },
    include: {
      CatImage: true,
    },
  });

  if (!cat) {
    return {
      notFound: true,
    };
  }

  const [motherNames, fatherNames] = await Promise.all([
    db.cat.findMany({
      select: {
        name: true,
      },
      where: {
        gender: 'Female',
      },
      orderBy: {
        name: 'asc',
      },
    }),
    db.cat.findMany({
      select: {
        name: true,
      },
      where: {
        gender: 'Male',
      },
      orderBy: {
        name: 'asc',
      },
    }),
  ]);

  return {
    props: {
      cat,
      motherNames,
      fatherNames,
    },
  };
}
