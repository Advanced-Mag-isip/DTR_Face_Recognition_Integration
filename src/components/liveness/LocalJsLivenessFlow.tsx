"use client";

import { useCallback, useEffect, useRef, useState } from "react";
//import { apiFetch } from "./mediapipe";
import { getFaceDetector } from "./mediapipe";;
import type { FaceDetector } from "@mediapipe/tasks-vision";

// Geometry & Layout
const OW = 260;
const OH = 330;
const SELFIE_PX = 320;

// Active Flash Config
const FLASH_COLORS = [
  { name: "white", hex: "#FFFFFF" }, // Baseline
  { name: "red", hex: "#FF0000" }, // R-channel spike
  { name: "cyan", hex: "#00FFFF" }, // G/B-channel spike
];

const FLASH_DURATION_MS = 800; //600
const MIN_COLOR_SHIFT = 0.008; //0.012

type Phase =
  | "libloading"
  | "centering"
  | "flashing"
  | "analyzing"
  | "uploading"
  | "passed"
  | "failed"
  | "cameraerror"
  | "liberror";

interface ColorSample {
  r: number;
  g: number;
  b: number;
  rRatio: number;
  gRatio: number;
  bRatio: number;
}

interface OverlayFaceData {
  bb: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  kp: Array<{
    x: number;
    y: number;
    label: string;
  }>;
}

/** Serialisable face detection snapshot from MediaPipe FaceDetector */
interface FaceDetectionSnapshot {
  score: number;
  bounding_box: {
    x: number;
    y: number;
    width: number;
    height: number;
    nx: number;
    ny: number;
    nw: number;
    nh: number;
    video_width: number;
    video_height: number;
  };
  keypoints: Array<{ x: number; y: number; label: string }>;
}

interface Props {
  //sessionId: string;
  onPassed: (result: {
    selfieDataUrl: string;
    livenessScore?: number;
    faceUrl?: string;
    livenessStatus: string;
  }) => void;
  onFailed: () => void;
}

const TL = {
  chip: "LIVENESS CHECK",
  loading: "Loading engine...",
  camstarting: "Starting camera...",
  centering: "Center your face in the oval",
  centeringsub: "Don't move your face",
  hintnone: "Face not detected, please try again.",
  hintmultiface: "Only one face allowed.",
  hintfacelost: "Don't move, Face lost...",
  flashing: "Analyzing lighting...",
  flashingsub: "Lighting too low - move to a brighter area.",
  analyzing: "Capturing image...",
  uploading: "Verifying...",
  passed: "Success!",
  failed: "Face check failed. Please try again.",
  camerr: "No access to camera.",
  camdetail: "Please allow camera access and try again.",
  liberr: "Unable to load liveness engine.",
  libdetail: "Please check your internet connection.",
  retry: "Try Again",
  cancel: "Cancel",
};

export function LocalJsLivenessFlow({ onPassed, onFailed }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectorRef = useRef<FaceDetector | null>(null);
  const rafRef = useRef<number | null>(null);
  const scanAnimRef = useRef<number | null>(null);
  const selfieRef = useRef("");

  const faceSnapshotsRef = useRef<FaceDetectionSnapshot[]>([]);

  // Live face tracking refs
  const currentFaceRef = useRef<OverlayFaceData | null>(null);
  const lastKnownFaceRef = useRef<OverlayFaceData | null>(null);
  const smoothedFaceRef = useRef<OverlayFaceData | null>(null);

  // State used to force visual overlay updates
  const [overlayFace, setOverlayFace] = useState<OverlayFaceData | null>(null);

  const [scanY, setScanY] = useState(0);
  const [radarAngle, setRadarAngle] = useState(0);

  const [phase, setPhase] = useState<Phase>("libloading");
  const [instr, setInstr] = useState(TL.loading);
  const [subInstr, setSubInstr] = useState("");
  const [hint, setHint] = useState("");
  const [errMsg, setErrMsg] = useState("");
  const [retryN, setRetryN] = useState(0);

  const [flashIndex, setFlashIndex] = useState(-1);
  const colorSamples = useRef<Record<string, ColorSample>>({});
  const colorCheckPassedRef = useRef<boolean | null>(null);

  const go = useCallback((next: Phase) => {
    setHint("");
    setPhase(next);

    const uiMap: Partial<Record<Phase, [string, string]>> = {
      centering: [TL.centering, TL.centeringsub],
      flashing: [TL.flashing, TL.flashingsub],
      analyzing: [TL.analyzing, ""],
      uploading: [TL.uploading, ""],
      passed: [TL.passed, ""],
      failed: [TL.failed, ""],
    };

    if (uiMap[next]) {
      setInstr(uiMap[next]![0]);
      setSubInstr(uiMap[next]![1]);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (scanAnimRef.current) cancelAnimationFrame(scanAnimRef.current);

    rafRef.current = null;
    scanAnimRef.current = null;

    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const resetTracking = useCallback(() => {
    faceSnapshotsRef.current = [];
    currentFaceRef.current = null;
    lastKnownFaceRef.current = null;
    smoothedFaceRef.current = null;
    setOverlayFace(null);
  }, []);

  const startCamera = useCallback(async () => {
    stopCamera();

    colorSamples.current = {};
    colorCheckPassedRef.current = null;
    resetTracking();

    setFlashIndex(-1);
    setScanY(0);
    setRadarAngle(0);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();

        setTimeout(() => {
          go("centering");
        }, 600);
      }
    } catch {
      setPhase("cameraerror");
      setInstr(TL.camerr);
      setErrMsg(TL.camdetail);
    }
  }, [go, resetTracking, stopCamera]);

  // Load MediaPipe Face Detector and start camera on component mount
  useEffect(() => {
    let dead = false;

    getFaceDetector()
      .then((detector) => {
        if (dead) return;
        detectorRef.current = detector;
        startCamera();
      })
      .catch(() => {
        if (dead) return;
        setPhase("liberror");
        setInstr(TL.liberr);
        setErrMsg(TL.libdetail);
      });

    return () => {
      dead = true;
      stopCamera();
    };
  }, [retryN, startCamera, stopCamera]);

  const captureSelfie = useCallback((): string | null => {
    const v = videoRef.current;
    if (!v || !v.videoWidth) return null;

    const c = document.createElement("canvas");
    c.width = SELFIE_PX;
    c.height = SELFIE_PX;

    const ctx = c.getContext("2d");
    if (!ctx) return null;

    const sz = Math.min(v.videoWidth, v.videoHeight);

    ctx.translate(SELFIE_PX, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(
      v,
      (v.videoWidth - sz) / 2,
      (v.videoHeight - sz) / 2,
      sz,
      sz,
      0,
      0,
      SELFIE_PX,
      SELFIE_PX
    );

    return c.toDataURL("image/jpeg", 0.92);
  }, []);

  const sampleFacePixels = useCallback((): ColorSample | null => {
    const v = videoRef.current;
    if (!v || !v.videoWidth) return null;

    const c = document.createElement("canvas");
    c.width = 200;
    c.height = 200;

    const ctx = c.getContext("2d");
    if (!ctx) return null;

    ctx.drawImage(
      v,
      v.videoWidth / 2 - 100,
      v.videoHeight / 2 - 100,
      200,
      200,
      0,
      0,
      200,
      200
    );

    const data = ctx.getImageData(0, 0, 200, 200).data;

    let r = 0;
    let g = 0;
    let b = 0;

    for (let i = 0; i < data.length; i += 16) {
      r += data[i];
      g += data[i + 1];
      b += data[i + 2];
    }

    const pixels = data.length / 16;

    r /= pixels;
    g /= pixels;
    b /= pixels;

    const total = r + g + b || 1;

    return {
      r,
      g,
      b,
      rRatio: r / total,
      gRatio: g / total,
      bRatio: b / total,
    };
  }, []);

  const buildFaceSnapshot = useCallback(
    (
      detection: NonNullable<
        ReturnType<FaceDetector["detectForVideo"]>["detections"]
      >[0]
    ): FaceDetectionSnapshot | null => {
      const v = videoRef.current;
      if (!v || !v.videoWidth) return null;

      const vw = v.videoWidth;
      const vh = v.videoHeight;
      const bb = detection.boundingBox;
      const score = detection.categories?.[0]?.score ?? 0;

      return {
        score: Math.round(score * 10000) / 10000,
        bounding_box: bb
          ? {
              x: Math.round(bb.originX),
              y: Math.round(bb.originY),
              width: Math.round(bb.width),
              height: Math.round(bb.height),
              nx: Math.round((bb.originX / vw) * 10000) / 10000,
              ny: Math.round((bb.originY / vh) * 10000) / 10000,
              nw: Math.round((bb.width / vw) * 10000) / 10000,
              nh: Math.round((bb.height / vh) * 10000) / 10000,
              video_width: vw,
              video_height: vh,
            }
          : {
              x: 0,
              y: 0,
              width: 0,
              height: 0,
              nx: 0,
              ny: 0,
              nw: 0,
              nh: 0,
              video_width: vw,
              video_height: vh,
            },
        keypoints: (detection.keypoints ?? []).map((kp, i) => ({
          x: Math.round((kp.x ?? 0) * 10000) / 10000,
          y: Math.round((kp.y ?? 0) * 10000) / 10000,
          label:
            kp.label ??
            [
              "right_eye",
              "left_eye",
              "nose_tip",
              "mouth",
              "right_ear",
              "left_ear",
            ][i] ??
            `kp${i}`,
        })),
      };
    },
    []
  );

  const storeFaceSnapshot = useCallback((snapshot: FaceDetectionSnapshot) => {
    if (faceSnapshotsRef.current.length < 5) {
      faceSnapshotsRef.current.push(snapshot);
    } else {
      faceSnapshotsRef.current.shift();
      faceSnapshotsRef.current.push(snapshot);
    }
  }, []);

  const updateLiveFaceTracking = useCallback(
    (
      detection: NonNullable<
        ReturnType<FaceDetector["detectForVideo"]>["detections"]
      >[0]
    ) => {
      const v = videoRef.current;
      if (!v || !v.videoWidth) return;

      const vw = v.videoWidth;
      const vh = v.videoHeight;
      const bb = detection.boundingBox;

      if (!bb) return;

      const rawFace: OverlayFaceData = {
        bb: {
          x: bb.originX,
          y: bb.originY,
          w: bb.width,
          h: bb.height,
        },
        kp: (detection.keypoints ?? []).map((kp, i) => ({
          x: (kp.x ?? 0) * vw,
          y: (kp.y ?? 0) * vh,
          label:
            kp.label ??
            [
              "right_eye",
              "left_eye",
              "nose_tip",
              "mouth",
              "right_ear",
              "left_ear",
            ][i] ??
            `kp${i}`,
        })),
      };

      const previous = smoothedFaceRef.current;

      // Higher alpha = more responsive. Lower alpha = smoother but laggier.
      const alpha = 0.42;

      const smoothedFace: OverlayFaceData = previous
        ? {
            bb: {
              x: previous.bb.x + alpha * (rawFace.bb.x - previous.bb.x),
              y: previous.bb.y + alpha * (rawFace.bb.y - previous.bb.y),
              w: previous.bb.w + alpha * (rawFace.bb.w - previous.bb.w),
              h: previous.bb.h + alpha * (rawFace.bb.h - previous.bb.h),
            },
            kp: rawFace.kp.map((point, i) => {
              const oldPoint = previous.kp[i];

              if (!oldPoint) return point;

              return {
                label: point.label,
                x: oldPoint.x + alpha * (point.x - oldPoint.x),
                y: oldPoint.y + alpha * (point.y - oldPoint.y),
              };
            }),
          }
        : rawFace;

      smoothedFaceRef.current = smoothedFace;
      currentFaceRef.current = smoothedFace;
      lastKnownFaceRef.current = smoothedFace;
      setOverlayFace(smoothedFace);
    },
    []
  );

  // Live face detection + real overlay tracking
  useEffect(() => {
    if (phase !== "centering" && phase !== "flashing") return;

    let cancelled = false;
    let stableFaceFrames = 0;
    let totalFrames = 0;

    const tick = () => {
      if (cancelled) return;

      const v = videoRef.current;
      const detector = detectorRef.current;

      if (!v || !detector || v.readyState < 2) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      try {
        // Feeds current video frame to MediaPipe Face Detector and gets results with minimal latency.
        const res = detector.detectForVideo(v, performance.now());
        const detections = res.detections ?? [];
        const faces = detections.length;

        if (phase === "centering") {
          if (faces === 0) {
            stableFaceFrames = 0;
            setHint(TL.hintnone);
            currentFaceRef.current = null;
            smoothedFaceRef.current = null;
            setOverlayFace(null);
          } else if (faces > 1) {
            stableFaceFrames = 0;
            setHint(TL.hintmultiface);
            currentFaceRef.current = null;
            smoothedFaceRef.current = null;
            setOverlayFace(null);
          } else {
            const detection = detections[0];

            setHint("");
            updateLiveFaceTracking(detection);

            if (totalFrames % 3 === 0) {
              const snapshot = buildFaceSnapshot(detection);
              if (snapshot) storeFaceSnapshot(snapshot);
            }

            stableFaceFrames++;

            if (stableFaceFrames > 12) {
              go("flashing");
              return;
            }
          }
        }

        if (phase === "flashing") {
          if (faces === 1) {
            updateLiveFaceTracking(detections[0]);
          } else {
            // During flash, keep last known overlay instead of dropping it.
            const last = lastKnownFaceRef.current;
            if (last) setOverlayFace(last);
          }
        }

        totalFrames++;
      } catch {
        // Keep the loop alive even if a single detection frame fails.
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [
    phase,
    go,
    buildFaceSnapshot,
    storeFaceSnapshot,
    updateLiveFaceTracking,
  ]);

  // Scan/Radar animation
  useEffect(() => {
    if (phase !== "centering" && phase !== "flashing") {
      if (scanAnimRef.current) cancelAnimationFrame(scanAnimRef.current);
      scanAnimRef.current = null;
      setScanY(0);
      setRadarAngle(0);
      return;
    }

    const startTime = performance.now();
    const scanDuration = 2000;
    const radarDuration = 3000;

    const animate = (time: number) => {
      const elapsedScan = (time - startTime) % scanDuration;
      const elapsedRadar = (time - startTime) % radarDuration;

      setScanY((elapsedScan / scanDuration) * OH);
      setRadarAngle((elapsedRadar / radarDuration) * 360);

      scanAnimRef.current = requestAnimationFrame(animate);
    };

    scanAnimRef.current = requestAnimationFrame(animate);

    return () => {
      if (scanAnimRef.current) cancelAnimationFrame(scanAnimRef.current);
      scanAnimRef.current = null;
    };
  }, [phase]);

  // Flash Sequence Executor
  useEffect(() => {
    if (phase !== "flashing") return;

    let currentIdx = 0;
    setFlashIndex(currentIdx);

    const interval = setInterval(() => {
      const colorName = FLASH_COLORS[currentIdx].name;
      const sample = sampleFacePixels();

      if (sample) {
        colorSamples.current[colorName] = sample;
      }

      currentIdx++;

      if (currentIdx >= FLASH_COLORS.length) {
        clearInterval(interval);
        setFlashIndex(-1);
        setInstr(TL.analyzing);
        setSubInstr("");

        setTimeout(() => {
          selfieRef.current = captureSelfie() || "";
          go("analyzing");
        }, 800);
      } else {
        setFlashIndex(currentIdx);
      }
    }, FLASH_DURATION_MS);

    return () => clearInterval(interval);
  }, [phase, go, sampleFacePixels, captureSelfie]);

  // Analysis & Validation
  useEffect(() => {
    if (phase !== "analyzing") return;

    const s = colorSamples.current;
    let passed = false;

    if (s.white && s.red && s.cyan) {
      const redSpike = s.red.rRatio - s.white.rRatio > MIN_COLOR_SHIFT;
      const cyanSpike =
        s.cyan.gRatio - s.red.gRatio > MIN_COLOR_SHIFT ||
        s.cyan.bRatio - s.red.bRatio > MIN_COLOR_SHIFT;

      passed = redSpike && cyanSpike;
    }

    colorCheckPassedRef.current = passed;

    if (passed) {
      go("uploading");
    } else {
      go("failed");
    }
  }, [phase, go]);

    // Upload local liveness result
    useEffect(() => {
        if (phase !== "uploading") return;

        stopCamera();
        go("passed");
        setTimeout(() => onPassed({
            selfieDataUrl: selfieRef.current,
            livenessStatus: "passed",
        }), 700);
    }, [phase, go, stopCamera, onPassed]);

  const activeColor =
    flashIndex >= 0 ? FLASH_COLORS[flashIndex].hex : "#0a0a0a";

  const isErr = ["failed", "cameraerror", "liberror"].includes(phase);

  // Convert actual video pixel coordinates to the visible oval/SVG space.
  // This accounts for object-fit: cover and mirrored selfie display.
  const rawFace =
    phase === "flashing"
      ? overlayFace ?? lastKnownFaceRef.current
      : overlayFace ?? currentFaceRef.current;

  const v = videoRef.current;

  let overlayData: OverlayFaceData | null = null;

  if (rawFace && v && v.videoWidth && v.videoHeight) {
    const scale = Math.max(OW / v.videoWidth, OH / v.videoHeight);
    const renderedW = v.videoWidth * scale;
    const renderedH = v.videoHeight * scale;
    const offsetX = (OW - renderedW) / 2;
    const offsetY = (OH - renderedH) / 2;

    const mapX = (x: number) => OW - (offsetX + x * scale);
    const mapY = (y: number) => offsetY + y * scale;

    const left = mapX(rawFace.bb.x + rawFace.bb.w);
    const right = mapX(rawFace.bb.x);
    const top = mapY(rawFace.bb.y);
    const bottom = mapY(rawFace.bb.y + rawFace.bb.h);

    overlayData = {
      bb: {
        x: left,
        y: top,
        w: right - left,
        h: bottom - top,
      },
      kp: rawFace.kp.map((point) => ({
        x: mapX(point.x),
        y: mapY(point.y),
        label: point.label,
      })),
    };
  }

  const showOverlay =
    (phase === "centering" || phase === "flashing") && overlayData !== null;

  const corner = overlayData
    ? Math.max(10, Math.min(24, overlayData.bb.w * 0.18, overlayData.bb.h * 0.18))
    : 20;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        backgroundColor: activeColor,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        transition: "background-color 0.4s ease",
        overflow: "hidden",
      }}
    >
      {/* Instructions at the TOP */}
      <div style={{ textAlign: "center", marginBottom: 20, padding: "0 20px" }}>
        {!isErr ? (
          <>
            <div
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: "#fff",
                marginBottom: 8,
              }}
            >
              {instr}
            </div>
            <div
              style={{
                fontSize: 14,
                color: "rgba(255,255,255,0.75)",
                minHeight: 20,
              }}
            >
              {hint || subInstr || "\u00A0"}
            </div>
          </>
        ) : (
          <>
            <div
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: "#fff",
                marginBottom: 8,
              }}
            >
              {instr}
            </div>
            <div style={{ fontSize: 14, color: "#fca5a5", marginBottom: 12 }}>
              {errMsg}
            </div>
            <button
              onClick={() => {
                setErrMsg("");
                setRetryN((n) => n + 1);
              }}
              style={{
                marginTop: 20,
                background: "#0b43b8",
                color: "#fff",
                fontWeight: 700,
                fontSize: 15,
                padding: "13px 36px",
                borderRadius: 16,
                border: "none",
                cursor: "pointer",
              }}
            >
              {TL.retry}
            </button>
            <button
              onClick={onFailed}
              style={{
                marginTop: 12,
                background: "transparent",
                color: "#fff",
                fontWeight: 600,
                fontSize: 14,
                border: "none",
                cursor: "pointer",
              }}
            >
              {TL.cancel}
            </button>
          </>
        )}
      </div>

      {/* Center Video Oval with Functional Face-Point Overlay */}
      <div style={{ position: "relative", flexShrink: 0 }}>
        <div
          style={{
            width: OW,
            height: OH,
            margin: 4,
            borderRadius: "50%",
            overflow: "hidden",
            position: "relative",
            background: "#111",
            zIndex: 1,
            opacity: phase === "flashing" ? 0.8 : 1,
          }}
        >
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transform: "scaleX(-1)",
              display: "block",
            }}
          />

          {/* Default pulsing border when no face is tracked yet */}
          {phase === "centering" && !hint && !overlayData && (
            <div
              style={{
                position: "absolute",
                inset: 10,
                borderRadius: "50%",
                border: "2.5px solid rgba(255,255,255,0.4)",
                animation: "lp-pulse 1.2s ease-in-out infinite",
                zIndex: 5,
              }}
            />
          )}

          {showOverlay && overlayData && (
            <svg
              viewBox={`0 0 ${OW} ${OH}`}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                pointerEvents: "none",
                zIndex: 10,
              }}
            >
              <defs>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>

                <linearGradient id="scanGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="rgba(255,255,255,0)" />
                  <stop offset="50%" stopColor="rgba(255,255,255,0.5)" />
                  <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                </linearGradient>
              </defs>

              {/* Subtle tracking grid */}
              <g opacity="0.12">
                {Array.from({ length: 8 }).map((_, i) => (
                  <line
                    key={`h${i}`}
                    x1="0"
                    y1={i * (OH / 7)}
                    x2={OW}
                    y2={i * (OH / 7)}
                    stroke="white"
                    strokeWidth="0.5"
                  />
                ))}
                {Array.from({ length: 6 }).map((_, i) => (
                  <line
                    key={`v${i}`}
                    x1={i * (OW / 5)}
                    y1="0"
                    x2={i * (OW / 5)}
                    y2={OH}
                    stroke="white"
                    strokeWidth="0.5"
                  />
                ))}
              </g>

              {/* Actual tracked face bounding corners */}
              <g opacity="0.85" filter="url(#glow)">
                <path
                  d={`M ${overlayData.bb.x} ${overlayData.bb.y + corner}
                    L ${overlayData.bb.x} ${overlayData.bb.y}
                    L ${overlayData.bb.x + corner} ${overlayData.bb.y}`}
                  stroke="white"
                  strokeWidth="2"
                  fill="none"
                />

                <path
                  d={`M ${overlayData.bb.x + overlayData.bb.w - corner} ${overlayData.bb.y}
                    L ${overlayData.bb.x + overlayData.bb.w} ${overlayData.bb.y}
                    L ${overlayData.bb.x + overlayData.bb.w} ${overlayData.bb.y + corner}`}
                  stroke="white"
                  strokeWidth="2"
                  fill="none"
                />

                <path
                  d={`M ${overlayData.bb.x} ${overlayData.bb.y + overlayData.bb.h - corner}
                    L ${overlayData.bb.x} ${overlayData.bb.y + overlayData.bb.h}
                    L ${overlayData.bb.x + corner} ${overlayData.bb.y + overlayData.bb.h}`}
                  stroke="white"
                  strokeWidth="2"
                  fill="none"
                />

                <path
                  d={`M ${overlayData.bb.x + overlayData.bb.w - corner} ${overlayData.bb.y + overlayData.bb.h}
                    L ${overlayData.bb.x + overlayData.bb.w} ${overlayData.bb.y + overlayData.bb.h}
                    L ${overlayData.bb.x + overlayData.bb.w} ${overlayData.bb.y + overlayData.bb.h - corner}`}
                  stroke="white"
                  strokeWidth="2"
                  fill="none"
                />
              </g>

              {/* Functional connector lines between tracked MediaPipe points */}
              {overlayData.kp.length >= 4 && (
                <g opacity="0.55" filter="url(#glow)">
                  {overlayData.kp[0] && overlayData.kp[1] && (
                    <line
                      x1={overlayData.kp[0].x}
                      y1={overlayData.kp[0].y}
                      x2={overlayData.kp[1].x}
                      y2={overlayData.kp[1].y}
                      stroke="white"
                      strokeWidth="1.2"
                    />
                  )}

                  {overlayData.kp[0] && overlayData.kp[2] && (
                    <line
                      x1={overlayData.kp[0].x}
                      y1={overlayData.kp[0].y}
                      x2={overlayData.kp[2].x}
                      y2={overlayData.kp[2].y}
                      stroke="white"
                      strokeWidth="0.9"
                    />
                  )}

                  {overlayData.kp[1] && overlayData.kp[2] && (
                    <line
                      x1={overlayData.kp[1].x}
                      y1={overlayData.kp[1].y}
                      x2={overlayData.kp[2].x}
                      y2={overlayData.kp[2].y}
                      stroke="white"
                      strokeWidth="0.9"
                    />
                  )}

                  {overlayData.kp[2] && overlayData.kp[3] && (
                    <line
                      x1={overlayData.kp[2].x}
                      y1={overlayData.kp[2].y}
                      x2={overlayData.kp[3].x}
                      y2={overlayData.kp[3].y}
                      stroke="white"
                      strokeWidth="0.9"
                    />
                  )}
                </g>
              )}

              {/* Actual tracked MediaPipe landmark points */}
              {overlayData.kp.map((point, i) => (
                <g key={`${point.label}-${i}`} filter="url(#glow)">
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r="7"
                    fill="none"
                    stroke="white"
                    strokeWidth="1"
                    opacity="0.45"
                  />
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r="3.4"
                    fill="white"
                    opacity="0.95"
                  />
                </g>
              ))}

              {/* Horizontal scan line */}
              <rect
                x="0"
                y={scanY - 15}
                width={OW}
                height="30"
                fill="url(#scanGrad)"
                opacity="0.5"
              />

              {/* Radar sweep */}
              <g opacity="0.35">
                <line
                  x1={OW / 2}
                  y1={OH / 2}
                  x2={
                    OW / 2 +
                    Math.cos((radarAngle * Math.PI) / 180) * (OW / 2)
                  }
                  y2={
                    OH / 2 +
                    Math.sin((radarAngle * Math.PI) / 180) * (OH / 2)
                  }
                  stroke="white"
                  strokeWidth="2"
                  filter="url(#glow)"
                />
              </g>
            </svg>
          )}
        </div>
      </div>

      {/* Liveness Check Chip at the BOTTOM */}
      <div
        style={{
          position: "absolute",
          bottom: 40,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          zIndex: 10,
        }}
      >
        <div
          style={{
            background: "rgba(0,0,0,0.5)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 99,
            padding: "6px 20px",
            color: "#fff",
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.08em",
          }}
        >
          {TL.chip}
        </div>
      </div>

      <style>{`
        @keyframes lp-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.25; transform: scale(1.12); }
        }
      `}</style>
    </div>
  );
}