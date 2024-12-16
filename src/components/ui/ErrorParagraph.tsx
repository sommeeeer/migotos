export default function ErrorParagraph({ message }: { message: string }) {
  return (
    <p className="text-sm text-[#bf1650] before:content-['⚠_']">{message}</p>
  );
}
