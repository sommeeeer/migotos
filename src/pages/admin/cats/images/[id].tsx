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
import { Upload } from "lucide-react";
import { ChangeEvent, useState } from "react";

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
  console.log(selectedImages);

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
        <section className="flex flex-col items-center gap-2">
          {cat.CatImage.map((catimage) => (
            <div
              className="flex cursor-grab items-center gap-2"
              key={catimage.id}
            >
              <span className="select-none text-xl">
                {catimage.priority ? catimage.priority - 1 : ""}
              </span>
              <Image
                width={catimage.width}
                height={catimage.height}
                className="h-auto w-[200px]"
                src={catimage.src}
                alt={`${cat.name}'s photo number ${cat.id}`}
              />
            </div>
          ))}
        </section>
      </div>
    </AdminLayout>
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
