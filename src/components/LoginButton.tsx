import { signIn } from "next-auth/react";

export default function LoginButton() {
  return (
    <button
      onClick={() => void signIn()}
      className="h-14 w-4/6 cursor-pointer rounded-md border-2 border-solid border-gray-200 p-4 text-base transition-all duration-300 ease-in-out hover:bg-hoverbg hover:text-white disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-200 disabled:text-gray-600"
      type="submit"
    >
      Login
    </button>
  );
}
