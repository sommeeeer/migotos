import type {
  BlogPostImage,
  CatImage,
  KittenPictureImage,
} from "@prisma/client";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import Image from "next/image";
import noScroll from "no-scroll";
import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "~/components/ui/carousel";
import { cn, IMAGE_QUALITY } from "~/lib/utils";

interface Props {
  name?: string;
  images:
    | CatImage[]
    | KittenPictureImage[]
    | Pick<BlogPostImage, "id" | "src" | "height" | "width" | "blururl">[];
  setOpen: Dispatch<SetStateAction<boolean>>;
  imageIndex: number;
}

export default function ImageCarousel({
  images,
  name,
  setOpen,
  imageIndex,
}: Props) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(imageIndex + 1);
  const [title, setTitle] = useState<string | undefined>("");
  const [currentImageSrc, setCurrentImageSrc] = useState<string | undefined>();

  useEffect(() => {
    noScroll.on();
    if (!api) return;
    api.scrollTo(imageIndex, true);
    setTitle((images[imageIndex] as KittenPictureImage)?.title ?? name);
    setCurrentImageSrc(images[imageIndex]?.src);
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      } else if (event.key === "ArrowLeft") {
        api.scrollPrev();
      } else if (event.key === "ArrowRight") {
        api.scrollNext();
      }
    };

    api?.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      noScroll.off();
      window.removeEventListener("keydown", handleKeyDown);
      api?.destroy();
    };
  }, [api, setOpen, imageIndex, images, name]);

  useEffect(() => {
    setTitle((images[current - 1] as KittenPictureImage)?.title ?? name);
    setCurrentImageSrc(images[current - 1]?.src);
  }, [current, images, name]);

  return (
    <Carousel setApi={setApi}>
      <motion.div
        initial={{ opacity: 0, scale: 0.2 }}
        animate={{
          opacity: 1,
          scale: 1,
          transition: { duration: 0.3 },
        }}
        className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      >
        <div className="absolute inset-0 bg-black backdrop-blur-2xl"></div>

        <button
          type="button"
          className="absolute right-2 top-2 z-50 me-2 inline-flex cursor-pointer items-center rounded-lg bg-black/40 p-2.5 text-gray-200 hover:scale-105 hover:bg-black/70 hover:text-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-300"
          onClick={() => setOpen(false)}
        >
          <X className="h-10 w-10" />
          <span className="sr-only">Close image carousel</span>
        </button>
        {currentImageSrc && (
          <a
            href={currentImageSrc}
            download
            rel="noopener noreferrer"
            target="_blank"
            className="absolute left-2 top-2 z-50 me-2 inline-flex cursor-pointer items-center rounded-lg bg-black/40 p-2.5 text-gray-200 hover:scale-105 hover:bg-black/70 hover:text-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-300"
          >
            <svg
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              aria-hidden="true"
              className="h-10 w-10"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
              ></path>
            </svg>
            <span className="sr-only">Download image</span>
          </a>
        )}
        <CarouselContent>
          {images.map((image, index) => (
            <CarouselItem
              className="flex items-center justify-center pl-0"
              key={image.id}
            >
              <Image
                priority={imageIndex === index}
                src={image.src}
                alt={`Profile image of ${name}`}
                width={image.width}
                height={image.height}
                className="md:max-w-3xl lg:max-w-4xl xl:max-w-5xl"
                quality={IMAGE_QUALITY}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="duration-400 left-2 z-[60] p-2 opacity-0 transition-all hover:opacity-60 disabled:hidden sm:left-6 sm:opacity-60 md:left-10 lg:left-12 xl:left-16" />
        <CarouselNext className="duration-400 right-2 z-[60] p-2 opacity-0 transition-all hover:opacity-60 disabled:hidden sm:right-6 sm:opacity-60 md:right-10 lg:right-12 xl:right-16" />
        <p
          className={cn(
            "absolute bottom-3 left-3 p-1 tracking-wide text-white",
            title &&
              title.length > 20 &&
              "left-1/2 top-6 max-h-fit -translate-x-1/2 rounded-md bg-black/40  px-2 py-1",
          )}
        >{`${current}/${images.length}`}</p>
        <p
          className={cn(
            "absolute bottom-3 right-3 p-1 tracking-wide text-white",
            title &&
              title.length > 20 &&
              "left-2 mx-auto max-w-fit rounded-md bg-black/40 px-2 py-1 text-center text-xs min-[400px]:text-lg md:bottom-4",
          )}
        >
          {title}
        </p>
      </motion.div>
    </Carousel>
  );
}
