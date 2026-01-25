import Link from "next/link";
import { auth } from "@/auth";
import { logoutAction } from "@/actions/auth";
import { Button } from "./ui";

export default async function Navbar() {
  const session = await auth();

  return (
    <nav className="border-b bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          <div className="flex">
            <Link href="/" className="flex shrink-0 items-center font-bold text-xl text-blue-600">
              Todo Service
            </Link>
          </div>
          <div className="flex items-center gap-4">
            {session ? (
              <>
                <Link href="/profile" className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
                  {session.user.avatarUrl ? (
                    <img src={session.user.avatarUrl} alt={session.user.username || "User"} className="w-8 h-8 rounded-full border border-gray-200" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                      {(session.user.username || session.user.email || "?").charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="hidden sm:inline">Profile</span>
                </Link>
                <span className="text-sm text-gray-700">
                  Hi, <span className="font-medium">{session.user.username || session.user.email}</span>
                </span>
                <form action={logoutAction}>
                  <Button variant="outline" size="sm" type="submit">
                    Logout
                  </Button>
                </form>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Login
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm">
                    Sign up
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
