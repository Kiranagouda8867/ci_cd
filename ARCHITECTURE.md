# 🎨 Visual Architecture & User Flow Guide

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              USER BROWSER                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                   React Frontend (Vite)                               │ │
│  │                    http://localhost:5173                              │ │
│  │                                                                        │ │
│  │  ┌──────────────────────────────────────────────────────────────────┐ │ │
│  │  │              DetectionInterface Component                        │ │ │
│  │  │                                                                  │ │ │
│  │  │  ┌─────────────────────────────────────────────────────────┐   │ │ │
│  │  │  │  📤 Upload Image          📹 Webcam Capture           │   │ │ │
│  │  │  │  - Drag & Drop            - Real-time feed           │   │ │ │
│  │  │  │  - File validation        - Capture button           │   │ │ │
│  │  │  │  - Preview                - Mobile friendly          │   │ │ │
│  │  │  └─────────────────────────────────────────────────────────┘   │ │ │
│  │  │                                                                  │ │ │
│  │  │  Confidence Threshold: [========⚙️========] 50%                │ │ │
│  │  │                                                                  │ │ │
│  │  │  [🚀 Detect Objects]  [🔄 Reset]                              │ │ │
│  │  │                                                                  │ │ │
│  │  │  Results:                                                       │ │ │
│  │  │  ┌─────────────────────────────────────────────────────────┐   │ │ │
│  │  │  │  [🖼️ Annotated Image]                     [⬇️ Download]│   │ │ │
│  │  │  │  (with bounding boxes & confidence scores)              │   │ │ │
│  │  │  │                                                          │   │ │ │
│  │  │  │  Objects Found: 3                                       │   │ │ │
│  │  │  │  ┌────────────────────────────────────────────────┐    │   │ │ │
│  │  │  │  │  🔴 Fire Extinguisher (92%)  [100, 50, ...]  │    │   │ │ │
│  │  │  │  │  🟢 First Aid Kit (87%)       [250, 120, ...] │    │   │ │ │
│  │  │  │  │  🟡 Caution Sign (95%)        [400, 180, ...] │    │   │ │ │
│  │  │  │  └────────────────────────────────────────────────┘    │   │ │ │
│  │  │  └─────────────────────────────────────────────────────────┘   │ │ │
│  │  └──────────────────────────────────────────────────────────────────┘   │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                │                                              │
└─────────────────────────────────┼──────────────────────────────────────────────┘
                                  │ HTTP POST
                                  │ /detect-image
                                  │ (image file + confidence)
                                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         FLASK BACKEND SERVER                                │
│                      http://localhost:5000                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                              app.py                                   │ │
│  │  ┌──────────────────────────────────────────────────────────────────┐ │ │
│  │  │  Flask App Initialization                                       │ │ │
│  │  │  - CORS enabled (localhost:5173, 3000)                         │ │ │
│  │  │  - Max file size: 16MB                                         │ │ │
│  │  │  - Model loaded once at startup                               │ │ │
│  │  └──────────────────────────────────────────────────────────────────┘ │ │
│  │                                                                        │ │
│  │  ┌──────────────────────────────────────────────────────────────────┐ │ │
│  │  │                      routes/detect.py                           │ │ │
│  │  │  ┌─────────────────────────────────────────────────────────┐   │ │ │
│  │  │  │  GET /health                 [✓ Check if running]      │   │ │ │
│  │  │  │  POST /detect-image          [Main detection endpoint] │   │ │ │
│  │  │  │  GET /classes                [Get class labels]        │   │ │ │
│  │  │  │  GET /model-info             [Get model details]       │   │ │ │
│  │  │  └─────────────────────────────────────────────────────────┘   │ │ │
│  │  └──────────────────────────────────────────────────────────────────┘ │ │
│  │                                │                                       │ │
│  │                                ▼                                       │ │
│  │  ┌──────────────────────────────────────────────────────────────────┐ │ │
│  │  │            services/yolo_service.py                             │ │ │
│  │  │  ┌─────────────────────────────────────────────────────────┐   │ │ │
│  │  │  │  YOLOService Class                                     │   │ │ │
│  │  │  │  - Load model from weights file                        │   │ │ │
│  │  │  │  - Run inference (predict)                             │   │ │ │
│  │  │  │  - Parse detection results                             │   │ │ │
│  │  │  │  - Extract bounding boxes & confidence                 │   │ │ │
│  │  │  │  - Map class IDs to names                              │   │ │ │
│  │  │  └─────────────────────────────────────────────────────────┘   │ │ │
│  │  └──────────────────────────────────────────────────────────────────┘ │ │
│  │                                │                                       │ │
│  │                                ▼                                       │ │
│  │  ┌──────────────────────────────────────────────────────────────────┐ │ │
│  │  │            utils/image_utils.py                                 │ │ │
│  │  │  ┌─────────────────────────────────────────────────────────┐   │ │ │
│  │  │  │  save_uploaded_file()     - Save temp image            │   │ │ │
│  │  │  │  draw_detections_on_image() - Draw bounding boxes     │   │ │ │
│  │  │  │  image_to_base64()        - Encode for JSON           │   │ │ │
│  │  │  │  delete_file()            - Cleanup temp files        │   │ │ │
│  │  │  │  get_image_dimensions()   - Extract image size        │   │ │ │
│  │  │  └─────────────────────────────────────────────────────────┘   │ │ │
│  │  └──────────────────────────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                   │                                          │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
        ┌───────────────────────────────────────────────────────────┐
        │           YOLO Model (best.pt)                            │
        │          trained-model/weights/best.pt                    │
        │                                                           │
        │  YOLOv8 Neural Network                                   │
        │  Input: Image → Processing → Output: Detections         │
        │  Classes: Fire Extinguisher, First Aid Kit, etc.        │
        └───────────────────────────────────────────────────────────┘
```

---

## User Interaction Flow

```
START
  │
  ├─────── Select Mode ────────┬──────────────┐
  │                            │              │
  ▼                            ▼              ▼
[Upload]                   [Webcam]         [Health Check]
  │                            │              │
  ├─ Drag & drop              │              └─ curl /health
  ├─ Click browse             │
  └─ Select file              ▼
                           [Enable]
                             │
                             ├─ Request camera
                             └─ Show feed
  │           │
  │           └─ Allow permission
  │              │
  ▼              ▼
[Image Selected] [Ready to Capture]
  │               │
  │ Adjust         │ Adjust
  │ Confidence     │ Confidence
  │  [=============] │  [===========]
  │                  │
  └──┬───────────────┬──
     │               │
     ▼               ▼
[Click Detect]  [Click Capture]
     │               │
     └───────┬───────┘
             │
             ▼
    [Uploading... ⏳]
             │
             ▼
    POST /detect-image
             │
             ▼
    [Backend Processing]
             │
             ├─ Parse image
             ├─ Run inference
             ├─ Extract boxes
             ├─ Draw annotations
             └─ Encode base64
             │
             ▼
    JSON Response
    {detections, image, ...}
             │
             ▼
    [Display Results]
             │
             ├─ Show annotated image
             ├─ List detections
             ├─ Show confidence %
             └─ Show bbox coordinates
             │
             ├─────────────┬─────────────┐
             │             │             │
             ▼             ▼             ▼
        [Download]    [Reset]      [Re-detect]
             │             │             │
             └─────────────┴─────────────┘
                       │
                       ▼
                    END
```

---

## Data Flow Layers

```
┌─────────────────────────────────────────────────────────────────┐
│ Layer 1: User Interface                                         │
├─────────────────────────────────────────────────────────────────┤
│ React Component (DetectionInterface.jsx)                        │
│ - State management (image, results, error, loading)            │
│ - Event handlers (upload, webcam, detect)                      │
│ - Form creation (FormData with image + confidence)             │
└─────────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ Layer 2: Network Transport                                      │
├─────────────────────────────────────────────────────────────────┤
│ HTTP Request (POST /detect-image)                              │
│ - Multipart FormData encoding                                  │
│ - CORS headers                                                  │
│ - Network latency                                              │
└─────────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ Layer 3: Web Server                                             │
├─────────────────────────────────────────────────────────────────┤
│ Flask Application (app.py)                                      │
│ - Route matching                                                │
│ - CORS validation                                               │
│ - Request parsing                                               │
│ - Error handling                                                │
└─────────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ Layer 4: Business Logic                                         │
├─────────────────────────────────────────────────────────────────┤
│ Detection Route (routes/detect.py)                              │
│ - File validation                                               │
│ - Service invocation                                            │
│ - Response building                                             │
└─────────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ Layer 5: AI/ML Service                                          │
├─────────────────────────────────────────────────────────────────┤
│ YOLO Service (services/yolo_service.py)                         │
│ - Model inference                                               │
│ - Detection parsing                                             │
│ - Class mapping                                                 │
└─────────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ Layer 6: Utilities                                              │
├─────────────────────────────────────────────────────────────────┤
│ Image Utils (utils/image_utils.py)                              │
│ - File I/O (save, delete)                                       │
│ - Image processing (draw, encode)                               │
│ - Dimension extraction                                          │
└─────────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ Layer 7: Deep Learning Model                                    │
├─────────────────────────────────────────────────────────────────┤
│ YOLOv8 (best.pt)                                                │
│ - Neural network inference                                      │
│ - Bounding box prediction                                       │
│ - Confidence scoring                                            │
└─────────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ Layer 8: Response Building                                      │
├─────────────────────────────────────────────────────────────────┤
│ JSON Response Creation                                          │
│ - Detections array                                              │
│ - Base64 encoded image                                          │
│ - Metadata (dimensions, count)                                  │
└─────────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ Layer 9: Response Transport                                     │
├─────────────────────────────────────────────────────────────────┤
│ HTTP Response (200 OK)                                          │
│ - JSON serialization                                            │
│ - CORS headers                                                  │
│ - Network delivery                                              │
└─────────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ Layer 10: Result Display                                        │
├─────────────────────────────────────────────────────────────────┤
│ React State Update & Re-render                                  │
│ - Parse JSON response                                           │
│ - Update component state                                        │
│ - Render annotated image                                        │
│ - Display detection list                                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## State Time Diagram

```
Timeline: T0 → T1 → T2 → T3 → T4 → T5

T0: Initial State
┌─────────────────────────┐
│ image: null             │
│ loading: false          │
│ results: null           │
│ error: null             │
└─────────────────────────┘

T1: Image Selected
┌─────────────────────────┐
│ image: File object ✓    │
│ loading: false          │
│ results: null           │
│ error: null             │
└─────────────────────────┘
         │
         └─ User clicks "Detect"

T2: Request Sent
┌─────────────────────────┐
│ image: File object      │
│ loading: true ⏳        │
│ results: null           │
│ error: null             │
│ [Uploading...]          │
└─────────────────────────┘
         │
         └─ Network + Backend Processing

T3: Response Received
┌─────────────────────────┐
│ image: File object      │
│ loading: false          │
│ results: {...} ✓        │
│ error: null             │
│ [Display Results]       │
└─────────────────────────┘
         │
         └─ User clicks "Reset"

T4: Reset State
┌─────────────────────────┐
│ image: null             │
│ loading: false          │
│ results: null           │
│ error: null             │
└─────────────────────────┘

T5: New Image Selected
[Same as T1...]
```

---

## Request/Response Packet Structure

```
REQUEST:
─────────────────────────────────────────────────────────
POST /detect-image HTTP/1.1
Host: localhost:5000
Content-Type: multipart/form-data; boundary=----BOUNDARY

------BOUNDARY
Content-Disposition: form-data; name="image"; filename="photo.jpg"
Content-Type: image/jpeg

[Binary Image Data]
------BOUNDARY
Content-Disposition: form-data; name="confidence"

0.5
------BOUNDARY--
─────────────────────────────────────────────────────────

RESPONSE:
─────────────────────────────────────────────────────────
HTTP/1.1 200 OK
Content-Type: application/json
Access-Control-Allow-Origin: http://localhost:5173

{
  "detections": [
    {
      "class": "Fire Extinguisher",
      "confidence": 0.92,
      "bbox": [100.5, 50.2, 75.3, 150.8],
      "class_id": 0
    },
    {
      "class": "First Aid Kit",
      "confidence": 0.87,
      "bbox": [250.0, 120.0, 60.0, 80.0],
      "class_id": 1
    }
  ],
  "image": "iVBORw0KGgoAAAANSUhEUgAA...[base64 PNG data]...==",
  "image_dimensions": {
    "width": 640,
    "height": 480
  },
  "confidence_threshold": 0.5,
  "detection_count": 2
}
─────────────────────────────────────────────────────────
```

---

## Component Hierarchy

```
App.jsx
  │
  └─ DetectionInterface.jsx
      │
      ├─ State Hooks
      │  ├─ selectedImage
      │  ├─ loading
      │  ├─ error
      │  ├─ detectionResult
      │  ├─ confidence
      │  ├─ mode
      │  ├─ webcamActive
      │  ├─ classes
      │  └─ modelInfo
      │
      ├─ Effect Hooks
      │  └─ fetchModelInfo() on mount
      │
      ├─ Event Handlers
      │  ├─ handleFileSelect()
      │  ├─ handleUpload()
      │  ├─ toggleWebcam()
      │  ├─ captureFromWebcam()
      │  ├─ handleReset()
      │  └─ downloadImage()
      │
      └─ Render Elements
         ├─ Header Section
         ├─ Mode Selector
         ├─ Error Display
         ├─ Upload Section (conditional)
         │  ├─ Drag & Drop Box
         │  └─ File Info Display
         ├─ Webcam Section (conditional)
         │  ├─ Video Element
         │  ├─ Canvas (hidden)
         │  └─ Controls
         ├─ Confidence Slider
         ├─ Action Buttons
         ├─ Results Section (conditional)
         │  ├─ Detected Image
         │  ├─ Statistics
         │  └─ Detections List
         └─ Loading Overlay (conditional)
```

---

## File Organization Strategy

```
BACKEND STRUCTURE:
app.py (Core)
  ├─ imports & initialization
  ├─ CORS configuration
  ├─ model loading
  └─ error handling

routes/ (API Layer)
  └─ detect.py
      ├─ POST /detect-image
      ├─ GET /health
      ├─ GET /classes
      └─ GET /model-info

services/ (Business Logic)
  └─ yolo_service.py
      ├─ Model initialization
      ├─ Inference logic
      ├─ Result parsing
      └─ Class mapping

utils/ (Helpers)
  └─ image_utils.py
      ├─ File operations
      ├─ Image processing
      └─ Encoding

FRONTEND STRUCTURE:
components/
  └─ DetectionInterface.jsx
      ├─ State & refs
      ├─ Data fetching
      ├─ Event handlers
      ├─ Webcam logic
      └─ Render & UI

styles/
  └─ DetectionInterface.css
      ├─ Layout
      ├─ Components
      ├─ Animations
      └─ Responsive design
```

---

This visual guide helps understand the complete system architecture, data flow, and component relationships!

*Built with detailed architectural consideration for scalability and maintainability* ✨
