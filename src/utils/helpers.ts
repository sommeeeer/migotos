import { parseISO, format } from "date-fns";
import crypto from "crypto";
import type { ChangeEvent, Dispatch, SetStateAction } from "react";

export function formatDate(inputDate: string) {
  const date = parseISO(inputDate);
  const day = format(date, "do");
  const monthYear = format(date, "MMMM yyyy");
  const formattedDay = day;
  return `born ${formattedDay} of ${monthYear}`;
}

export function findName(name: string) {
  return name
    .replaceAll(",", "")
    .split(" ")
    .filter((w) => {
      if (w.length > 3 && /^[a-zA-Z]+$/.test(w)) {
        return w;
      }
    });
}

export function isEmptyObject(obj: object) {
  return Object.keys(obj).length === 0;
}

export async function uploadS3(file: File, uploadUrl: string) {
  try {
    const image = await fetch(uploadUrl, {
      body: file,
      method: "PUT",
      headers: {
        "Content-Type": file.type,
        "Content-Disposition": `attachment; filename="${file.name}"`,
      },
    });
    return image.url
      .split("?")[0]
      ?.replace(
        "https://s3.eu-north-1.amazonaws.com/images.migotos.com/",
        "https://cdn.migotos.com/",
      );
  } catch (error) {
    throw new Error("Error uploading image");
  }
}

export function bytesToMB(bytes: number) {
  return (bytes / (1024 * 1024)).toFixed(2);
}

export function createGravatarURL(
  email: string | undefined,
  size = 32,
): string {
  if (!email) {
    return `https://www.gravatar.com/avatar/?d=mp&size=${size}`;
  }
  const hash = crypto
    .createHash("md5")
    .update(email.trim().toLowerCase())
    .digest("hex");
  return `https://www.gravatar.com/avatar/${hash}?d=identicon&size=${size}`;
}

export function capitalizeString(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function handleImageChange(
  files: File[],
  setFilesToUpload: Dispatch<SetStateAction<File[] | undefined>>,
  setSelectedImages: Dispatch<SetStateAction<string[]>>,
  setSize: Dispatch<SetStateAction<number | undefined>>,
) {
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
