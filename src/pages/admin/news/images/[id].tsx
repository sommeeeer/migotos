import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { BlogPostImage, Prisma } from '@prisma/client';
import { AnimatePresence, motion } from 'framer-motion';
import { GripVertical, ImagePlus, RotateCcw, Save, Upload } from 'lucide-react';
import Image from 'next/image';
import { useId, useState } from 'react';
import { AiFillDelete } from 'react-icons/ai';

import {
  type GetServerSidePropsContext,
  type GetServerSidePropsResult,
} from 'next/types';
import { Button } from '~/components/ui/button';
import { db } from '~/server/db';
import { checkAdminSession } from '~/server/helpers';
import AdminLayout from '../../AdminLayout';

import ImageDropzone from '~/components/ImageDropzone';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '~/components/ui/alert-dialog';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog';
import { Label } from '~/components/ui/label';
import LoadingSpinner from '~/components/ui/LoadingSpinner';
import { Progress } from '~/components/ui/progress';
import { toast } from '~/components/ui/use-toast';
import { useUploadImages } from '~/hooks/use-upload-images';
import { cn } from '~/lib/utils';
import { api } from '~/utils/api';
import { bytesToMB, handleImageChange } from '~/utils/helpers';

type BlogPostWithImage = Prisma.BlogPostGetPayload<{
  include: {
    images: true;
  };
}>;

type EditBlogImagesProps = {
  blogpost: BlogPostWithImage;
};

export default function EditBlogImages({ blogpost }: EditBlogImagesProps) {
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [filesToUpload, setFilesToUpload] = useState<
    File[] | undefined | null
  >();
  const [size, setSize] = useState<number | undefined>();
  const [items, setItems] = useState<BlogPostImage[]>(blogpost.images);
  const [open, setOpen] = useState(false);
  const [progressValue, setProgressValue] = useState(0);

  const { isUploading, uploadImages } = useUploadImages();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const { isLoading, isFetching, isError, refetch } =
    api.blogpost.getBlogPostImages.useQuery(
      {
        blogpost_id: blogpost.id,
      },
      {
        onSuccess: (data) => {
          setItems(data);
        },
        initialData: blogpost.images,
        refetchOnMount: false,
      }
    );

  const id = useId();

  const { mutate: mutateUpdateOrder, isLoading: isLoadingOrder } =
    api.blogpost.updateBlogPostImagesOrder.useMutation({
      onSuccess: () => {
        toast({
          variant: 'default',
          title: 'Success',
          color: 'green',
          description: 'Blogpost images order updated successfully.',
        });
        void refetch();
      },
      onError: () => {
        toast({
          variant: 'destructive',
          title: 'Error',
          description:
            'Something went wrong while updating image order. Please try again',
        });
        void refetch();
      },
    });
  const { mutate: mutateAddBlogPostImages } =
    api.blogpost.addBlogPostImages.useMutation({
      onSuccess: () => {
        toast({
          variant: 'default',
          title: 'Success',
          color: 'green',
          description:
            'Blogpost images succesfully uploaded and added to the database.',
        });
        void refetch();
        setProgressValue(0);
      },
      onError: () => {
        toast({
          variant: 'destructive',
          title: 'Error',
          description:
            'Something went wrong while adding images to the database. Please try again',
        });
        void refetch();
      },
    });

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (active?.id !== over?.id) {
      setItems((prev) => {
        if (!prev) return prev;
        const activeIndex = prev.findIndex((item) => item.id === active?.id);
        const overIndex = prev.findIndex((item) => item.id === over?.id);
        return arrayMove(prev, activeIndex, overIndex);
      });
    }
  }

  function handleSaveOrder() {
    if (!items) return;
    const newOrder = items.map((item, index) => {
      return {
        id: item.id,
        priority: index + 1,
      };
    });
    mutateUpdateOrder({
      blogpost_id: blogpost.id,
      order: newOrder,
    });
  }

  async function handleUpload() {
    if (!filesToUpload)
      return toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please select images to upload.',
      });
    const imageUrls = await uploadImages(filesToUpload, (i) => {
      const progress = (i / filesToUpload.length) * 100;
      setProgressValue(progress);
    });
    if (imageUrls) {
      setOpen(false);
      mutateAddBlogPostImages({
        blogpost_id: blogpost.id,
        imageUrls,
      });
    }
  }

  return (
    <AdminLayout>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-4 rounded-xl border-2 p-4 text-center">
          <h1 className="text-xl text-gray-800">Photos for {blogpost.title}</h1>
          {items && (
            <h3 className="text-sm text-gray-700">
              Total: {`${items.length} images`}
            </h3>
          )}
          <div className="flex justify-center gap-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  disabled={(items && items.length === 0) || isLoadingOrder}
                  className="w-fit"
                >
                  {isLoadingOrder && (
                    <LoadingSpinner className="mr-2 h-4 w-4" />
                  )}
                  {!isLoadingOrder && <Save className="mr-2 h-5 w-5" />}
                  Save new order
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently save the
                    new order of the photos.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-green-500 hover:bg-green-600"
                    onClick={handleSaveOrder}
                  >
                    Save
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger
                onClick={() => {
                  setSelectedImages([]);
                  setSize(undefined);
                  setFilesToUpload([]);
                }}
                asChild
              >
                <Button className="w-fit">
                  <ImagePlus className="mr-2 h-5 w-5" /> Add more photos
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Add photos</DialogTitle>
                  <DialogDescription>
                    Select images to upload.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex items-center space-x-2">
                  <div className="grid flex-1 gap-2">
                    <Label htmlFor="link" className="sr-only">
                      Link
                    </Label>
                    <ImageDropzone
                      onDrop={(files) =>
                        handleImageChange(
                          files,
                          setFilesToUpload,
                          setSelectedImages,
                          setSize
                        )
                      }
                    />
                    <div className="grid grid-cols-5 items-end gap-2">
                      {selectedImages.map((image, index) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          key={index}
                          src={image}
                          alt={`Selected ${index}`}
                          width={150}
                          height={150}
                        />
                      ))}
                    </div>
                    {size && (
                      <span className="text-sm text-muted-foreground">
                        Total size: {bytesToMB(size)} MB
                      </span>
                    )}
                  </div>
                </div>
                {isUploading && <Progress value={progressValue} />}
                <DialogFooter className="sm:justify-start">
                  <DialogClose asChild disabled={isUploading}>
                    <Button
                      type="button"
                      variant="secondary"
                      disabled={isUploading}
                    >
                      Close
                    </Button>
                  </DialogClose>
                  <Button
                    onClick={handleUpload}
                    type="submit"
                    variant="secondary"
                    disabled={isUploading}
                  >
                    {isUploading && <LoadingSpinner className="mr-2 h-4 w-4" />}
                    {!isUploading && <Upload size={16} className="mr-2" />}
                    Upload
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button
              className={cn(isFetching && 'bg-primary/80')}
              onClick={() => refetch()}
              disabled={isFetching}
            >
              <RotateCcw
                className={cn('h-5 w-5', isFetching && 'animate-spin')}
              />
            </Button>
          </div>
        </div>
        {isLoading && <LoadingSpinner className="mx-auto h-16 w-16" />}
        {isError && (
          <p className="text-center text-xl text-red-600">
            Something wrong happend during fetching of the images. Try again
            later
          </p>
        )}
        {items && (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            id={id}
          >
            <SortableContext items={items} strategy={rectSortingStrategy}>
              <section className="w-full max-w-7xl">
                <ul className="grid grid-cols-responsive place-items-center gap-1 gap-x-2">
                  <AnimatePresence>
                    {items.map((blogPostImage) => (
                      <SortableItem
                        key={blogPostImage.id}
                        refetchImages={refetch}
                        {...blogPostImage}
                      />
                    ))}
                  </AnimatePresence>
                </ul>
              </section>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </AdminLayout>
  );
}

function SortableItem({
  width,
  height,
  src,
  id,
  refetchImages,
}: {
  width: number;
  height: number;
  src: string;
  id: number;
  refetchImages: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
  } = useSortable({
    id: id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  const { mutate: mutateDeleteImage } =
    api.blogpost.deleteBlogPostImage.useMutation({
      onSuccess: () => {
        toast({
          variant: 'default',
          title: 'Success',
          color: 'green',
          description: 'Image deleted successfully.',
        });
        refetchImages();
      },
      onError: () => {
        toast({
          variant: 'destructive',
          title: 'Error',
          description:
            'Something went wrong while deleting image. Please try again',
        });
      },
    });

  return (
    <motion.li
      ref={setNodeRef}
      style={style}
      {...attributes}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.3 } }}
      exit={{ opacity: 0, transition: { duration: 0.3 } }}
      className="flex h-[150px] w-[220px] cursor-default gap-4 rounded border-2 border-slate-500 p-2"
    >
      <div className="overflow-hidden">
        <Image
          width={width}
          height={height}
          className="h-auto w-[200px]"
          src={src}
          alt={`photo number ${id}`}
          draggable
        />
      </div>
      <div className="flex flex-col items-center justify-between pt-2">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button>
              <AiFillDelete className="h-6 w-6 transition-colors duration-200 hover:scale-105 hover:text-zinc-600" />
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete this
                photo and remove the data from the server.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-500 hover:bg-red-600"
                onClick={() =>
                  mutateDeleteImage({
                    id: id,
                  })
                }
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <div
          {...listeners}
          ref={setActivatorNodeRef}
          className="flex cursor-grab items-center gap-1 rounded p-1 hover:bg-gray-100"
        >
          <GripVertical className="h-8 w-8" />
        </div>
      </div>
    </motion.li>
  );
}

export async function getServerSideProps(
  ctx: GetServerSidePropsContext
): Promise<
  GetServerSidePropsResult<{
    blogpost: BlogPostWithImage;
  }>
> {
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

  const blogpost = await db.blogPost.findFirst({
    where: {
      id: +ctx.query.id,
    },
    include: {
      images: {
        where: {
          priority: {
            gt: 1,
          },
        },
        orderBy: {
          priority: 'asc',
        },
      },
    },
  });
  if (!blogpost) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      blogpost,
    },
  };
}
