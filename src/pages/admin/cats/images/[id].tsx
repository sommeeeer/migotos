import type { Cat, CatImage, Prisma } from "@prisma/client";

import { db } from "~/server/db";
import {
  type GetServerSidePropsContext,
  type GetServerSidePropsResult,
} from "next/types";
import { checkAdminSession } from "~/server/helpers";
import AdminLayout from "../../AdminLayout";
import Image from "next/image";
import { Button } from "~/components/ui/button";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Delete,
  GripVertical,
  ImagePlus,
  MoreHorizontal,
  RotateCcw,
  Save,
  Upload,
} from "lucide-react";
import { type ChangeEvent, useState, useId } from "react";
import {
  DndContext,
  useSensors,
  useSensor,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
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
} from "~/components/ui/alert-dialog";
import { api } from "~/utils/api";
import { toast } from "~/components/ui/use-toast";
import { bytesToMB, uploadS3 } from "~/utils/helpers";
import LoadingSpinner from "~/components/ui/LoadingSpinner";
import { cn } from "~/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { AiFillDelete } from "react-icons/ai";

type CatWithImage = Prisma.CatGetPayload<{
  include: {
    CatImage: true;
  };
}>;

type EditCatImagesProps = {
  cat: CatWithImage;
};

export default function EditCatImages({ cat }: EditCatImagesProps) {
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [filesToUpload, setFilesToUpload] = useState<FileList | null>();
  const [size, setSize] = useState<number | undefined>();
  const [items, setItems] = useState<CatImage[]>();
  const [open, setOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const { isLoading, isFetching, isError, refetch } =
    api.cat.getCatImages.useQuery(
      {
        cat_id: cat.id,
      },
      {
        onSuccess: (data) => {
          setItems(data);
        },
        initialData: cat.CatImage,
        refetchOnWindowFocus: false,
      },
    );

  const id = useId();

  const { mutate: mutateUpdateOrder } =
    api.cat.updateCatImagesOrder.useMutation({
      onSuccess: () => {
        toast({
          variant: "default",
          title: "Success",
          color: "green",
          description: "Cat images order updated successfully.",
        });
        void refetch();
      },
      onError: () => {
        toast({
          variant: "destructive",
          title: "Error",
          description:
            "Something went wrong while updating image order. Please try again",
        });
        void refetch();
      },
    });
  const { mutate: mutateAddCatImages } = api.cat.addCatImages.useMutation({
    onSuccess: () => {
      toast({
        variant: "default",
        title: "Success",
        color: "green",
        description:
          "Cat images succesfully uploaded and added to the database.",
      });
      void refetch();
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          "Something went wrong while adding images to the database. Please try again",
      });
      void refetch();
    },
    onSettled: () => {
      setOpen(false);
      setIsUploading(false);
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

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    const imagesArray: string[] = [];

    if (files) {
      for (const file of files) {
        if (file.type.startsWith("image/")) {
          imagesArray.push(URL.createObjectURL(file));
        }
      }
      setFilesToUpload(files);
      setSelectedImages(imagesArray);
      let size = 0;
      for (const file of files) {
        size += file.size;
      }
      setSize(size);
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
      cat_id: cat.id,
      order: newOrder,
    });
  }

  async function handleUpload() {
    setIsUploading(true);
    if (!filesToUpload) return;
    try {
      const imgs = [];
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
      mutateAddCatImages({
        cat_id: cat.id,
        imageUrls: imgs,
      });
    } catch (err) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Something went wrong while uploading images.",
      });
    }
  }

  return (
    <AdminLayout>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-4 rounded-xl border-2 p-4 text-center">
          <h1 className="text-xl text-gray-800">Photos for {cat.name}</h1>
          {items && (
            <h3 className="text-sm text-gray-700">
              Total: {`${items.length} images`}
            </h3>
          )}
          <div className="flex justify-center gap-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  disabled={items && items.length === 0}
                  className="w-fit"
                >
                  <Save className="mr-2 h-5 w-5" />
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
                  setFilesToUpload(null);
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
                    <Input
                      type="file"
                      multiple
                      className="cursor-pointer"
                      accept="image/png, image/jpeg, image/jpg"
                      onChange={handleImageChange}
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
              className={cn(isFetching && "bg-gray-700")}
              onClick={() => refetch()}
            >
              <RotateCcw
                className={cn("h-5 w-5", isFetching && "animate-spin")}
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
              <section className="flex justify-center">
                <ul className="grid grid-cols-5 gap-1 gap-x-2">
                  {items.map((catimage) => (
                    <SortableItem key={catimage.id} {...catimage} />
                  ))}
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
}: {
  width: number;
  height: number;
  src: string;
  id: number;
  priority: number;
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
  return (
    <li
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="flex h-[150px] w-[220px] gap-4 border border-slate-700 p-2"
    >
      <div className="overflow-hidden">
        <Image
          width={width}
          height={height}
          className="h-auto w-[200px] "
          src={src}
          alt={`photo number ${id}`}
          draggable
        />
      </div>
      <div className="flex flex-col items-center justify-between pt-2">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button className="hover:-slate-300">
              <AiFillDelete className="h-6 w-6 transition-colors duration-200 hover:text-zinc-600" />
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
                onClick={() => console.log(id)}
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
    </li>
  );
}

export async function getServerSideProps(
  ctx: GetServerSidePropsContext,
): Promise<
  GetServerSidePropsResult<{
    cat: Cat;
  }>
> {
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

  const cat = await db.cat.findFirst({
    where: {
      id: +ctx.query.id,
    },
    include: {
      CatImage: {
        where: {
          priority: {
            gt: 1,
          },
        },
        orderBy: {
          priority: "asc",
        },
      },
    },
  });
  if (!cat) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      cat,
    },
  };
}
