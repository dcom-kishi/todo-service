"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { userUpdateSchema, type UserUpdateValues } from "@/schemas/user";
import { updateProfileAction, deleteAccountAction } from "@/actions/user";
import { logoutAction } from "@/actions/auth";
import { Button, Input, Label } from "./ui";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { Monitor, Moon, Sun } from "lucide-react";

interface ProfileFormProps {
  user: {
    email?: string | null;
    username?: string;
    avatarUrl?: string;
  };
}

export default function ProfileForm({ user }: ProfileFormProps) {
  const router = useRouter();
  const { update } = useSession();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserUpdateValues>({
    resolver: zodResolver(userUpdateSchema),
    defaultValues: {
      username: user.username || "",
      email: user.email || "",
      avatar_url: user.avatarUrl || "",
    },
  });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const onSubmit = async (data: UserUpdateValues) => {
    setError(null);
    setSuccess(null);
    setIsPending(true);

    try {
      const result = await updateProfileAction(data);
      if (result.error) {
        setError(result.error);
      } else {
        // セッションを即座に更新（新しいデータを渡す）
        if (result.user) {
          await update({
            username: result.user.username,
            avatarUrl: result.user.avatar_url,
          });
        }

        setSuccess("Profile updated successfully!");
        router.refresh();
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setIsPending(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsPending(true);
    try {
      const result = await deleteAccountAction();
      if (result.error) {
        setError(result.error);
        setIsPending(false);
        setShowDeleteConfirm(false);
      } else {
        // アカウント削除成功後、ログアウトしてトップへ
        await logoutAction();
      }
    } catch (err) {
      setError("Failed to delete account.");
      setIsPending(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="username">Username</Label>
          <Input id="username" {...register("username")} disabled={isPending} />
          {errors.username && <p className="text-xs text-red-500">{errors.username.message}</p>}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="email">Email Address</Label>
          <Input id="email" type="email" {...register("email")} disabled={isPending} />
          {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="password">New Password (leave blank to keep current)</Label>
          <Input id="password" type="password" {...register("password")} disabled={isPending} />
          {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="avatar_url">Avatar URL</Label>
          <Input id="avatar_url" {...register("avatar_url")} disabled={isPending} />
          {errors.avatar_url && <p className="text-xs text-red-500">{errors.avatar_url.message}</p>}
        </div>

        {error && <p className="text-sm font-medium text-red-500">{error}</p>}
        {success && <p className="text-sm font-medium text-green-600 dark:text-green-400">{success}</p>}

        <Button type="submit" disabled={isPending}>
          {isPending ? "Updating..." : "Save Changes"}
        </Button>
      </form>

      <div className="pt-6 border-t border-border">
        <h3 className="text-lg font-medium text-foreground">Appearance</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Choose how Todo Service looks to you.
        </p>
        <div className="grid grid-cols-3 gap-4">
          <button
            type="button"
            onClick={() => setTheme("light")}
            className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition-all ${
              mounted && theme === "light"
                ? "border-blue-600 bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:border-blue-500"
                : "border-border hover:bg-muted text-foreground"
            }`}
          >
            <Sun className="h-5 w-5" />
            <span className="text-xs font-medium">Light</span>
          </button>
          <button
            type="button"
            onClick={() => setTheme("dark")}
            className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition-all ${
              mounted && theme === "dark"
                ? "border-blue-600 bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:border-blue-500"
                : "border-border hover:bg-muted text-foreground"
            }`}
          >
            <Moon className="h-5 w-5" />
            <span className="text-xs font-medium">Dark</span>
          </button>
          <button
            type="button"
            onClick={() => setTheme("system")}
            className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition-all ${
              mounted && theme === "system"
                ? "border-blue-600 bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:border-blue-500"
                : "border-border hover:bg-muted text-foreground"
            }`}
          >
            <Monitor className="h-5 w-5" />
            <span className="text-xs font-medium">System</span>
          </button>
        </div>
      </div>

      <div className="pt-6 border-t border-border">
        <h3 className="text-lg font-medium text-red-600 dark:text-red-400">Danger Zone</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Once you delete your account, there is no going back. Please be certain.
        </p>
        {!showDeleteConfirm ? (
          <Button
            variant="outline"
            className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-900/20"
            onClick={() => setShowDeleteConfirm(true)}
            disabled={isPending}
          >
            Delete Account
          </Button>
        ) : (
          <div className="flex items-center gap-4 animate-in fade-in slide-in-from-top-1">
            <Button
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleDeleteAccount}
              disabled={isPending}
            >
              {isPending ? "Deleting..." : "Confirm Deletion"}
            </Button>
            <Button
              variant="ghost"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
