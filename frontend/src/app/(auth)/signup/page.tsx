"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupAction } from "@/actions/auth";
import { signupSchema, type SignupFormValues } from "@/schemas/auth";
import { Button, Input, Label, Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui";

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
  });

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        router.push("/login");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success, router]);

  const onSubmit = async (data: SignupFormValues) => {
    setError(null);
    setIsPending(true);

    try {
      const result = await signupAction(data);
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(true);
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setIsPending(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4 transition-colors">
        <Card className="w-full max-w-md p-8 text-center">
          <CardTitle className="mb-4 text-green-600 dark:text-green-400">Account Created!</CardTitle>
          <p className="text-muted-foreground">
            Redirecting you to the login page in a few seconds...
          </p>
          <Link href="/login" className="mt-6 block">
            <Button className="w-full" variant="outline">
              Go to Login
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8 transition-colors">
      <Card className="w-full max-w-md">

          <CardHeader className="space-y-1">

            <CardTitle className="text-center text-2xl font-bold">Create an account</CardTitle>

          </CardHeader>

          <form onSubmit={handleSubmit(onSubmit)}>

            <CardContent className="grid gap-4">

              <div className="grid gap-2">

                <Label htmlFor="username">Username</Label>

                <Input

                  id="username"

                  placeholder="johndoe"

                  {...register("username")}

                  disabled={isPending}

                />

                {errors.username && (

                  <p className="text-xs text-red-500">{errors.username.message}</p>

                )}

              </div>

              <div className="grid gap-2">

                <Label htmlFor="email">Email</Label>

                <Input

                  id="email"

                  type="email"

                  placeholder="m@example.com"

                  {...register("email")}

                  disabled={isPending}

                />

                {errors.email && (

                  <p className="text-xs text-red-500">{errors.email.message}</p>

                )}

              </div>

              <div className="grid gap-2">

                <Label htmlFor="password">Password</Label>

                <Input

                  id="password"

                  type="password"

                  {...register("password")}

                  disabled={isPending}

                />

                {errors.password && (

                  <p className="text-xs text-red-500">{errors.password.message}</p>

                )}

              </div>

              {error && (

                <p className="text-sm font-medium text-red-500">{error}</p>

              )}

            </CardContent>

            <CardFooter className="flex flex-col gap-4">
              <Button className="w-full" type="submit" disabled={isPending}>
                {isPending ? "Creating account..." : "Sign up"}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="text-blue-600 dark:text-blue-400 hover:underline">
                  Login
                </Link>
              </p>
            </CardFooter>

          </form>

        </Card>

      </div>

    );

  }

  