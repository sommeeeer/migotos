import Head from "next/head";
import Image from "next/image";
import { BsInstagram, BsFacebook } from "react-icons/bs";
import Footer from "~/components/Footer";
import evaImgOne from "../../../public/static/eva-250x-250.jpg";
import evaImgTwo from "../../../public/static/IMG_7581-600x400.jpg";
import evaImgThree from "../../../public/static/IMG_6350-463x400.jpg";
import evaImgFour from "../../../public/static/IMG_7361-rotated-480x400.jpg";
import evaImgFive from "../../../public/static/IMG_7362-rotated-480x400.jpg";

export default function About() {
  return (
    <>
      <PageHead />
      <div className="flex w-full flex-col items-center bg-zinc-100">
        <section className="mt-8 flex max-w-3xl flex-col gap-14 px-6 pt-12 text-center">
          <header className="flex flex-col gap-4">
            <h1 className="font-playfair text-4xl font-normal">
              <em>Migoto’s&nbsp;</em>Norwegian Forest Cat
            </h1>
            <p className="text-lg text-zinc-500">
              CATTERY BASED IN OSLO, NORWAY
            </p>
          </header>
          <p className="text-left text-sm leading-8 text-zinc-800">
            (N)Migoto’s is a family driven cattery located in Oslo, Norway. The
            cattery was started in 2006 when our first Norwegian Forest Cat, SC
            (N) Lindbrekka’s Steffi from Vigdis and Lars Nordvik, arrived at our
            house. Over the years, the cattery has grown to become a very
            successful one.
          </p>
          <p className="text-left text-sm leading-8 text-zinc-800">
            Our kittens are well-known for their social and excellent temper
            making them perfect for both breeders, exhibitors and families
            looking for the perfect pet. Our kittens regularly meet children of
            different ages, as we always make sure that the kittens grow up with
            lots of humans and activity around them from day one.
          </p>
          <p className="text-left text-sm leading-8 text-zinc-800">
            It is important for us that all our cats are part of our family, and
            that they walk as freely as we do around the house. Therefore, we
            always make sure our cats have lots of space to move around and
            about on, both inside our house and outside in our secure cat-run.
          </p>
          <p className="text-left text-sm leading-8 text-zinc-800">
            Over the years, the cattery has grown a lot – but our philosophy has
            always been that there is a limit to how many cats a family can take
            care of at once. We are therefore very lucky and grateful to have
            many of our cats living as host cats in families nearby. They are a
            part of our cattery, as much as the cats living in our house, but is
            taken care of and lives with other families.
          </p>
          <div className="mb-12 flex items-center justify-center gap-4">
            <a
              href="https://www.facebook.com/eva.d.eide"
              rel="noopener noreferrer"
              target="_blank"
            >
              <BsFacebook className="h-10 w-10 text-zinc-700 hover:relative hover:bottom-[2px] hover:text-zinc-400" />
            </a>
            <a
              href="https://www.instagram.com/migotos/"
              rel="noopener noreferrer"
              target="_blank"
            >
              <BsInstagram className="h-10 w-10 text-zinc-700 hover:relative hover:bottom-[2px] hover:text-zinc-400" />
            </a>
          </div>
        </section>
      </div>
      <section className="flex w-full max-w-3xl flex-col items-center gap-12 bg-white p-20 px-8 text-center ">
        <header className="flex flex-col gap-4">
          <h1 className="font-playfair text-3xl">
            <em>Meet</em> Eva
          </h1>
          <p className="text-base text-zinc-500">THE MIGOTO’S BREEDER</p>
        </header>
        <Image
          className="my-4 rounded-full"
          src={evaImgOne}
          quality={100}
          alt={"Eva picture"}
          placeholder="blur"
        />
        <p className="mb-6 text-left text-sm leading-8 text-zinc-800">
          Eva Dahl Eide is the main person behind our (N)Migoto’s Cattery. She
          makes sure our cats stay healthy and happy, and always finds the
          perfect home for our kittens. Eva is the chair person in NORAK (Norway
          oldest and biggest cat club) and Norsk Skogkattring. She is also the
          receiver of Trulse-statuetten (2015). She is also honorable lifetime
          member of Norsk Skogkattring.
        </p>
        <h2 className="font-playfair text-3xl">
          Eva receives the Honorable membership in Norsk Skogkattring
        </h2>
        <Image className="mb-6" src={evaImgTwo} alt={"Eva recieves diploma"} />
        <h2 className="font-playfair text-3xl">
          Eva receives the &quot;Trulse-statuett&quot; from Norsk Skogkattring
        </h2>
        <Image
          src={evaImgThree}
          alt={"Eva holds the Trulse statuett from Norsk skogkattring"}
          placeholder="blur"
        />
        <Image
          src={evaImgFour}
          alt={"Photo of an article in the paper"}
          placeholder="blur"
        />
        <Image
          src={evaImgFive}
          alt={"Photo 2 of an article in the paper"}
          placeholder="blur"
        />
      </section>
      <Footer />
    </>
  );
}

function PageHead() {
  return (
    <Head>
      <title>
        About - Migoto&#039;s Norwegian Forest Cat &#8211; Oslo based cattery
      </title>
      <meta
        name="description"
        content="About Migotos, Norwegian Forest Cat Cattery based in Oslo, Norway"
      />
      <meta property="og:site_name" content="About - Migotos" />
      <meta property="og:title" content="About - Migotos" />
      <meta
        property="og:description"
        content="About Migotos, Norwegian Forest Cat Cattery based in Oslo, Norway"
      />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://migotos.com/about" />
      <meta
        property="og:image"
        content="https://migotos.com/static/icons/cropped-socialicon-480x480.png"
      />
      <meta property="og:image:alt" content="Migotos logo" />
      <meta property="og:image:type" content="image/png" />
      <meta property="og:image:width" content="480" />
      <meta property="og:image:height" content="480" />
      <meta
        property="article:published_time"
        content="2024-01-16T12:18:00+01:00"
      />
      <meta
        property="article:modified_time"
        content="2024-01-16T12:18:00+01:00"
      />
      <meta
        property="article:author"
        content="https://www.facebook.com/eva.d.eide"
      />
    </Head>
  );
}
