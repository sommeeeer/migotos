import type { Prisma } from "@prisma/client";

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
import { GripVertical, Upload } from "lucide-react";
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
  horizontalListSortingStrategy,
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type CatWithImage = Prisma.CatGetPayload<{
  include: {
    CatImage: true;
  };
}>;

type EditCatImages = {
  cat: CatWithImage;
};

export default function EditCatImages({ cat }: EditCatImages) {
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [items, setItems] = useState(cat.CatImage);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const id = useId();

  function handleDragEnd(event: DragEndEvent) {
    console.log("we here, " + event.active?.id + " " + event.over?.id);
    const { active, over } = event;
    if (active?.id !== over?.id) {
      setItems((prev) => {
        const activeIndex = prev.findIndex((item) => item.id === active?.id);
        const overIndex = prev.findIndex((item) => item.id === over?.id);
        console.log(activeIndex, overIndex);
        return arrayMove(prev, activeIndex, overIndex);
      });
    }
  }

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    const imagesArray: string[] = [];

    if (files) {
      for (const file of files) {
        if (file.type.startsWith("image/")) {
          imagesArray.push(URL.createObjectURL(file));
        }
      }
      setSelectedImages(imagesArray);
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-4 rounded-xl border-2 p-4 text-center">
          <h1 className="text-xl text-gray-800">Photos for {cat.name}</h1>
          <Dialog>
            <DialogTrigger onClick={() => setSelectedImages([])} asChild>
              <Button className="mx-auto w-fit">Add more photos</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add photos</DialogTitle>
                <DialogDescription>Select images to upload.</DialogDescription>
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
                    <ul>
                      {selectedImages.map((image, index) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          key={index}
                          src={image}
                          alt={`Selected ${index}`}
                          width={120}
                          height={80}
                        />
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
              <DialogFooter className="sm:justify-start">
                <DialogClose asChild>
                  <Button type="button" variant="secondary">
                    Close
                  </Button>
                </DialogClose>
                <Button type="submit" variant="secondary">
                  <Upload size={16} className="mr-2" />
                  Upload
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          id={id}
        >
          <SortableContext items={items} strategy={rectSortingStrategy}>
            <section className="flex justify-center">
              <ul className="grid grid-cols-6">
                {items.map((catimage) => (
                  <SortableItem key={catimage.id} {...catimage} />
                ))}
              </ul>
            </section>
          </SortableContext>
        </DndContext>
      </div>
    </AdminLayout>
  );
}

function SortableItem({
  width,
  height,
  src,
  id,
  priority,
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
      className="flex w-[250px] h-[250px] gap-4 border border-slate-700 p-2"
    >
      <div className="w-full">
        <Image
          width={width}
          height={height}
          className="h-[200px] w-[200px]"
          src={src}
          alt={`photo number ${id}`}
        />
      </div>
      <div
        {...listeners}
        ref={setActivatorNodeRef}
        className="flex cursor-grab items-center gap-1 rounded p-1 hover:bg-gray-100"
      >
        <span>{priority - 1}</span>
        <GripVertical className="h-4 w-4" />
      </div>
    </li>
  );
}

export async function getServerSideProps(
  ctx: GetServerSidePropsContext,
): Promise<GetServerSidePropsResult<EditCatImages>> {
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
