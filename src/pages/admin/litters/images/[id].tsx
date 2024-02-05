import type {
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
import { useMemo, useState } from "react";
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
  HardDriveIcon,
  ImagePlus,
  RotateCcw,
  Trash2,
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
import { bytesToMB, handleImageChange } from "~/utils/helpers";
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
import { AnimatePresence, motion } from "framer-motion";
import { useUploadImages } from "~/hooks/use-upload-images";
import { Progress } from "~/components/ui/progress";
import { IoMdFemale, IoMdMale } from "react-icons/io";

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
    litter.LitterPictureWeek.at(-1)?.KittenPictureImage ?? [],
  );
  const [currentLitter, setCurrentLitter] = useState<LitterWithImages>(litter);
  const [tab, setTab] = useState(currentLitter.LitterPictureWeek.at(-1)?.name);
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
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [filesToUpload, setFilesToUpload] = useState<FileList | null>();
  const [kittenSelectValue, setKittenSelectValue] = useState<string>("");
  const [weekTitle, setWeekTitle] = useState<string>(
    currentWeekSelected?.title ?? "",
  );
  const [progressValue, setProgressValue] = useState(0);

  const { isUploading, uploadImages } = useUploadImages();

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

  const { isFetching: isFetchingGetLitter, refetch: refetchGetLitter } =
    api.litter.getLitter.useQuery(
      {
        id: litter.id,
      },
      {
        onSuccess: (litter) => {
          if (!litter) {
            return;
          }
          setCurrentLitter(litter);
          setKittenImages(
            litter.LitterPictureWeek.find(
              (week) => week.id === currentWeekSelected?.id,
            )?.KittenPictureImage ?? [],
          );
          if (currentWeekSelected) {
            if (
              !litter.LitterPictureWeek.find(
                (week) => week.name === currentWeekSelected?.name,
              )
            ) {
              setCurrentWeekSelected(litter.LitterPictureWeek.at(-1) ?? null);
              setTab(litter.LitterPictureWeek.at(-1)?.name ?? "");
              setKittenImages(
                litter.LitterPictureWeek.at(-1)?.KittenPictureImage ?? [],
              );
              setWeekTitle(litter.LitterPictureWeek.at(-1)?.title ?? "");
            } else {
              setWeekTitle(
                litter.LitterPictureWeek.find(
                  (week) => week.name === currentWeekSelected?.name,
                )?.title ?? "",
              );
            }
          }
        },
        initialData: litter,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
      },
    );

  const { mutate: mutateSetWeekTitle, isLoading: isLoadingSetWeekTitle } =
    api.litter.setWeekTitle.useMutation({
      onSuccess: () => {
        toast({
          variant: "default",
          title: "Success",
          color: "green",
          description: "Week title updated successfully.",
        });
        void refetchGetLitter();
      },
      onError: () => {
        toast({
          variant: "destructive",
          title: "Error",
          description:
            "Something went wrong while updating week title. Please try again",
        });
        void refetchGetLitter();
      },
    });

  const { mutate: mutateAddWeek, isLoading: isLoadingAddWeek } =
    api.litter.addWeek.useMutation({
      onSuccess: (newWeek) => {
        toast({
          variant: "default",
          title: "Success",
          color: "green",
          description: "Week added successfully.",
        });
        setIsAddWeeksOpen(false);
        void refetchGetLitter();
        setTab(newWeek.name);
        setCurrentWeekSelected(newWeek);
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
      onSettled: () => {
        setIsAddPhotosOpen(false);
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
    const imageUrls = await uploadImages(filesToUpload, (i) => {
      const progress = (i / filesToUpload.length) * 100;
      setProgressValue(progress);
      if (progress === 100) {
        setIsAddPhotosOpen(false);
        setProgressValue(0);
      }
    });
    if (imageUrls) {
      mutateAddKittenImages({
        imageUrls: imageUrls,
        title: kittenSelectValue,
        litter_picture_week: currentWeekSelected?.id,
      });
    }
  }

  function handleSetWeekTitle() {
    if (!currentWeekSelected) {
      return toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a week.",
      });
    }

    if (!weekTitle) {
      return toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a title.",
      });
    }
    if (weekTitle === currentWeekSelected.title) {
      return toast({
        variant: "default",
        title: "Info",
        description: "Title is the same as before.",
      });
    }
    mutateSetWeekTitle({
      litter_id: currentLitter.id,
      week_id: currentWeekSelected?.id,
      title: weekTitle,
    });
  }

  function onTabChange(value: string) {
    setTab(value);
    setCurrentWeekSelected(
      currentLitter.LitterPictureWeek.find((week) => week.name === value) ??
        null,
    );
    setKittenImages(
      currentLitter.LitterPictureWeek.find((week) => week.name === value)
        ?.KittenPictureImage ?? [],
    );
    setWeekTitle(
      currentLitter.LitterPictureWeek.find((week) => week.name === value)
        ?.title ?? "",
    );
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
                  disabled={
                    !currentWeekSelected ||
                    isLoadingAddKittenImages ||
                    isLoadingAddWeek ||
                    isLoadingDeleteWeek
                  }
                  className="w-fit"
                >
                  {isLoadingAddKittenImages && (
                    <LoadingSpinner className="mr-2 h-4 w-4" />
                  )}
                  {!isLoadingAddKittenImages && (
                    <ImagePlus className="mr-2 h-5 w-5" />
                  )}
                  Add more photos
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
                      onChange={(e) =>
                        handleImageChange(
                          e,
                          setFilesToUpload,
                          setSelectedImages,
                          setSize,
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
                              <div className="flex items-center gap-2">
                                {kitten.gender === "female" ? (
                                  <IoMdFemale className="h-4 w-4 fill-pink-500" />
                                ) : (
                                  <IoMdMale className="h-4 w-4 fill-blue-500" />
                                )}
                                {kitten.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
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
            <Dialog open={isAddWeeksOpen} onOpenChange={setIsAddWeeksOpen}>
              <DialogTrigger asChild>
                <Button
                  className="w-fit"
                  disabled={
                    isLoadingAddWeek ||
                    isLoadingAddKittenImages ||
                    isLoadingDeleteWeek
                  }
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
                  <DialogDescription>0 will be Newborn</DialogDescription>
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
            <Tabs value={tab} onValueChange={onTabChange}>
              <TabsList className="mx-auto flex h-fit w-fit flex-wrap border">
                {currentLitter.LitterPictureWeek.sort((a, b) => {
                  if (a.name === "Newborn") return -1;
                  if (b.name === "Newborn") return 1;
                  return parseInt(a.name) - parseInt(b.name);
                }).map((week) => (
                  <TabsTrigger
                    className="px-4 py-2 text-base"
                    key={week.id}
                    value={week.name}
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
                        variant="destructive"
                        className="absolute right-4 top-4 flex items-center"
                        disabled={
                          isLoadingDeleteWeek ||
                          isLoadingAddWeek ||
                          isLoadingAddKittenImages ||
                          isLoadingSetWeekTitle
                        }
                      >
                        {isLoadingDeleteWeek && (
                          <LoadingSpinner className="mr-2 h-4 w-4" />
                        )}
                        {!isLoadingDeleteWeek && (
                          <Trash2 className="mr-2 h-5 w-5" />
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
                  <div className="absolute left-4 top-4 flex w-60 flex-col items-start gap-2">
                    <div className="flex gap-1">
                      <Input
                        className="flex-1"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleSetWeekTitle();
                          }
                        }}
                        placeholder="Enter title..."
                        value={weekTitle}
                        onChange={(e) => setWeekTitle(e.target.value)}
                      />
                      <Button variant="outline" onClick={handleSetWeekTitle}>
                        {isLoadingSetWeekTitle && (
                          <LoadingSpinner className="mr-2 h-4 w-4" />
                        )}
                        {!isLoadingSetWeekTitle && (
                          <HardDriveIcon className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <Card>
                    <CardHeader>
                      <CardTitle>{week.name.replace("-", " ")}</CardTitle>
                      <CardDescription>
                        {week.KittenPictureImage.length} total images
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="min-h-[15rem] space-y-2">
                      <section>
                        {Object.entries(groupedImages).map(([key, images]) => (
                          <div key={key}>
                            {key !== "" && <BorderText text={key} />}
                            <ul className="mb-6 grid grid-cols-responsive justify-items-center gap-2 gap-y-4">
                              <AnimatePresence>
                                {images.map((image) => (
                                  <KittenImage
                                    key={image.id}
                                    image={image}
                                    refetchImages={refetchGetLitter}
                                  />
                                ))}
                              </AnimatePresence>
                            </ul>
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

function KittenImage({
  image,
  refetchImages,
}: {
  image: KittenPictureImage;
  refetchImages: () => void;
}) {
  const { mutate: mutateDeleteImage } =
    api.litter.deleteKittenImage.useMutation({
      onSuccess: () => {
        toast({
          variant: "default",
          title: "Success",
          color: "green",
          description: "Image deleted successfully.",
        });
        refetchImages();
      },
      onError: () => {
        toast({
          variant: "destructive",
          title: "Error",
          description:
            "Something went wrong while deleting image. Please try again",
        });
      },
    });
  return (
    <motion.li
      key={image.id}
      initial={{ opacity: 0 }}
      animate={{
        opacity: 1,
        transition: { duration: 0.4 },
      }}
      exit={{
        opacity: 0,
        transition: { duration: 0.4 },
      }}
      className="relative flex h-[150px] w-[220px] rounded border-2 border-slate-500"
    >
      <picture className="relative h-full w-full">
        <Image
          src={image.src}
          alt={image.title ?? "Photo of kitten"}
          placeholder="blur"
          blurDataURL={image.blururl}
          fill
          className="absolute cover"
        />
      </picture>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <button className="absolute right-0 z-20 p-1">
            <Trash2 className="h-6 w-6 fill-red-500 stroke-gray-100 transition-colors duration-200 hover:fill-red-700 hover:stroke-gray-200" />
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
              onClick={() => mutateDeleteImage({ image_id: image.id })}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.li>
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
