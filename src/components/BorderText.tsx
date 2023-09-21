interface BorderTextProps {
  text: string;
}

export default function BorderText({ text }: BorderTextProps) {
  return (
    <div className="relative flex items-center py-5">
      <div className="flex-grow border-t border-zinc-300"></div>
      <span className="mx-4 flex-shrink font-playfair font-light text-xl">{text}</span>
      <div className="flex-grow border-t border-zinc-300"></div>
    </div>
  );
}
