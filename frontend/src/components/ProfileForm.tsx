"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { userUpdateSchema, type UserUpdateValues } from "@/schemas/user";
import { updateProfileAction, deleteAccountAction } from "@/actions/user";
import { logoutAction } from "@/actions/auth";
import { Button, Input, Label } from "./ui";
import { useRouter } from "next/navigation";

interface ProfileFormProps {
  user: {
    email?: string | null;
    username?: string;
    avatarUrl?: string;
  };
}

export default function ProfileForm({ user }: ProfileFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

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

  const onSubmit = async (data: UserUpdateValues) => {
    setError(null);
    setSuccess(null);
    setIsPending(true);

    try {
      const result = await updateProfileAction(data);
      if (result.error) {
        setError(result.error);
      } else {
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
    if (!confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      return;
    }

    setIsPending(true);
    try {
      const result = await deleteAccountAction();
      if (result.error) {
        setError(result.error);
        setIsPending(false);
      } else {
        // アカウント削除成功後、ログアウトしてトップへ
        await logoutAction();
      }
    } catch (err) {
      setError("Failed to delete account.");
      setIsPending(false);
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
        {success && <p className="text-sm font-medium text-green-600">{success}</p>}

        <Button type="submit" disabled={isPending}>
          {isPending ? "Updating..." : "Save Changes"}
        </Button>
      </form>

      <div className="pt-6 border-t border-gray-200">
        <h3 className="text-lg font-medium text-red-600">Danger Zone</h3>
        <p className="text-sm text-gray-500 mb-4">
          Once you delete your account, there is no going back. Please be certain.
        </p>
        <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50" onClick={handleDeleteAccount} disabled={isPending}>
          Delete Account
        </Button>
      </div>
    </div>
  );
}
