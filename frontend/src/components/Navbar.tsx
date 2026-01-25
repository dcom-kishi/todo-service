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
