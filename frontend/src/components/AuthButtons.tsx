"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "./ui";

export default function AuthButtons() {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";
  const isSignupPage = pathname === "/signup";

  return (
    <div className="flex items-center gap-2">
      {!isLoginPage && (
        <Link href="/login">
          <Button variant="ghost" size="sm">
            Login
          </Button>
        </Link>
      )}
      {!isSignupPage && (
        <Link href="/signup">
          <Button size="sm">
            Sign up
          </Button>
        </Link>
      )}
    </div>
  );
}
