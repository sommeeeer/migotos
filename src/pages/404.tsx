import { ArrowBigLeftIcon, Home, MessageCircleIcon } from 'lucide-react';
import { useRouter } from 'next/router';
import { Button } from '~/components/ui/button';

export default function Custom404() {
  const router = useRouter();
  return (
    <div className="mt-16 flex flex-col items-center gap-4">
      <div className="text-center">
        <h1 className="bold text-7xl text-gray-800">404</h1>
        <h3 className="bold text-5xl text-gray-800">Page Not Found</h3>
        <p className="mt-6 text-base leading-7 text-gray-600">
          Sorry, we couldn’t find the page you’re looking for.
        </p>
      </div>
      <div className="flex gap-2">
        <Button
          className="mt-4"
          variant="outline"
          onClick={() => router.push('/')}
        >
          <Home className="mr-2" />
          Go Home
        </Button>
        <Button
          className="mt-4"
          variant="outline"
          onClick={() => router.back()}
        >
          <ArrowBigLeftIcon className="mr-2" />
          Go back
        </Button>
      </div>
      <Button
        size="sm"
        variant="outline"
        onClick={() => router.push('/contact')}
      >
        <MessageCircleIcon className="mr-2" />
        Contact support
      </Button>
    </div>
  );
}
