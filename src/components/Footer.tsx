import { TfiAngleDoubleUp } from "react-icons/tfi";

export default function Footer() {
  return (
    <footer className="flex h-32 w-full max-w-3xl flex-col justify-center border-t-2 border-t-zinc-100 px-4">
      <div className="mt-12 flex flex-col items-center justify-between gap-4 text-center">
        <p className="text-sm">
          Copyright © Migotos {new Date().getFullYear()}
        </p>
        <button
          onClick={() => {
            window.scrollTo({
              top: 0,
              behavior: "smooth",
            });
          }}
        >
          <div className="mb-6 flex items-center gap-2 text-hoverbg hover:text-zinc-400">
            <p className="text-base">Go to top</p>
            <TfiAngleDoubleUp size={"2rem"} className="" />
          </div>
        </button>
      </div>
    </footer>
  );
}
