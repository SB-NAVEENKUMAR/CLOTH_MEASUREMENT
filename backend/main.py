from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import os
from ai_engine.core import DigitalTailor

app = FastAPI(title="FitQuest 360 API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"status": "online", "system": "FitQuest 360 AI Engine"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.post("/analyze-measurements")
async def analyze_measurements(
    front_image: UploadFile = File(...),
    side_image: UploadFile = File(...)
):
    try:
        # Save temp files
        front_path = f"temp_{front_image.filename}"
        side_path = f"temp_{side_image.filename}"
        
        with open(front_path, "wb") as f:
            f.write(await front_image.read())
        with open(side_path, "wb") as f:
            f.write(await side_image.read())

        # Process
        dt = DigitalTailor()
        measurements = dt.process_images(front_path, side_path)
        
        # Cleanup
        os.remove(front_path)
        os.remove(side_path)
        
        return {"status": "success", "measurements": measurements}
    except Exception as e:
        return {"status": "error", "message": str(e)}
