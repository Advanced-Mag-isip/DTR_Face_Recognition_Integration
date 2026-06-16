import { FaceDetector, FilesetResolver } from "@mediapipe/tasks-vision";

let detector: FaceDetector | null = null;

export async function getFaceDetector(): Promise<FaceDetector> {
  if (detector) return detector;

  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
  );

  detector = await FaceDetector.createFromOptions(vision, {
    baseOptions: {
      // The BlazeFace model is incredibly fast and only ~230 KB
      modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite",
      delegate: "GPU",
    },
    runningMode: "VIDEO",
  });

  return detector;
}

export function resetFaceDetector(): void {
  if (detector) {
    detector.close();
    detector = null;
  }
}

export function preloadFaceDetector(): void {
  getFaceDetector().catch((err) => {
    console.warn("Background preloading of Face Detector failed:", err);
  });
}