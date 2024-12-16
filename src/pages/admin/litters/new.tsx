import { zodResolver } from '@hookform/resolvers/zod';
import { addHours, format } from 'date-fns';
import { CalendarIcon, Edit, Loader2, Trash2 } from 'lucide-react';
import { useRouter } from 'next/router';
import {
  type GetServerSidePropsContext,
  type GetServerSidePropsResult,
} from 'next/types';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { BiSolidCat } from 'react-icons/bi';
import { IoMdFemale, IoMdMale } from 'react-icons/io';
import CreateableSelect from 'react-select/creatable';
import { type z } from 'zod';

import CreatableSelect from 'react-select/creatable';
import AddKittenModal from '~/components/AddKittenModal';
import EditKittenModal from '~/components/EditKittenModal';
import { ImageUpload } from '~/components/ImageUpload';
import { Button } from '~/components/ui/button';
import { Calendar } from '~/components/ui/calendar';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form';
import { Input } from '~/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/components/ui/popover';
import { Textarea } from '~/components/ui/textarea';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '~/components/ui/tooltip';
import { toast } from '~/components/ui/use-toast';
import { cn } from '~/lib/utils';
import { litterSchema } from '~/lib/validators/litter';
import { db } from '~/server/db';
import { checkAdminSession } from '~/server/helpers';
import { api } from '~/utils/api';
import type { EditKittenType } from '~/utils/types';
import AdminLayout from '../AdminLayout';

interface NewLitterProps {
  motherNames: { name: string; stamnavn: string }[];
  fatherNames: { name: string; stamnavn: string }[];
  tags: { value: string }[];
}

export default function NewLitter({
  motherNames,
  fatherNames,
  tags,
}: NewLitterProps) {
  const [isKittenDialogOpen, setIsKittenDialogOpen] = useState(false);
  const [isEditKittenDialogOpen, setIsEditKittenDialogOpen] = useState(false);
  const [editingKitten, setEditingKitten] = useState<EditKittenType>(undefined);

  const litterForm = useForm<z.infer<typeof litterSchema>>({
    resolver: zodResolver(litterSchema),
    defaultValues: {
      name: '',
      pedigreeurl: '',
      mother_name: '',
      father_name: '',
      mother_stamnavn: '',
      father_stamnavn: '',
      description: '',
      born: new Date(),
      father_img: undefined,
      mother_img: undefined,
      post_image: undefined,
      kittens: [],
      tags: [
        {
          label: new Date().getFullYear().toString(),
          value: new Date().getFullYear().toString(),
        },
      ],
    },
  });
  const kittens = litterForm.watch('kittens');
  const router = useRouter();

  const { mutate: mutateCreateLitter, isLoading } =
    api.litter.createLitter.useMutation({
      onSuccess: () => {
        toast({
          variant: 'default',
          title: 'Success',
          color: 'green',
          description: 'Litter added successfully.',
        });
        void router.push('/admin/litters');
      },
      onError: (error) => {
        console.error(error);
        if (error.data?.code === 'CONFLICT') {
          return toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Litter with this name already exists.',
          });
        }
        toast({
          variant: 'destructive',
          title: 'Error',
          description:
            'Something went wrong while creating litter. Please try again',
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
      'kittens',
      kittens.filter((kitten) => kitten.name !== name)
    );
  }

  function handleEditKitten(name: string) {
    const kittenToEdit = kittens.find((kitten) => kitten.name === name);
    if (kittenToEdit) {
      setEditingKitten(kittenToEdit);
      setIsEditKittenDialogOpen(true);
    }
  }

  function handleCreate(inputValue: string) {
    litterForm.setValue(
      'tags',
      [
        ...litterForm.getValues('tags'),
        { label: inputValue, value: inputValue },
      ],
      {
        shouldDirty: true,
      }
    );
  }

  return (
    <AdminLayout>
      <div className="mb-4 flex items-center gap-2">
        <h1 className="text-2xl">New Litter</h1>
        <BiSolidCat className="h-8 w-8" />
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
              control={litterForm.control}
              name="born"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Born</FormLabel>
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
                        instanceId="mother_name"
                        isLoading={isLoading}
                        onChange={(e) => {
                          onChange(e?.value);
                          if (!e?.value)
                            return litterForm.setValue('mother_stamnavn', '');
                          const motherName = motherNames.find(
                            (name) => name.name === e?.value
                          );
                          if (motherName) {
                            litterForm.setValue(
                              'mother_stamnavn',
                              motherName.stamnavn,
                              {
                                shouldValidate: true,
                              }
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
                        instanceId="father_name"
                        isLoading={isLoading}
                        onChange={(e) => {
                          onChange(e?.value);
                          if (!e?.value)
                            return litterForm.setValue('father_stamnavn', '');
                          const fatherName = fatherNames.find(
                            (name) => name.name === e?.value
                          );
                          if (fatherName) {
                            litterForm.setValue(
                              'father_stamnavn',
                              fatherName.stamnavn,
                              { shouldValidate: true }
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
                          <div className="flex gap-1">
                            <button
                              type="button"
                              className="transform rounded-full transition-all duration-200 ease-in-out hover:scale-110 hover:bg-gray-300"
                              onClick={() => {
                                handleEditKitten(kitten.name);
                              }}
                            >
                              <Edit className="size-5" />
                            </button>
                            <button
                              type="button"
                              className="transform rounded-full transition-all duration-200 ease-in-out hover:scale-110 hover:bg-gray-300"
                              onClick={() => handleRemoveKitten(kitten.name)}
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>
                          <p>{kitten.name}</p>
                          {kitten.gender === 'female' ? (
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
                          {kitten.orderStatus && <p>{kitten.orderStatus}</p>}
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
            {editingKitten && (
              <EditKittenModal
                kitten={editingKitten}
                isEditKittenDialogOpen={isEditKittenDialogOpen}
                setIsEditKittenDialogOpen={setIsEditKittenDialogOpen}
              />
            )}
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
  ctx: GetServerSidePropsContext
): Promise<GetServerSidePropsResult<NewLitterProps>> {
  const adminSession = await checkAdminSession(ctx);

  if (!adminSession) {
    return {
      notFound: true,
    };
  }

  const [motherNames, fatherNames] = await Promise.all([
    db.cat.findMany({
      select: {
        name: true,
        stamnavn: true,
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
        stamnavn: true,
      },
      where: {
        gender: 'Male',
      },
      orderBy: {
        name: 'asc',
      },
    }),
  ]);

  const tags = (
    await db.tag.findMany({
      select: {
        value: true,
      },
      distinct: ['value'],
      orderBy: {
        value: 'asc',
      },
    })
  ).filter((tag) => isNaN(Number(tag.value)) && tag.value !== '');

  return {
    props: {
      motherNames,
      fatherNames,
      tags,
    },
  };
}
