from fastapi import FastAPI
from pydantic import BaseModel
import io
import os
import threading
import numpy as np
from PIL import Image
import glob

app = FastAPI()

# Global singleton — InsightFace loads the ONNX model once into RAM.
# Protected by a lock because FastAPI may call this from multiple threads.
_app_lock = threading.Lock()
_face_app = None

def _get_face_app():
    """Lazy-load and cache the InsightFace FaceAnalysis instance."""
    global _face_app
    if _face_app is not None:
        return _face_app
    with _app_lock:
        if _face_app is not None:
            return _face_app
        from insightface.app import FaceAnalysis
        face_app = FaceAnalysis(
            name="buffalo_sc",           # smallest production model (~20 MB)
            providers=["CPUExecutionProvider"],
        )
        # det_size=(320, 320): faster on CPU than the default 640×640.
        # Use 640 if accuracy matters more than speed.
        face_app.prepare(ctx_id=0, det_size=(320, 320))
        _face_app = face_app
        return _face_app

def _load_image(raw: bytes):
    img = Image.open(io.BytesIO(raw)).convert("RGB")
    arr = np.array(img)
    # InsightFace expects BGR
    return arr[:, :, ::-1].copy() 

# Cosine similarity threshold for "same person" — tuned for MobileFaceNet.
# Score above this → likely same person. Lower = stricter.
COSINE_THRESHOLD = 0.35

class VerifyRequest(BaseModel):
    live_path: str
    ref_path: str

@app.post("/verify")
def verify(req: VerifyRequest):
    try:
        if not os.path.exists(req.live_path):
            return { "verified": False, "error": f"Selfie not found: {req.live_path}" }
        if not os.path.exists(req.ref_path):
            return { "verified": False, "error": f"Reference not found: {req.ref_path}" }

        # If ref_path is "storage/faces/emp001.jpg", cache_path becomes "storage/faces/emp001.npy"
        base_path, _ = os.path.splitext(req.ref_path)
        cache_path = base_path + ".npy"
        
        ref_embedding = None

        if os.path.exists(cache_path):
            # Cache Hit: Read the raw 512 numbers directly from disk in milliseconds!
            ref_embedding = np.load(cache_path)
        else:
            # Cache Miss: Compute it using InsightFace the very first time
            face_app = _get_face_app()
            with open(req.ref_path, "rb") as f:
                ref_bytes = f.read()
            ref_arr = _load_image(ref_bytes)
            ref_faces = face_app.get(ref_arr)
            
            if not ref_faces:
                return { "verified": False, "error": "no_face_in_reference_photo" }
            
            # Pick the largest / most confident face from each image
            best_ref_face = max(ref_faces, key=lambda f: f.det_score)
            ref_embedding = best_ref_face.normed_embedding
            
            # Save the computed array to disk for future biometric operations
            np.save(cache_path, ref_embedding)

        # LIVE IMAGE PROCESSING (Always computed fresh for every clock-in)
        face_app = _get_face_app()
        with open(req.live_path, "rb") as f:
            live_bytes = f.read()
            
        live_arr = _load_image(live_bytes)
        live_faces = face_app.get(live_arr)

        if not live_faces:
            return { "verified": False, "error": "no_face_in_selfie" }

        live_face = max(live_faces, key=lambda f: f.det_score)

        # → cosine similarity == dot product
        cosine_sim = float(np.dot(live_face.normed_embedding, ref_embedding))

        # Clamp to [0, 1] for the reviewer UI (raw cosine can be slightly negative)
        similarity_score = max(0.0, min(1.0, (cosine_sim + 1.0) / 2.0))
        verified = cosine_sim >= COSINE_THRESHOLD

        return {
            "verified": verified,
            "similarity_score": round(similarity_score, 4),
            "cosine_similarity": round(cosine_sim, 4),
            "threshold": COSINE_THRESHOLD,
            "cached_reference": os.path.exists(cache_path)
        }

    except Exception as e:
        return { "verified": False, "error": str(e) }
    
class IdentifyRequest(BaseModel):
    live_path: str

@app.post("/identify")
def identify(req: IdentifyRequest):
    try:
        if not os.path.exists(req.live_path):
            return { "verified": False, "error": "Selfie snapshot not found" }

        # Process live webcam frame
        face_app = _get_face_app()
        with open(req.live_path, "rb") as f:
            live_bytes = f.read()
        live_arr = _load_image(live_bytes)
        live_faces = face_app.get(live_arr)

        if not live_faces:
            return { "verified": False, "error": "no_face_in_selfie" }

        live_face = max(live_faces, key=lambda f: f.det_score)
        live_embedding = live_face.normed_embedding

        # SCAN ALL CACHED EMBEDDINGS (.npy files) IN STORAGE
        faces_dir = os.path.join("..", "backend", "storage", "faces", "*.npy")
        cache_files = glob.glob(faces_dir)

        best_match_id = None
        highest_score = -1.0

        for cache_path in cache_files:
            ref_embedding = np.load(cache_path)
            cosine_sim = float(np.dot(live_embedding, ref_embedding))

            if cosine_sim > highest_score:
                highest_score = cosine_sim
                filename = os.path.basename(cache_path)
                best_match_id, _ = os.path.splitext(filename)

        # Evaluate highest matching calculation metric against threshold
        normalized_score = max(0.0, min(1.0, (highest_score + 1.0) / 2.0))
        
        if highest_score >= COSINE_THRESHOLD:
            return {
                "verified": True,
                "employeeId": best_match_id, # Returns the filename string token (e.g., "6" or "emp001")
                "similarity_score": round(normalized_score, 4),
                "cosine_similarity": round(highest_score, 4)
            }
        
        return { "verified": False, "error": "Unknown face. Verification mapping threshold not met." }

    except Exception as e:
        return { "verified": False, "error": str(e) }

@app.get("/health")
def health():
    return { "status": "ok" }