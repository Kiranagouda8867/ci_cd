# Flask + YOLOv8 Object Detection Backend

Production-ready Flask backend for YOLOv8 object detection with REST API.

## 📋 Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     React Frontend (Vite)                       │
│                    (Upload/Webcam Capture)                      │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       │ HTTP POST /detect-image
                       │ (FormData: image file + confidence)
                       ▼
┌──────────────────────────────────────────────────────────────────┐
│                    Flask Backend (Python)                        │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  app.py                                                    │  │
│  │  - CORS enabled (localhost:5173, 5000)                    │  │
│  │  - model initialized at startup                           │  │
│  │  - request handling & error management                    │  │
│  └────────────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  routes/detect.py                                          │  │
│  │  - GET /health                                             │  │
│  │  - POST /detect-image                                      │  │
│  │  - GET /classes                                            │  │
│  │  - GET /model-info                                         │  │
│  └────────────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  services/yolo_service.py                                  │  │
│  │  - YOLOService class                                       │  │
│  │  - model.predict()                                         │  │
│  │  - parse results & extract boxes                           │  │
│  │  - class name mapping                                      │  │
│  └────────────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  utils/image_utils.py                                      │  │
│  │  - save_uploaded_file()                                    │  │
│  │  - delete_file()                                           │  │
│  │  - draw_detections_on_image()                              │  │
│  │  - image_to_base64()                                       │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
                       │
                       │ Returns JSON (base64 image + detections)
                       ▼
┌──────────────────────────────────────────────────────────────────┐
│                   YOLOv8 Model (best.pt)                         │
│               (trained-model/weights/best.pt)                    │
└──────────────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- pip (Python package manager)
- trained YOLOv8 model at `backend/trained-model/weights/best.pt`

### 1. Backend Setup

```bash
# Navigate to backend folder
cd backend

# Create virtual environment (optional but recommended)
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Start Flask Server

```bash
# From backend directory
python app.py
```

Expected output:
```
 * Running on http://0.0.0.0:5000
 * CORS enabled for localhost:5173, localhost:3000
 * Model loaded successfully: best.pt
```

### 3. Frontend Setup

```bash
# In a new terminal, navigate to frontend folder
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:5173`

## 📡 API Endpoints

### 1. Health Check
```
GET http://localhost:5000/health
```

**Response:**
```json
{
  "status": "running",
  "model_loaded": true
}
```

### 2. Detect Objects in Image
```
POST http://localhost:5000/detect-image
```

**Request (FormData):**
- `image` (file): Image file to detect
- `confidence` (float, optional): Confidence threshold 0.0-1.0 (default: 0.5)

**Response:**
```json
{
  "detections": [
    {
      "class": "Fire Extinguisher",
      "confidence": 0.92,
      "bbox": [100.5, 50.2, 75.3, 150.8],
      "class_id": 0
    }
  ],
  "image": "base64_encoded_png...",
  "image_dimensions": {
    "width": 640,
    "height": 480
  },
  "confidence_threshold": 0.5,
  "detection_count": 1
}
```

### 3. Get Classes
```
GET http://localhost:5000/classes
```

**Response:**
```json
{
  "classes": {
    "0": "Fire Extinguisher",
    "1": "First Aid Kit",
    "2": "Caution Sign"
  },
  "class_count": 3
}
```

### 4. Get Model Info
```
GET http://localhost:5000/model-info
```

**Response:**
```json
{
  "model_loaded": true,
  "classes": {...},
  "class_count": 3
}
```

## 📁 Project Structure

```
backend/
├── app.py                    # Main Flask application
├── requirements.txt          # Python dependencies
├── routes/
│   └── detect.py            # Detection endpoints
├── services/
│   └── yolo_service.py      # YOLO inference service
├── utils/
│   └── image_utils.py       # Image processing utilities
├── uploads/                 # Temporary uploaded files (auto-cleanup)
└── trained-model/
    └── weights/
        └── best.pt          # YOLOv8 model weights
```

## 🔧 Configuration

### Model Path
Currently configured in `app.py`:
```python
model_path = os.path.join(os.path.dirname(__file__), 'trained-model', 'weights', 'best.pt')
```

### CORS Settings
Configured for local development:
```python
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:5173", "http://localhost:3000"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})
```

**To change for production**, modify in `app.py`:
```python
CORS(app, resources={
    r"/*": {
        "origins": ["https://your-frontend-domain.com"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})
```

### File Upload Limit
Default: 16MB
To change, modify in `app.py`:
```python
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # Change this value
```

### Device (CPU/GPU)
Currently set to CPU. To enable GPU, modify in `app.py`:
```python
yolo_service = YOLOService(model_path, device='cuda')
```

## ⚙️ Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| Flask | 2.3.3 | Web framework |
| Flask-CORS | 4.0.0 | CORS support |
| ultralytics | 8.0.205 | YOLOv8 model inference |
| opencv-python | 4.8.1.78 | Image processing |
| Pillow | 10.0.1 | Image encoding |
| numpy | 1.24.3 | Array operations |
| torch | 2.0.1 | Deep learning framework |
| torchvision | 0.15.2 | Vision utilities |

## 🐛 Troubleshooting

### Issue: Model not found
```
FileNotFoundError: Model not found at: backend/trained-model/weights/best.pt
```
**Solution:** Ensure your trained model is at the correct path

### Issue: Port 5000 already in use
```
Address already in use
```
**Solution:** Change port in `app.py`:
```python
app.run(host='0.0.0.0', port=5001, debug=True)
```

### Issue: CORS error in frontend
```
Access to XMLHttpRequest has been blocked by CORS policy
```
**Solution:** Check CORS configuration in `app.py` includes your frontend URL

### Issue: Slow inference on CPU
**Solution:** Use GPU by installing CUDA and changing device to 'cuda' in `app.py`

### Issue: Out of memory
**Solution:** Reduce image size or use smaller model variant

## 📊 Performance Tips

1. **Use GPU**: 10-50x faster inference (requires CUDA)
2. **Batch Processing**: Process multiple images together
3. **Model Size**: Use smaller YOLOv8n or YOLOv8s instead of large variants
4. **Image Resize**: Process at lower resolution if accuracy allows

## 🔒 Production Deployment

### Before deploying:

1. **Disable Flask debug mode** in `app.py`:
   ```python
   app.run(debug=False)
   ```

2. **Use production WSGI server**:
   ```bash
   pip install gunicorn
   gunicorn -w 4 -b 0.0.0.0:5000 app:app
   ```

3. **Update CORS origins** to your production domain

4. **Add authentication** if needed:
   ```python
   from flask_httpauth import HTTPBasicAuth
   auth = HTTPBasicAuth()
   ```

5. **Add request validation** and rate limiting:
   ```bash
   pip install Flask-Limiter
   ```

6. **Use environment variables**:
   ```python
   import os
   MODEL_PATH = os.getenv('MODEL_PATH', 'trained-model/weights/best.pt')
   ```

## 📝 Example Usage

### Using cURL
```bash
curl -X POST http://localhost:5000/detect-image \
  -F "image=@/path/to/image.jpg" \
  -F "confidence=0.5"
```

### Using Python
```python
import requests

with open('image.jpg', 'rb') as f:
    files = {'image': f}
    data = {'confidence': 0.5}
    response = requests.post('http://localhost:5000/detect-image', files=files, data=data)
    result = response.json()
    print(result['detections'])
```

### Using JavaScript (fetch)
```javascript
const formData = new FormData();
formData.append('image', imageFile);
formData.append('confidence', 0.5);

const response = await fetch('http://localhost:5000/detect-image', {
  method: 'POST',
  body: formData
});
const result = await response.json();
console.log(result.detections);
```

## 📚 Resources

- [YOLOv8 Documentation](https://docs.ultralytics.com/)
- [Flask Documentation](https://flask.palletsprojects.com/)
- [OpenCV Documentation](https://docs.opencv.org/)
- [Ultralytics GitHub](https://github.com/ultralytics/ultralytics)

## 📄 License

This project uses YOLOv8 from Ultralytics under the AGPL-3.0 license.

## 🤝 Contributing

Improve this backend by:
- Adding batch processing support
- Implementing model caching for multiple outputs
- Adding WebSocket support for real-time detection
- Creating model fine-tuning endpoints

---

Built with ❤️ for real-world object detection
