import { auth } from "@/auth";
import Link from "next/link";
import { Button, Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import { API_V1_URL } from "@/lib/constants";

export const dynamic = 'force-dynamic';

export default async function Home() {
  const session = await auth();
  
  let backendData = "Loading...";
  try {
    const res = await fetch(`${API_V1_URL}/hello-supabase`, { cache: 'no-store' });
    const json = await res.json();
    backendData = json.data;
  } catch (error) {
    console.error("Failed to fetch from backend:", error);
    backendData = "Error connecting to Backend";
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-12">
        <header className="text-center">
          <h1 className="text-5xl font-extrabold text-blue-600 dark:text-blue-400 tracking-tight mb-4">
            Todo Service
          </h1>
          <p className="text-xl text-muted-foreground">
            A secure, modern task management system powered by FastAPI and Next.js.
          </p>
        </header>

        {session ? (
          <Card className="overflow-hidden shadow-xl border-0">
            <div className="md:flex">
              <div className="md:shrink-0 bg-blue-600 flex items-center justify-center p-8 md:w-48">
                {session.user.avatarUrl ? (
                  <img src={session.user.avatarUrl} alt={session.user.username || "User"} className="w-24 h-24 rounded-full border-4 border-white/20 shadow-lg" />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center text-4xl text-white font-bold border-4 border-white/10 shadow-lg">
                    {(session.user.username || session.user.email || "?").charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="p-8 w-full">
                <div className="uppercase tracking-wide text-sm text-blue-600 dark:text-blue-400 font-semibold">Welcome back,</div>
                <h2 className="block mt-1 text-3xl leading-tight font-bold text-foreground">
                  {session.user.username || "User"}
                </h2>
                <p className="mt-2 text-muted-foreground">
                  You are logged in as <span className="font-medium text-foreground">{session.user.email}</span>.
                </p>
                <div className="mt-6 flex gap-4">
                  <Link href="/profile">
                    <Button variant="outline">Edit Profile</Button>
                  </Link>
                  <Link href="/tasks">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">Go to Tasks</Button>
                  </Link>
                </div>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="p-12 text-center shadow-xl border-0">
            <h2 className="text-3xl font-bold mb-6 text-foreground">Get Started with Todo Service</h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
              Manage your daily tasks efficiently with our secure platform.
              Sign up today to start organizing your life.
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/login">
                <Button size="lg" variant="outline" className="px-8">Login</Button>
              </Link>
              <Link href="/signup">
                <Button size="lg" className="px-8 bg-blue-600 hover:bg-blue-700 text-white">Sign Up</Button>
              </Link>
            </div>
          </Card>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          <Card className="border-blue-100 dark:border-blue-900/30">
            <CardHeader>
              <CardTitle className="text-blue-600 dark:text-blue-400">Backend Status</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">Message from Supabase via Backend API:</p>
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded border border-green-100 dark:border-green-900/30">
                <p className="text-xl font-mono text-green-600 dark:text-green-400 font-bold">{backendData}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-100 dark:border-zinc-800">
            <CardHeader>
              <CardTitle>System Architecture</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Frontend: Next.js 15 (App Router)
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Backend: FastAPI (Python 3.13)
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Database: Supabase (PostgreSQL)
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Auth: NextAuth.js v5
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
