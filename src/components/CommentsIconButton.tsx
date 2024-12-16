import { FaRegComments } from 'react-icons/fa';
import { cn } from '~/lib/utils';

interface Props {
  commentsRef: React.RefObject<HTMLElement>;
  className?: string;
  commentsLength?: number;
}

export default function CommentsIconButton({
  commentsRef,
  className,
  commentsLength,
}: Props) {
  return (
    <button
      title="Go to comments"
      onClick={() => {
        commentsRef?.current?.scrollIntoView({ behavior: 'smooth' });
      }}
      className={
        'flex items-center gap-0.5 rounded-full p-1 text-center text-sm font-medium text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-4 focus:ring-gray-300'
      }
    >
      <FaRegComments className={cn('h-7 w-7', className)} />
      {commentsLength && <span>{commentsLength}</span>}
    </button>
  );
}
