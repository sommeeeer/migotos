export default function YoutubeEmbed({ url }: { url: string }) {
  return (
    <div className="relative w-full pt-[56.25%]">
      <iframe
        className="absolute inset-0 h-full w-full rounded-sm"
        src={url}
        title="YouTube video player"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      />
    </div>
  );
}
