/* eslint-disable react/no-unescaped-entities */
import Link from 'next/link';
import ExternalLink from '~/components/ExternalLink';
import YoutubeEmbed from '~/components/YoutubeEmbed';

export default function KenTvAppearance() {
  return (
    <>
      <div className="max-w-2xl whitespace-break-spaces py-2 text-base leading-loose">
        Today our own darling boy{' '}
        <Link className="underline font-semibold" href="/cats/kennern-page">
          (N) Migoto's Ken NFO n 03 22
        </Link>{' '}
        was on national television together with our breeder Eva Dahl Eide. It
        all took place on TV2 at a program called "God Morgen Norge" (Good
        morning Norway).
      </div>
      <YoutubeEmbed url="https://www.youtube.com/embed/ZnJW5cU7Aww?si=KWTx3dYD80eylW0b" />
      <div className="max-w-2xl whitespace-break-spaces py-2 text-base leading-loose">
        As you all may know he is starring in a Shakespeare play at{' '}
        <span className="font-semibold">"Det Norske Teatret"</span> called{' '}
        <ExternalLink href="https://www.detnorsketeatret.no/framsyningar/lady-macbeth">
          Lady Macbeth
        </ExternalLink>
        . You can read more about this{' '}
        <ExternalLink href="https://www.detnorsketeatret.no/bakgrunnsartiklar/skogkatten-ken">
          here
        </ExternalLink>
        . <br /> <br />
        We are so proud of him!
      </div>
    </>
  );
}
