import Image from "next/image";
import { type ImageProps } from "next/image";

interface CatImageType extends ImageProps {
  src: string;
}

export default function CatImage(props: CatImageType) {
  return (
    <Image {...props} src={`${props.src}`} alt={props.alt} />
  );
}
