import { useState } from "react";
import { toast } from "~/components/ui/use-toast";
import { uploadS3 } from "~/utils/helpers";

export function useUploadImages() {
  const [isUploading, setIsUploading] = useState(false);

  async function uploadImages(
    filesToUpload: FileList | File[],
    onUpload?: (index: number) => void,
  ): Promise<string[] | undefined> {
    if (!filesToUpload) {
      toast({
        variant: "destructive",
        description: "Please select images to upload.",
        title: "Error",
      });
      return;
    }

    setIsUploading(true);
    try {
      const imgs = [];
      const filenames = Array.from(filesToUpload).map((file) => file.name);
      const res = await fetch(`/api/getSignedURLS`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          filenames,
        }),
      });
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
        if (onUpload) {
          onUpload(i + 1);
        }
      }
      return imgs;
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

  return { isUploading, uploadImages };
}
