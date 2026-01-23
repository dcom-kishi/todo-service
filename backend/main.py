from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.supabase_client import supabase
from routers import auth, users

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/v1")
app.include_router(users.router, prefix="/api/v1")

@app.get("/")
def read_root():
    return {"message": "Hello World"}

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.get("/api/v1/hello-supabase")
def get_hello_from_supabase():
    # Fetch the "Hello World" task from Supabase
    response = supabase.table("tasks").select("title").eq("title", "Hello World").limit(1).execute()
    if response.data:
        return {"data": response.data[0]["title"]}
    return {"data": "No data found in Supabase"}
