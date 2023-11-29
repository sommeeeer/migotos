import { ArrowBigLeftIcon } from "lucide-react";
import { useRouter } from "next/router";
import { Button } from "~/components/ui/button";

export default function Custom404() {
  const router = useRouter();
  return (
    <div className="mt-24 flex flex-col items-center gap-4">
      <div className="text-center">
        <h1 className="bold text-8xl text-gray-800">404</h1>
        <h3 className="bold text-6xl text-gray-800">Not Found</h3>
      </div>
      <Button variant="outline" onClick={() => router.back()}>
        <ArrowBigLeftIcon className="mr-2" />
        Go back
      </Button>
    </div>
  );
}
