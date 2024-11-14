import Dropzone from "react-dropzone";
import { IoCloudUploadOutline } from "react-icons/io5";

import { Input } from "~/components/ui/input";
import { toast } from "./ui/use-toast";
import { cn } from "~/lib/utils";

interface ImageDropzoneProps {
  onDrop: (acceptedFiles: File[]) => void;
  isLoading?: boolean;
}

export default function ImageDropzone({
  onDrop,
  isLoading,
}: ImageDropzoneProps) {
  return (
    <Dropzone
      onDropAccepted={onDrop}
      disabled={isLoading}
      accept={{
        "image/png": [".png"],
        "image/jpeg": [".jpeg", ".jpg"],
        "image/webp": [".webp"],
      }}
      onDropRejected={() => {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Only images are allowed. .png, .jpg, .jpeg and .webp",
        });
      }}
    >
      {({ getRootProps, getInputProps, isDragActive }) => (
        <div
          {...getRootProps()}
          className={cn(
            "mt-2 flex h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-900/25 text-center transition",
            isDragActive && "border-4 bg-gray-100/40",
            isLoading && "bg-gray-100 animate-pulse",
          )}
        >
          <IoCloudUploadOutline className="h-6 w-6 text-blue-700" />

          <Input
            {...getInputProps()}
            type="file"
            multiple
            accept="image/png, image/jpeg, image/jpg, image/webp"
          />
          {isDragActive ? (
            <p>Drop the files here ...</p>
          ) : (
            <p className="text-blue-800">
              Drag n drop some images here, or click to select files
              <span className="mt-2 block text-xs text-gray-500">
                (Only .png, .jpg, .jpeg and .webp allowed)
              </span>
            </p>
          )}
        </div>
      )}
    </Dropzone>
  );
}
