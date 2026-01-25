"use server";

import { signIn, signOut} from "@/auth";
import { AuthError} from "next-auth";
import { API_V1_URL} from "@/lib/constants";
import { SignupFormValues} from "@/schemas/auth";

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/tasks",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid credentials." };
        default:
          return { error: "Something went wrong." };
      }
    }
    throw error;
  }
}

export async function signupAction(values: SignupFormValues) {
  try {
    // ユーザー名をシードにしてランダムなアバターURLを生成
    const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(values.username)}`;
    const payload = { ...values, avatar_url: avatarUrl };

    const res = await fetch(`${API_V1_URL}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      return { error: data.detail || "Signup failed." };
    }

    return { success: true };
  } catch (error) {
    console.error("Signup Action Error:", error);
    return { error: "Internal server error." };
  }
}

export async function logoutAction() {
  await signOut({ redirectTo: "/login" });
}