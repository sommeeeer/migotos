import crypto from "crypto";
import { Bucket } from "sst/node/bucket";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

export default function Home({ url }: { url: string }) {
  return (
    <main>
      <form
        onSubmit={(e) => {
          e.preventDefault();

          const target = e.target as typeof e.target & {
            file: { files: FileList };
          };
          const file = target.file.files[0];

          if (file) {
            console.log(file);
          } else {
            console.log("no file selected");
          }
        }}
      >
        <input name="file" type="file" accept="image/png, image/jpeg" />
        <button type="submit">Upload</button>
      </form>
    </main>
  );
}

export async function getServerSideProps() {
  const command = new PutObjectCommand({
    ACL: "public-read",
    Key: crypto.randomUUID(),
    Bucket: Bucket.public.bucketName,
  });
  const url = await getSignedUrl(new S3Client({}), command);

  return { props: { url } };
}
