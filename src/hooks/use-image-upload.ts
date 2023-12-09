import { useState } from "react";
import { uploadS3 } from "../utils/helpers";
import { toast } from "~/components/ui/use-toast";

export function useImageUpload(uploadUrl: string) {
  const [file, setFile] = useState<File | undefined>(undefined);
  const [isUploading, setIsUploading] = useState(false);
  const [imageURL, setImageURL] = useState<string | undefined>(undefined);
  const [imageKey, setImageKey] = useState(0);

  async function handleUpload() {
    if (!file) {
      toast({
        variant: "destructive",
        title: "No image selected.",
        description: "Please select an image before uploading.",
      });
      return;
    }
    if (!uploadUrl) {
      toast({
        variant: "destructive",
        title: "No upload URL available from Amazon S3.",
        description: "Please try again later.",
      });
      return;
    }
    try {
      setIsUploading(true);
      const imageURL = await uploadS3(file, uploadUrl);
      if (!imageURL) throw new Error("No image URL returned from S3");
      toast({
        variant: "default",
        title: "Success",
        color: "green",
        description: "Image uploaded successfully.",
      });
      setImageURL(imageURL);
      setImageKey(imageKey + 1);
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Something went wrong during upload",
      });
    } finally {
      setIsUploading(false);
    }
  }
  return { handleUpload, isUploading, setFile, imageURL, imageKey };
}
