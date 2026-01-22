export const dynamic = 'force-dynamic';

export default async function Home() {
  // For this Docker environment, we want to prioritize the service name
  const fetchUrl = typeof window === 'undefined' ? 'http://backend:8000' : (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000');

  let data = "Loading...";
  try {
    const res = await fetch(`${fetchUrl}/api/v1/hello-supabase`, { cache: 'no-store' });
    const json = await res.json();
    data = json.data;
  } catch (error) {
    console.error("Failed to fetch from backend:", error);
    data = "Error connecting to Backend";
  }

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <h1 className="text-4xl font-bold italic text-blue-600">
          Todo Service
        </h1>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Message from Supabase via Backend API:</p>
          <p className="text-2xl font-mono text-green-500">{data}</p>
        </div>

        <ol className="list-inside list-decimal text-sm text-center sm:text-left font-[family-name:var(--font-geist-mono)]">
          <li className="mb-2">
            Backend: FastAPI
          </li>
          <li>Database: Supabase (PostgreSQL)</li>
        </ol>
      </main>
    </div>
  );
}