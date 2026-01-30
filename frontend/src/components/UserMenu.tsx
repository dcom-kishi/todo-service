"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { logoutAction } from "@/actions/auth";
import { User as UserIcon, LayoutDashboard, LogOut, Wrench } from "lucide-react";

interface UserMenuProps {
  user: {
    email?: string | null;
    username?: string;
    avatarUrl?: string;
  };
}

export default function UserMenu({ user }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 focus:outline-none"
      >
        <span className="text-sm font-medium text-foreground hidden sm:inline">
          {user.username || user.email}
        </span>
        <div className="shrink-0 hover:opacity-80 transition-opacity">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt="User"
              className="w-8 h-8 rounded-full border border-border"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xs border border-blue-200 dark:border-blue-900/50">
              {(user.username || user.email || "?").charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-card rounded-md shadow-lg py-1 z-50 border border-border animate-in fade-in zoom-in-95 duration-100">
          <div className="px-4 py-2 border-b border-border/50">
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>

          <Link
            href="/tasks"
            className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
            onClick={() => setIsOpen(false)}
          >
            <LayoutDashboard size={16} className="text-muted-foreground" />
            Tasks
          </Link>

          <Link
            href="/profile"
            className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
            onClick={() => setIsOpen(false)}
          >
            <UserIcon size={16} className="text-muted-foreground" />
            Profile
          </Link>

          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
            onClick={() => setIsOpen(false)}
          >
            <Wrench size={16} className="text-muted-foreground" />
            Dev Tools
          </Link>

          <div className="border-t border-border mt-1">
            <form action={logoutAction}>
              <button
                type="submit"
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <LogOut size={16} />
                Logout
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
