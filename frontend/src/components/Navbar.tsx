import Link from "next/link";
import { auth } from "@/auth";
import UserMenu from "./UserMenu";
import AuthButtons from "./AuthButtons";
import { Button } from "./ui";

export default async function Navbar() {
  const session = await auth();

  return (
    <nav className="border-b bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          <div className="flex">
            <Link href="/tasks" className="flex shrink-0 items-center font-bold text-xl text-blue-600">
              Todo Service
            </Link>
          </div>
          <div className="flex items-center gap-4">
            {session ? (
              <UserMenu user={session.user} />
            ) : (
              <AuthButtons />
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
