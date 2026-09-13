# 🚀 Quick Start Guide - Flask + YOLOv8 Full Stack

Complete setup and running instructions for the object detection system.

## 📋 Prerequisites

- **Python 3.8+** - [Download](https://www.python.org/)
- **Node.js 16+** - [Download](https://nodejs.org/)
- **YOLOv8 Model** - `best.pt` at `backend/trained-model/weights/best.pt`

## ⚡ 5-Minute Setup

### Phase 1: Backend Setup (2 minutes)

**Windows:**
```bash
cd backend
setup.bat
```

**macOS/Linux:**
```bash
cd backend
chmod +x setup.sh
./setup.sh
```

**Manual Setup:**
```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
```

### Phase 2: Start Backend (1 minute)

```bash
# Ensure you're in backend directory with venv activated
python app.py
```

Expected output:
```
═══════════════════════════════════════════════════════════════
* Running on http://0.0.0.0:5000
✓ YOLO service initialized successfully
═══════════════════════════════════════════════════════════════
```

### Phase 3: Frontend Setup (2 minutes)

**In a NEW terminal:**
```bash
cd frontend
npm install
npm run dev
```

Expected output:
```
VITE v4.x.x  ready in 200 ms

➜  Local:   http://localhost:5173/
➜  press h to show help
```

## ✅ Verify Everything Works

### 1. Check Backend Health
```bash
# In another terminal
curl http://localhost:5000/health

# Expected response:
# {"status": "running", "model_loaded": true}
```

### 2. Open Frontend
Visit: **http://localhost:5173**

You should see the Detection Interface with:
- ✓ "Model ready" status message
- Upload box for images
- Webcam toggle button

### 3. Test Detection
1. Click the upload box
2. Select an image from your computer
3. Click "🚀 Detect Objects"
4. Wait for results (10-30 seconds depending on hardware)
5. View detected objects with bounding boxes

## 📂 File Structure

**What was created:**

```
✅ backend/
   ├── app.py                      ← Main Flask app (START HERE)
   ├── requirements.txt            ← Python packages
   ├── setup.bat                   ← Windows setup script
   ├── setup.sh                    ← macOS/Linux setup script
   ├── README.md                   ← Backend documentation
   ├── .env.example                ← Configuration template
   ├── routes/
   │   └── detect.py              ← Detection endpoints
   ├── services/
   │   └── yolo_service.py        ← YOLO inference
   ├── utils/
   │   └── image_utils.py         ← Image processing
   ├── uploads/                    ← Temp files (auto-cleanup)
   └── trained-model/
       └── weights/
           └── best.pt            ← Your model

✅ frontend/
   ├── src/
   │   ├── components/
   │   │   └── DetectionInterface.jsx    ← NEW UI Component
   │   └── styles/
   │       └── DetectionInterface.css    ← NEW Styles
   └── DETECTION_INTEGRATION.md    ← Integration guide
```

## 🔗 API Endpoints (Reference)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/health` | Check if backend is running |
| POST | `/detect-image` | Run detection on image |
| GET | `/classes` | Get available class labels |
| GET | `/model-info` | Get model information |

### Example Request
```bash
curl -X POST http://localhost:5000/detect-image \
  -F "image=@photo.jpg" \
  -F "confidence=0.5"
```

## 🎮 Using the Interface

### Upload Mode
1. Drag & drop image OR click to browse
2. Adjust confidence threshold (0-100%)
3. Click "🚀 Detect Objects"
4. View results with bounding boxes
5. Download image with annotations

### Webcam Mode
1. Click "📹 Webcam" tab
2. Click "📹 Enable Webcam"
3. Allow camera permission
4. Click "📷 Capture" to detect
5. Click "❌ Stop" to disable

## ⚙️ Configure for Your Setup

### Change Backend Port
Edit `backend/app.py`:
```python
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)  # Change 5000 to 5001
```

### Update Frontend API URL
Edit `frontend/src/components/DetectionInterface.jsx`:
```jsx
const BACKEND_URL = 'http://your-server-ip:5000';  // Change this
```

### Use GPU Instead of CPU
Edit `backend/app.py`:
```python
yolo_service = YOLOService(model_path, device='cuda')  # Change cpu to cuda
```

Requires: CUDA 11.0+ and `torch[cu118]`

## 🐛 Troubleshooting

### ❌ "Model not found"
```
FileNotFoundError: Model not found at: backend/trained-model/weights/best.pt
```
**Solution:** Copy your trained model to that exact path

### ❌ "Port 5000 already in use"
```
Address already in use
```
**Solution:** 
- Kill existing process: `lsof -ti:5000 | xargs kill` (macOS/Linux)
- Or change port in `app.py`

### ❌ CORS Error in Browser
```
Access to XMLHttpRequest blocked by CORS policy
```
**Solution:** 
- Ensure Flask backend is running
- Check CORS config in `app.py`
- Verify frontend URL matches CORS origins

### ❌ Webcam doesn't work
```
NotAllowedError: Permission denied
```
**Solution:**
- Grant camera permission in browser
- Use HTTPS in production (localhost is exception)
- Try Chrome/Firefox (some browsers have better support)

### ❌ Slow detection
**Solution Options:**
1. Use GPU: Change `device='cuda'`
2. Reduce image size before upload
3. Use smaller YOLO model (n, s instead of m, l)

## 📊 Performance Tips

| Setup | Speed | Cost |
|-------|-------|------|
| CPU (Intel i7) | ~5-10 sec/image | Low |
| GPU (GTX 1660) | ~0.5-1 sec/image | Medium |
| GPU (RTX 4090) | ~0.05-0.1 sec/image | High |

## 🔒 Production Deployment

### Backend
```bash
# Use production WSGI server
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app

# Or with Nginx reverse proxy
```

### Frontend
```bash
npm run build
# Upload 'dist/' folder to web server
```

### SSL/HTTPS
- Use Let's Encrypt (free)
- Configure Nginx/Apache
- Update CORS and API URLs to use `https://`

## 📚 Full Documentation

- **Backend**: See [backend/README.md](backend/README.md)
- **Frontend**: See [frontend/DETECTION_INTEGRATION.md](frontend/DETECTION_INTEGRATION.md)

## 🎯 Next Steps

1. ✅ Verify backend is running (`/health`)
2. ✅ Test detection with sample image
3. ✅ Customize confidence threshold
4. ✅ Try webcam detection
5. ✅ Adjust CORS for your domain
6. ✅ Deploy to production

## 📞 Support Checklist

If something doesn't work:

- [ ] Backend running? `curl http://localhost:5000/health`
- [ ] Frontend running? Check `http://localhost:5173`
- [ ] Model exists? Check `backend/trained-model/weights/best.pt`
- [ ] No Python errors? Check terminal output
- [ ] CORS enabled? Check `app.py` configuration
- [ ] Right Python version? `python --version` (3.8+)
- [ ] All deps installed? `pip list | grep flask`

## 🎨 Customize the Look

See [frontend/DETECTION_INTEGRATION.md](frontend/DETECTION_INTEGRATION.md#customize) for:
- Change colors
- Modify bounding box colors
- Adjust detection class colors
- Responsive layout tweaks

## 🚀 Scaling Tips

For production with many users:

1. **Load Balancing**: Use Nginx to distribute requests
2. **Horizontal Scaling**: Run multiple Flask instances
3. **GPU Inference**: Use cloud GPUs (AWS/Azure/GCP)
4. **Caching**: Cache detection results for same images
5. **Queue System**: Use Redis + Celery for async processing

## 📝 Quick Commands Reference

```bash
# Backend
cd backend
venv\Scripts\activate              # Windows
source venv/bin/activate           # macOS/Linux
python app.py                      # Start server

# Frontend
cd frontend
npm install                        # First time only
npm run dev                        # Start dev server
npm run build                      # Build for production

# Testing
curl http://localhost:5000/health  # Check backend
curl http://localhost:5000/classes # Get labels
```

## ✨ Features Summary

- ✅ Upload images (drag & drop)
- ✅ Webcam capture (real-time)
- ✅ Adjustable confidence threshold
- ✅ Annotated output images
- ✅ Class labels with confidence scores
- ✅ Download detected images
- ✅ Responsive mobile design
- ✅ Error handling & validation
- ✅ Production-ready architecture
- ✅ CORS enabled
- ✅ Detailed logging
- ✅ Clean, modular code

## 🎓 Learning Resources

- [YOLOv8 Docs](https://docs.ultralytics.com/)
- [Flask Guide](https://flask.palletsprojects.com/)
- [React Docs](https://react.dev/)
- [REST API Best Practices](https://restfulapi.net/)

---

### 🎉 You're all set! Happy detecting! 🎯

Need help? Check the full README files or raise an issue.
