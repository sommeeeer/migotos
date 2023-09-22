import { Cat, Prisma, type CatImage } from "@prisma/client";
import { getPlaiceholder } from "plaiceholder";
import { CatWithImage } from "~/pages/cats";

export type CatImageWithBlur = CatImage & { blur: string };

async function getBase64(imageUrl: string) {
  try {
    const res = await fetch(imageUrl);

    if (!res.ok) {
      throw new Error(`Failed to fetch image: ${res.status} ${res.statusText}`);
    }

    const buffer = await res.arrayBuffer();

    const { base64 } = await getPlaiceholder(Buffer.from(buffer));

    return base64;
  } catch (e) {
    if (e instanceof Error) console.log(e.stack);
  }
}

export default async function addBlurredDataurls(
  images: CatImage[],
): Promise<CatImageWithBlur[]> {
  const base64Promises = images.map((image) => getBase64(image.src));

  const base64Results = await Promise.all(base64Promises);

  const photosWithBlur: CatImageWithBlur[] = images.map((photo, i) => ({
    ...photo,
    blur: base64Results[i]!,
  }));

  return photosWithBlur;
}

export async function addBlurToCats(cats: CatWithImage[]) {
  const catsWithBlur = await Promise.all(
    cats.map(async (cat) => {
      const blurData = await addBlurredDataurls(cat.CatImage);
      return {
        ...cat,
        CatImage: blurData,
      };
    }),
  );
  return catsWithBlur;
}
