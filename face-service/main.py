from fastapi import FastAPI
from pydantic import BaseModel
import io
import os
import threading
import numpy as np
from PIL import Image
import glob
import time  

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
    start_time = time.time()
    try:
        if not os.path.exists(req.live_path):
            return { "verified": False, "error": f"Selfie not found: {req.live_path}" }
        if not os.path.exists(req.ref_path):
            return { "verified": False, "error": f"Reference not found: {req.ref_path}" }

        # If ref_path is "storage/faces/emp001.jpg", cache_path becomes "storage/faces/emp001.npy"
        base_path, _ = os.path.splitext(req.ref_path)
        cache_path = base_path + ".npy"
        
        ref_embedding = None
        is_cache_hit = False

        if os.path.exists(cache_path):
            # Cache Hit: Read the raw 512 numbers directly from disk in milliseconds!
            ref_embedding = np.load(cache_path)
            is_cache_hit = True
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

        # Print total 1:1 verification compute time to your server terminal window
        duration_ms = (time.time() - start_time) * 1000
        cache_status = "Cache Hit" if is_cache_hit else "Cache Miss"
        print(f"[PERF] /verify pipeline completed in {duration_ms:.2f}ms ({cache_status})")

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
    start_time = time.time()
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
            return { "verified": False, "error": "Face not clear, please try again" }

        live_face = max(live_faces, key=lambda f: f.det_score)
        live_embedding = live_face.normed_embedding

        # Check for both .npy AND .jpg files
        faces_dir = "/app/storage/faces"
        
        # Get all .npy files (existing embeddings)
        npy_files = glob.glob(os.path.join(faces_dir, "*.npy"))
        
        # Get all .jpg files (reference photos without embeddings)
        jpg_files = glob.glob(os.path.join(faces_dir, "*.jpg"))
        
        # Generate embeddings for .jpg files that don't have .npy counterparts
        processed_files = []
        
        for jpg_path in jpg_files:
            base_name = os.path.splitext(os.path.basename(jpg_path))[0]
            npy_path = os.path.join(faces_dir, f"{base_name}.npy")
            
            if not os.path.exists(npy_path):
                # Generate embedding for this employee
                try:
                    with open(jpg_path, "rb") as f:
                        ref_bytes = f.read()
                    ref_arr = _load_image(ref_bytes)
                    ref_faces = face_app.get(ref_arr)
                    
                    if ref_faces:
                        best_ref_face = max(ref_faces, key=lambda f: f.det_score)
                        ref_embedding = best_ref_face.normed_embedding
                        np.save(npy_path, ref_embedding)
                        processed_files.append(base_name)
                except Exception as e:
                    print(f"Error generating embedding for {base_name}: {e}")
        
        # Now scan all embeddings (including newly generated ones)
        all_embeddings = glob.glob(os.path.join(faces_dir, "*.npy"))
        
        best_match_id = None
        highest_score = -1.0

        for cache_path in all_embeddings:
            ref_embedding = np.load(cache_path)
            cosine_sim = float(np.dot(live_embedding, ref_embedding))
            
            if cosine_sim > highest_score:
                highest_score = cosine_sim
                filename = os.path.basename(cache_path)
                best_match_id, _ = os.path.splitext(filename)

        normalized_score = max(0.0, min(1.0, (highest_score + 1.0) / 2.0))
        
        duration_ms = (time.time() - start_time) * 1000
        print(f"[PERF] /identify completed across {len(all_embeddings)} vectors in {duration_ms:.2f}ms")
        if processed_files:
            print(f"[INFO] Generated embeddings for {len(processed_files)} new employees: {processed_files}")

        if highest_score >= COSINE_THRESHOLD:
            return {
                "verified": True,
                "employeeId": best_match_id,
                "similarity_score": round(normalized_score, 4),
                "cosine_similarity": round(highest_score, 4),
                "new_embeddings_generated": processed_files
            }
        
        return { 
            "verified": False, 
            "error": "Unknown face. Verification mapping threshold not met.",
            "new_embeddings_generated": processed_files
        }

    except Exception as e:
        return { "verified": False, "error": str(e) }

@app.get("/health")
def health():
    return { "status": "ok" }