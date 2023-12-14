import { type Dispatch, type SetStateAction } from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

interface ImageUploaderProps {
  setValue: Dispatch<SetStateAction<File | undefined>>;
  isLoading: boolean;
  isUploading: boolean;
  label: string;
}

export default function ImageUploader({
  setValue,
  isLoading,
  label,
  isUploading,
}: ImageUploaderProps) {
  return (
    <div className="flex flex-col gap-2">
      <Label>{label}</Label>
      <Input
        type="file"
        className="cursor-pointer"
        disabled={isUploading || isLoading}
        onChange={(e) => {
          if (!e.target.files) return;
          setValue(e.target.files[0]);
        }}
        accept="image/png, image/jpeg, image/jpg"
      />
    </div>
  );
}
