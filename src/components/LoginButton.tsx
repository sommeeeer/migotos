import { popupCenter } from "~/utils/helpers";

export default function LoginButton() {
  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-base">Want to post a comment?</h3>
      <button
        onClick={() => popupCenter("/google-signin", "Google Sign In")}
        className="h-14 w-4/6 cursor-pointer rounded-md border-2 border-solid border-gray-200 p-4 text-base transition-all duration-300 ease-in-out hover:bg-hoverbg hover:text-white disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-200 disabled:text-gray-600"
        type="submit"
      >
        Login
      </button>
    </div>
  );
}
