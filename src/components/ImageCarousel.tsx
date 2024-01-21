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

interface Props {
  name: string;
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
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  console.log(current, count);

  useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  useEffect(() => {
    noScroll.on();
    if (!api) return;
    api.scrollTo(imageIndex, true);
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      } else if (event.key === "ArrowLeft") {
        api.scrollPrev();
      } else if (event.key === "ArrowRight") {
        api.scrollNext();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      noScroll.off();
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [api, setOpen]);

  const MotionImage = motion(Image);

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
        <div
          className="absolute inset-0 cursor-default bg-black backdrop-blur-2xl"
          onClick={() => {
            setOpen(false);
          }}
        ></div>
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
                src={image.src}
                alt={`Profile image of ${name}`}
                width={image.width}
                height={image.height}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="duration-400 left-2 z-[60] p-2 opacity-0 transition-all hover:inline-flex hover:opacity-60 disabled:hidden" />
        <CarouselNext className="duration-400 right-2 z-[60] p-2 opacity-0 transition-all hover:opacity-60 disabled:hidden sm:right-6 sm:opacity-60 md:right-10 lg:right-12 xl:right-16" />
      </motion.div>
    </Carousel>
  );
}
