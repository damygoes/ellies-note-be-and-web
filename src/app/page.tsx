import { AppConstants } from "@/lib/constants";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <div className="flex flex-col justify-center items-center gap-2 w-full">
          <h1 className="text-5xl font-extrabold text-zinc-900 dark:text-white sm:text-6xl">
            Welcome to{" "}
            <span className="text-blue-600">{AppConstants.APP_NAME}</span>
          </h1>
          <p>
            Version: {AppConstants.VERSION} - Developed by{" "}
            {AppConstants.DEVELOPER_NAME}
          </p>
          <Link href="/privacy-policy">Privacy policy</Link>
        </div>
      </main>
    </div>
  );
}
