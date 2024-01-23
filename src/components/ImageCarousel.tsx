import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
  CarouselNext,
  CarouselPrevious,
} from "~/components/ui/carousel";
import type { CatImage, KittenPictureImage } from "@prisma/client";
import { useState, useEffect, type Dispatch, type SetStateAction } from "react";
import { motion } from "framer-motion";
import noScroll from "no-scroll";
import { X } from "lucide-react";

interface Props {
  name?: string;
  images: CatImage[] | KittenPictureImage[];
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

  useEffect(() => {
    noScroll.on();
    if (!api) return;
    api.scrollTo(imageIndex, true);
    setTitle((images[imageIndex] as KittenPictureImage)?.title ?? name);
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

  const MotionImage = motion(Image);

  useEffect(() => {
    setTitle((images[current - 1] as KittenPictureImage)?.title ?? name);
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
        <div className="absolute inset-0 cursor-default bg-black backdrop-blur-2xl"></div>

        <button
          type="button"
          className="absolute right-2 top-2 z-50 me-2 inline-flex cursor-pointer items-center rounded-lg bg-black/40 p-2.5 text-gray-200 hover:scale-105 hover:bg-black/70 hover:text-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-300"
          onClick={() => setOpen(false)}
        >
          <X className="h-10 w-10" />
          <span className="sr-only">Close image carousel</span>
        </button>
        {images[imageIndex]?.src && (
          <a
            href={images[imageIndex]?.src}
            download
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
          {images.map((image) => (
            <CarouselItem
              className="flex items-center justify-center"
              key={image.id}
            >
              <MotionImage
                initial={{ opacity: 0 }}
                animate={{
                  opacity: 1,
                  transition: { duration: 0.3 },
                }}
                priority
                src={image.src}
                alt={`Profile image of ${name}`}
                width={image.width}
                height={image.height}
                quality={100}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="duration-400 left-2 z-[60] p-2 opacity-0 transition-all hover:opacity-60 disabled:hidden sm:left-6 sm:opacity-60 md:left-10 lg:left-12 xl:left-16" />
        <CarouselNext className="duration-400 right-2 z-[60] p-2 opacity-0 transition-all hover:opacity-60 disabled:hidden sm:right-6 sm:opacity-60 md:right-10 lg:right-12 xl:right-16" />
        <p className="absolute bottom-3 left-3 p-1 tracking-wide text-white">{`${current}/${images.length}`}</p>
        <p className="absolute bottom-3 right-3 p-1 tracking-wide text-white">
          {title}
        </p>
      </motion.div>
    </Carousel>
  );
}
