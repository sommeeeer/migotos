import Head from "next/head";
import Footer from "~/components/Footer";

export default function Contact() {
  return  (
    <div className="w-full flex flex-col">
      <section className="w-full bg-[#F7F7F7] text-center h-52 flex flex-col items-center justify-center gap-1">
        <h1 className="font-playfair text-4xl italic">Contact</h1>
        <h3 className="uppercase text-sm tracking-wider">Feel free to contact us</h3>
      </section>
      <section className="flex flex-col p-4 mt-10">
        <p className="text-lg text-[#7d7d7d]">YOU CAN DROP A LINE</p>
        <form action=""></form>
      </section>
    </div>
  )
} 