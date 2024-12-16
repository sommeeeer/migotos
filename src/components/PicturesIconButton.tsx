import { cn } from '~/lib/utils';
import { PiImages } from 'react-icons/pi';

interface Props {
  picturesRef: React.RefObject<HTMLElement>;
  className?: string;
}

export default function PicturesIconButton({ picturesRef, className }: Props) {
  return (
    <button
      title="Go to pictures"
      onClick={() => {
        picturesRef?.current?.scrollIntoView({ behavior: 'smooth' });
      }}
      className={
        'flex items-center gap-0.5 rounded-full p-1 text-center text-sm font-medium text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-4 focus:ring-gray-300'
      }
    >
      <PiImages className={cn('h-7 w-7', className)} />
    </button>
  );
}
