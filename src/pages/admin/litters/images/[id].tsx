import type { Cat, CatImage, LitterPictureWeek, Prisma } from "@prisma/client";

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

type LitterWithImages = Prisma.LitterGetPayload<{
  include: {
    LitterPictureWeek: {
      include: {
        KittenPictureImage: true;
      };
    };
  };
}>;

type EditLitterImagesProps = {
  litter: LitterWithImages;
};

export default function EditCatImages({ litter }: EditLitterImagesProps) {
  const [items, setItems] = useState<LitterPictureWeek[]>(
    litter.LitterPictureWeek,
  );

  console.log(litter.LitterPictureWeek);
  console.log(items);

  return (
    <AdminLayout>
      <div className="flex flex-col gap-8">
        <div className="flex max-w-6xl flex-col gap-4 rounded-xl border-2 p-4 text-center">
          <h1 className="text-xl text-gray-800">
            Litter photos for {litter.name}
          </h1>
          <Tabs defaultValue={litter.LitterPictureWeek[0]?.name}>
            <TabsList className="mx-auto flex w-fit border">
              {litter.LitterPictureWeek.map((week) => (
                <TabsTrigger
                  className="px-4 py-2 text-base"
                  key={week.id}
                  value={week.name}
                >{`${week.name.replace("-", " ")}`}</TabsTrigger>
              ))}
            </TabsList>
            {litter.LitterPictureWeek.map((week) => (
              <TabsContent key={week.id} value={week.name}>
                <Card>
                  <CardHeader>
                    <CardTitle>{week.name.replace("-", " ")}</CardTitle>
                    <CardDescription>
                      {week.link || "No description"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <section className="grid grid-cols-4 justify-items-center gap-2">
                      {week.KittenPictureImage.map((image) => (
                        <picture key={image.id} className="h-48 w-48">
                          <Image
                            src={image.src}
                            alt={image.title ?? "Photo of kitten"}
                            width={image.width}
                            height={image.height}
                            className="h-full w-full object-cover"
                          />
                        </picture>
                      ))}
                    </section>
                  </CardContent>
                  <CardFooter>
                    <Button>Save changes</Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </AdminLayout>
  );
}

export async function getServerSideProps(
  ctx: GetServerSidePropsContext,
): Promise<GetServerSidePropsResult<EditLitterImagesProps>> {
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
    include: {
      LitterPictureWeek: {
        include: {
          KittenPictureImage: true,
        },
      },
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
