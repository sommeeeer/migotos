import type {
  Kitten,
  KittenPictureImage,
  LitterPictureWeek,
  Prisma,
} from "@prisma/client";

import { db } from "~/server/db";
import {
  type GetServerSidePropsContext,
  type GetServerSidePropsResult,
} from "next/types";
import { checkAdminSession } from "~/server/helpers";
import AdminLayout from "../../AdminLayout";
import Image from "next/image";
import { Button } from "~/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { type ChangeEvent, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import BorderText from "~/components/BorderText";
import {
  CalendarPlus,
  Delete,
  ImagePlus,
  RotateCcw,
  Upload,
} from "lucide-react";
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
import LoadingSpinner from "~/components/ui/LoadingSpinner";
import { bytesToMB, uploadS3 } from "~/utils/helpers";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { api } from "~/utils/api";
import { toast } from "~/components/ui/use-toast";
import { cn } from "~/lib/utils";
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

type LitterWithImages = Prisma.LitterGetPayload<{
  include: {
    LitterPictureWeek: {
      include: {
        KittenPictureImage: true;
      };
    };
    Kitten: true;
  };
}>;

type EditLitterImagesProps = {
  litter: LitterWithImages;
};

export default function EditCatImages({ litter }: EditLitterImagesProps) {
  const [kittenImages, setKittenImages] = useState<KittenPictureImage[]>(
    litter.LitterPictureWeek[0]?.KittenPictureImage ?? [],
  );
  const [currentLitter, setCurrentLitter] = useState<LitterWithImages>(litter);
  const [currentWeekSelected, setCurrentWeekSelected] =
    useState<LitterPictureWeek | null>(litter.LitterPictureWeek.at(-1) ?? null);
  const [isAddPhotosOpen, setIsAddPhotosOpen] = useState(false);
  const [isAddWeeksOpen, setIsAddWeeksOpen] = useState(false);
  const [weekNumber, setWeekNumber] = useState<number | undefined>(
    currentLitter.LitterPictureWeek.length > 0
      ? parseInt(currentLitter.LitterPictureWeek.at(-1)?.name || "") + 1
      : 1,
  );
  const [size, setSize] = useState<number | undefined>();
  const [filesToUpload, setFilesToUpload] = useState<FileList | null>();
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [kittenSelectValue, setKittenSelectValue] = useState<string>("");
  const [selectedKitten, setSelectedKitten] = useState<Kitten | null>(null);

  const groupedImages = useMemo(() => {
    const groups: Record<string, KittenPictureImage[]> = {};
    kittenImages?.forEach((image) => {
      const key = image.title ?? "";
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key]?.push(image);
    });
    return groups;
  }, [kittenImages]);

  const {
    isLoading: isLoadingGetLitter,
    isFetching: isFetchingGetLitter,
    refetch: refetchGetLitter,
  } = api.litter.getLitter.useQuery(
    {
      id: litter.id,
    },
    {
      onSuccess: (litter) => {
        if (!litter) {
          return;
        }
        setCurrentLitter(litter);
        setCurrentWeekSelected(litter.LitterPictureWeek[0] ?? null);
      },
      initialData: litter,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
    },
  );

  const { mutate: mutateAddWeek, isLoading: isLoadingAddWeek } =
    api.litter.addWeek.useMutation({
      onSuccess: () => {
        toast({
          variant: "default",
          title: "Success",
          color: "green",
          description: "Week added successfully.",
        });
        setIsAddWeeksOpen(false);
        void refetchGetLitter();
      },
      onError: (error) => {
        if (error.shape?.data.code === "CONFLICT") {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Week already exists.",
          });
          return;
        }
        toast({
          variant: "destructive",
          title: "Error",
          description:
            "Something went wrong while adding week. Please try again",
        });
        void refetchGetLitter();
      },
    });

  const { mutate: mutateDeleteWeek, isLoading: isLoadingDeleteWeek } =
    api.litter.deleteWeek.useMutation({
      onSuccess: () => {
        toast({
          variant: "default",
          title: "Success",
          color: "green",
          description: "Week deleted successfully.",
        });
        setIsAddWeeksOpen(false);
        void refetchGetLitter();
      },
      onError: () => {
        toast({
          variant: "destructive",
          title: "Error",
          description:
            "Something went wrong while adding week. Please try again",
        });
        void refetchGetLitter();
      },
    });
  const { mutate: mutateAddKittenImages, isLoading: isLoadingAddKittenImages } =
    api.litter.addLitterImages.useMutation({
      onSuccess: () => {
        toast({
          variant: "default",
          title: "Success",
          color: "green",
          description: "Kitten images added successfully.",
        });
        void refetchGetLitter();
      },
      onError: () => {
        toast({
          variant: "destructive",
          title: "Error",
          description:
            "Something went wrong while adding images. Please try again",
        });
        void refetchGetLitter();
      },
    });

  const isWeeks = currentLitter.LitterPictureWeek.length > 0;

  function handleAddWeek() {
    setIsAddWeeksOpen(false);
    mutateAddWeek({
      litter_id: litter.id,
      name: `${weekNumber}`,
    });
  }

  const addPhotosText = currentWeekSelected
    ? isNaN(parseInt(currentWeekSelected.name))
      ? `Add photos to ${currentWeekSelected.name}`
      : `Add photos to week ${parseInt(currentWeekSelected.name)}`
    : "";

  async function handleUpload() {
    if (!filesToUpload)
      return toast({
        variant: "destructive",
        title: "Error",
        description: "Please select images to upload.",
      });
    if (!kittenSelectValue) {
      return toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a kitten name.",
      });
    }
    if (!currentWeekSelected) {
      return toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a week.",
      });
    }
    setIsUploading(true);
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
      console.log(imgs);
      mutateAddKittenImages({
        imageUrls: imgs,
        title: kittenSelectValue,
        litter_picture_week: currentWeekSelected?.id,
      });
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

  return (
    <AdminLayout>
      <div className="flex flex-col gap-8">
        <div className="flex max-w-6xl flex-col gap-4 rounded-xl border-2 p-4 text-center">
          <h1 className="text-xl text-gray-800">
            Litter photos for {currentLitter.name}
          </h1>
          <div className="flex justify-center gap-2">
            <Dialog open={isAddPhotosOpen} onOpenChange={setIsAddPhotosOpen}>
              <DialogTrigger
                asChild
                onClick={() => {
                  setSelectedImages([]);
                  setSize(undefined);
                  setFilesToUpload(null);
                  setKittenSelectValue("");
                }}
              >
                <Button
                  disabled={currentWeekSelected === null}
                  className="w-fit"
                >
                  <ImagePlus className="mr-2 h-5 w-5" /> Add more photos
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Add photos</DialogTitle>
                  <DialogDescription>{addPhotosText}</DialogDescription>
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
                <div className="flex items-center space-x-2">
                  <div className="grid flex-1 gap-4">
                    <Label htmlFor="link" className="sr-only">
                      Link
                    </Label>
                    <Label>Kitten</Label>
                    <Select onValueChange={setKittenSelectValue}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select a kitten name" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {currentLitter.Kitten.map((kitten) => (
                            <SelectItem key={kitten.id} value={kitten.name}>
                              {kitten.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
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
            <Dialog open={isAddWeeksOpen} onOpenChange={setIsAddWeeksOpen}>
              <DialogTrigger asChild>
                <Button
                  className="w-fit"
                  disabled={isLoadingAddWeek}
                  onClick={() => {
                    let weekNumber = 0;
                    if (currentLitter.LitterPictureWeek.length > 0) {
                      const lastWeekName =
                        currentLitter.LitterPictureWeek.at(-1)?.name || "0";
                      const numberMatch = lastWeekName.match(/\d+/);
                      if (numberMatch) {
                        weekNumber = parseInt(numberMatch[0]) + 1;
                      } else {
                        if (lastWeekName === "Newborn") {
                          weekNumber = 1;
                        } else {
                          weekNumber =
                            currentLitter.LitterPictureWeek.length + 1;
                        }
                      }
                    }
                    setWeekNumber(weekNumber);
                  }}
                >
                  {isLoadingAddWeek && (
                    <LoadingSpinner className="mr-2 h-4 w-4" />
                  )}
                  {!isLoadingAddWeek && (
                    <CalendarPlus className="mr-2 h-5 w-5" />
                  )}
                  Add week
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Add week</DialogTitle>
                  <DialogDescription>
                    Add a new week to the litter.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex items-center space-x-2">
                  <div className="grid flex-1 gap-4">
                    <Label htmlFor="link" className="sr-only">
                      Link
                    </Label>
                    <Label>Week Number</Label>
                    <Input
                      type="number"
                      min={0}
                      max={20}
                      value={weekNumber}
                      className="w-fit"
                      onChange={(e) => setWeekNumber(+e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter className="sm:justify-start">
                  <DialogClose asChild disabled={isLoadingAddWeek}>
                    <Button
                      type="button"
                      variant="secondary"
                      disabled={isLoadingAddWeek}
                    >
                      Close
                    </Button>
                  </DialogClose>
                  <Button
                    onClick={handleAddWeek}
                    type="submit"
                    variant="secondary"
                    disabled={isLoadingAddWeek}
                  >
                    {isLoadingAddWeek && (
                      <LoadingSpinner className="mr-2 h-4 w-4" />
                    )}
                    {!isLoadingAddWeek && (
                      <CalendarPlus size={16} className="mr-2" />
                    )}
                    Add week
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button
              className={cn(isFetchingGetLitter && "bg-gray-700")}
              onClick={() => refetchGetLitter()}
              disabled={isFetchingGetLitter}
            >
              <RotateCcw
                className={cn("h-5 w-5", isFetchingGetLitter && "animate-spin")}
              />
            </Button>
          </div>
          {isWeeks ? (
            <Tabs defaultValue={currentLitter.LitterPictureWeek.at(-1)?.name}>
              <TabsList className="mx-auto flex h-fit w-fit flex-wrap border">
                {currentLitter.LitterPictureWeek.map((week) => (
                  <TabsTrigger
                    className="px-4 py-2 text-base"
                    key={week.id}
                    value={week.name}
                    onClick={() => {
                      setCurrentWeekSelected(week);
                      setKittenImages(week.KittenPictureImage);
                    }}
                  >{`${week.name.replace("-", " ")}`}</TabsTrigger>
                ))}
              </TabsList>
              {currentLitter.LitterPictureWeek.map((week) => (
                <TabsContent
                  key={week.id}
                  value={week.name}
                  className="relative"
                >
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        className="absolute right-4 top-4"
                        disabled={isLoadingDeleteWeek}
                      >
                        {isLoadingDeleteWeek && (
                          <LoadingSpinner className="mr-2 h-4 w-4" />
                        )}
                        {!isLoadingDeleteWeek && (
                          <Delete className="mr-2 h-5 w-5" />
                        )}
                        Delete week
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently
                          delete this week and remove all the photos associated
                          with it.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-red-500 hover:bg-red-600"
                          onClick={() =>
                            mutateDeleteWeek({
                              litter_id: week.litter_id,
                              week_id: week.id,
                            })
                          }
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  <Card>
                    <CardHeader>
                      <CardTitle>{week.name.replace("-", " ")}</CardTitle>
                      <CardDescription>
                        {week.KittenPictureImage.length} total images
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="min-h-[15rem] space-y-2">
                      <section className="">
                        {Object.entries(groupedImages).map(([key, images]) => (
                          <div key={key}>
                            {key !== "" && <BorderText text={key} />}
                            <div className="grid grid-cols-4 justify-items-center gap-4">
                              {images.map((image) => (
                                <picture
                                  key={image.id}
                                  className="h-48 w-48 overflow-hidden rounded"
                                >
                                  <Image
                                    src={image.src}
                                    alt={image.title ?? "Photo of kitten"}
                                    width={image.width}
                                    height={image.height}
                                    placeholder="blur"
                                    blurDataURL={image.blururl}
                                    className="h-full w-full object-cover"
                                  />
                                </picture>
                              ))}
                            </div>
                          </div>
                        ))}
                      </section>
                    </CardContent>
                  </Card>
                </TabsContent>
              ))}
            </Tabs>
          ) : (
            <p className="text-xl text-gray-700">
              No weeks added yet. Please add a week to start uploading images.
            </p>
          )}
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
      Kitten: true,
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
