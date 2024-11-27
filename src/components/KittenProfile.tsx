import Image from "next/image";
import femaleImg from "/public/static/female-50x50.png";
import maleImg from "/public/static/male-50x50.png";
import { KittenOrderStatus } from "@prisma/client";

export interface KittenProfileProps {
  name: string;
  info: string;
  stamnavn: string;
  gender: string;
  orderStatus: KittenOrderStatus | null;
}

export default function KittenProfile({
  name,
  info,
  stamnavn,
  gender,
  orderStatus,
}: KittenProfileProps) {
  return (
    <div className="mb-4 flex flex-col items-center gap-4 font-playfair">
      {gender === "female" ? (
        <Image
          src={femaleImg}
          alt={`${name}'s picture`}
          quality={100}
          width={50}
          height={50}
        />
      ) : (
        <Image
          src={maleImg}
          alt={`${name}'s picture`}
          quality={100}
          width={50}
          height={50}
        />
      )}
      <h3 className="text-2xl">
        <em>{name}</em>
      </h3>
      <p className="text-center text-sm">
        {stamnavn.toUpperCase()}
        <br />
        {!info.toLowerCase().includes("week") && info}
        {info && <br />}
        {orderStatus && orderStatus !== KittenOrderStatus.HIDDEN && (
          <span className="italic">{orderStatus}</span>
        )}
      </p>
    </div>
  );
}
