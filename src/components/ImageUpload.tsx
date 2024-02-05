import { Loader2, X } from "lucide-react";
import Image from "next/image";
import { Input } from "./ui/input";
import { useUploadImages } from "~/hooks/use-upload-images";
import { cn } from "~/lib/utils";
import { api } from "~/utils/api";

interface FileUploadProps {
  onChange: (url?: string) => void;
  value: string;
  postImage?: boolean;
}

export function ImageUpload({ onChange, value, postImage }: FileUploadProps) {
  const { isUploading, uploadImages } = useUploadImages();

  const { mutate: deleteImage, isLoading: isDeleteImageLoading } =
    api.image.deleteImage.useMutation({
      onSuccess: () => {
        onChange(undefined);
      },
      onError: () => {
        console.error("error deleting image");
      },
    });

  if (value) {
    return (
      <div
        className={cn(
          "relative h-[200px] w-[200px] rounded-full",
          postImage && "h-[200px] w-[338px] rounded-none",
        )}
        title={value}
      >
        <Image
          fill
          src={value}
          alt="Upload"
          className={cn(
            "rounded-full",
            postImage && "rounded-none object-cover",
          )}
        />
        <button
          onClick={() =>
            deleteImage({
              url: value,
            })
          }
          disabled={isDeleteImageLoading}
          className={cn(
            "absolute right-4 top-1 rounded-full bg-red-500 p-1 text-gray-600 shadow-sm transition duration-200 hover:scale-110 hover:bg-red-600",
            postImage && "-right-4 -top-6",
          )}
          type="button"
        >
          {!isDeleteImageLoading && <X className="h-4 w-4" />}
          {isDeleteImageLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        </button>
      </div>
    );
  }

  if (isUploading) {
    return <Loader2 className="h-8 w-8 animate-spin" />;
  }

  return (
    <Input
      type="file"
      className="cursor-pointer"
      disabled={isUploading}
      onChange={async (e) => {
        if (!e.target.files) return;
        const imgurl = await uploadImages(e.target.files);

        onChange(imgurl?.[0] || undefined);
      }}
      accept="image/png, image/jpeg, image/jpg, image/webp"
    />
  );
}
