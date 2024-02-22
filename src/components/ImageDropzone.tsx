import { on } from "events";
import Dropzone from "react-dropzone";
import { Input } from "~/components/ui/input";
import { toast } from "./ui/use-toast";
import { cn } from "~/lib/utils";

interface ImageDropzoneProps {
  onDrop: (acceptedFiles: File[]) => void;
}

export default function ImageDropzone({ onDrop }: ImageDropzoneProps) {
  return (
    <Dropzone
      onDropAccepted={onDrop}
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
            "mt-2 flex h-32 flex-col items-center justify-center rounded-lg border border-dashed border-gray-900/25 text-center transition",
            isDragActive && "bg-gray-100/40",
          )}
        >
          <Input
            {...getInputProps()}
            type="file"
            multiple
            className="cursor-pointer"
            accept="image/png, image/jpeg, image/jpg, image/webp"
          />
          {isDragActive ? (
            <p>Drop the files here ...</p>
          ) : (
            <p className="text-blue-700">
              Drag n drop some images here, or click to select files
              <span className="mt-2 block text-xs text-blue-600">
                Only .png, .jpg, .jpeg and .webp allowed
              </span>
            </p>
          )}
        </div>
      )}
    </Dropzone>
  );
}
