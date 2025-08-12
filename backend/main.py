from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn

app = FastAPI(
    title="OpenBioCure Platform API",
    description="Backend API for the OpenBioCure bioinformatics platform",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Welcome to OpenBioCure Platform API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "OpenBioCure API"}

@app.get("/api/v1/")
async def api_root():
    return {
        "message": "OpenBioCure Platform API v1",
        "endpoints": {
            "health": "/health",
            "docs": "/docs",
            "redoc": "/redoc"
        }
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000) 