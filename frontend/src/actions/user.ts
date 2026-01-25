"use server";

import { auth } from "@/auth";
import { API_V1_URL } from "@/lib/constants";
import { UserUpdateValues } from "@/schemas/user";
import { revalidatePath } from "next/cache";

async function getAuthHeader() {
  const session = await auth();
  if (!session?.accessToken) {
    throw new Error("Unauthorized");
  }
  return {
    Authorization: `Bearer ${session.accessToken}`,
    "Content-Type": "application/json",
  };
}

export async function updateProfileAction(values: UserUpdateValues) {
  try {
    const headers = await getAuthHeader();
    
    // パスワードが空文字列の場合は送信しない
    const payload = { ...values };
    if (!payload.password) delete payload.password;
    if (!payload.avatar_url) delete payload.avatar_url;

    const res = await fetch(`${API_V1_URL}/users/me`, {
      method: "PUT",
      headers,
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      return { error: data?.detail || "Update failed." };
    }

    revalidatePath("/profile");
    return { success: true, user: data };
  } catch (error) {
    console.error("Update Profile Error:", error);
    return { error: "Internal server error." };
  }
}

export async function deleteAccountAction() {
  try {
    const headers = await getAuthHeader();

    const res = await fetch(`${API_V1_URL}/users/me`, {
      method: "DELETE",
      headers,
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      return { error: data?.detail || "Deletion failed." };
    }

    // ログアウト処理はクライアント側で行うか、ここでsignOutを呼ぶ
    return { success: true };
  } catch (error) {
    console.error("Delete Account Error:", error);
    return { error: "Internal server error." };
  }
}
