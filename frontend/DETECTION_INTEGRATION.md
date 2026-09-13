# Frontend Integration Guide

Comprehensive guide for integrating the React frontend with the Flask YOLOv8 backend.

## 🎯 What's Included

### New Components
- **DetectionInterface.jsx** - Complete UI for image upload, webcam capture, and detection results

### New Styles
- **styles/DetectionInterface.css** - Modern, responsive styling with animations

## 🚀 Installation

### 1. Copy Files
The component and styles have been created in:
```
frontend/
├── src/
│   ├── components/
│   │   └── DetectionInterface.jsx  ✓ NEW
│   └── styles/
│       └── DetectionInterface.css  ✓ NEW
```

### 2. Update App.jsx

Add the DetectionInterface to your main app:

```jsx
import DetectionInterface from './components/DetectionInterface';

function App() {
  return (
    <div className="App">
      <DetectionInterface />
    </div>
  );
}

export default App;
```

### 3. Install Dependencies (if not already installed)
```bash
cd frontend
npm install
```

## 📡 API Integration

### Backend URL Configuration
Edit `DetectionInterface.jsx` to change the backend URL:

```jsx
const BACKEND_URL = 'http://localhost:5000'; // Change this for production
```

### Endpoints Used
- `GET /health` - Check if backend is running
- `GET /model-info` - Load available classes
- `GET /classes` - Get class labels
- `POST /detect-image` - Run detection on uploaded image

## ✨ Features

### 1. Image Upload
- Drag & drop support
- Click to browse
- File validation (image types only)
- Size limit: 16MB

### 2. Webcam Capture
- Real-time webcam feed
- Capture button to grab frame
- Full screen support
- Mobile-friendly

### 3. Confidence Threshold
- Slider to adjust detection confidence (0-100%)
- Real-time updates
- Filters low-confidence detections

### 4. Detection Results
- Annotated image with bounding boxes
- Detection statistics
- List of detected objects with:
  - Class name
  - Confidence percentage
  - Bounding box coordinates
- Download button for result image

### 5. Error Handling
- Invalid file types blocked
- File size validation
- Network error messages
- Graceful fallbacks

## 🎨 Customization

### Change Primary Colors
In `DetectionInterface.css`, update gradient colors:

```css
/* Change from: */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* To your brand colors: */
background: linear-gradient(135deg, #FF6B6B 0%, #4ECDC4 100%);
```

### Change Detection Colors (Bounding Boxes)
In `utils/image_utils.py`, modify the color map:

```python
colors = {
    0: (0, 255, 0),      # Class 0 - Green
    1: (255, 0, 0),      # Class 1 - Blue
    2: (0, 0, 255),      # Class 2 - Red
    # Add more classes as needed
}
```

### Adjust Confidence Default
In `DetectionInterface.jsx`:

```jsx
const [confidence, setConfidence] = useState(0.5); // Change default value
```

## 📱 Mobile Support

The component is fully responsive:
- Mobile upload UI
- Webcam works on mobile Safari
- Touch-friendly buttons
- Optimized layout for small screens

Test on mobile:
```bash
npm run dev
# Visit http://your-ip:5173 on phone
```

## 🔄 Data Flow

```
User Action
    ↓
1. Select Image (upload or webcam)
    ↓
2. Set Confidence Threshold
    ↓
3. Click "Detect Objects"
    ↓
4. FormData sent to /detect-image
    ↓
5. Backend processes image with YOLOv8
    ↓
6. Response includes:
   - Annotated image (base64)
   - Detection results (JSON)
   - Image dimensions
    ↓
7. Display results in UI
    ↓
8. User can download or redetect
```

## 🧪 Testing

### Test 1: Health Check
```javascript
// In browser console
fetch('http://localhost:5000/health')
  .then(r => r.json())
  .then(d => console.log(d))
```

### Test 2: Get Model Info
```javascript
fetch('http://localhost:5000/model-info')
  .then(r => r.json())
  .then(d => console.log(d))
```

### Test 3: Upload Image
Use the DetectionInterface UI directly

### Test 4: Webcam
Click "Webcam" mode and "Enable Webcam"

## ⚠️ Common Issues

### Issue: "Failed to fetch" / CORS error
```
Access to XMLHttpRequest at 'http://localhost:5000/detect-image' 
from origin 'http://localhost:5173' has been blocked by CORS policy
```

**Solution:** Make sure Flask backend is running and CORS is configured correctly:
```python
# In app.py
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:5173"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})
```

### Issue: Webcam doesn't work
```
NotAllowedError: Permission denied
```

**Solution:** 
- Check browser permissions for camera
- HTTPS required in production (or localhost)
- Some browsers need site to be served over HTTPS

### Issue: Image not displaying in results
**Solution:** Check that base64 field is properly formatted by testing endpoint:
```javascript
const formData = new FormData();
formData.append('image', fileInput.files[0]);
fetch('http://localhost:5000/detect-image', { method: 'POST', body: formData })
  .then(r => r.json())
  .then(d => console.log(d.image.substring(0, 100)))
```

## 🚀 Production Deployment

### Update Backend URL
```jsx
const BACKEND_URL = 'https://your-api-domain.com';
```

### Enable HTTPS
```python
# In app.py for production
CORS(app, resources={
    r"/*": {
        "origins": ["https://your-frontend-domain.com"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"],
        "supports_credentials": True
    }
})
```

### Build Frontend
```bash
npm run build
# Output: dist/ folder ready for deployment
```

## 📊 Performance Optimization

### 1. Image Compression Before Upload
Add to component:
```javascript
const compressImage = (file) => {
  const canvas = document.createElement('canvas');
  // ... compression logic
};
```

### 2. Lazy Loading Results
```javascript
// Images load as visible
<img src={...} loading="lazy" />
```

### 3. Request Cancellation
```javascript
const abortController = new AbortController();
fetch(url, { signal: abortController.signal })
```

## 📚 Component Props (if converted to reusable)

```jsx
<DetectionInterface 
  backendUrl="http://localhost:5000"
  maxFileSize={16 * 1024 * 1024}
  defaultConfidence={0.5}
  onDetectionComplete={(results) => {}}
  onError={(error) => {}}
/>
```

## 🔐 Security Considerations

1. **Input Validation**: File type and size checked
2. **CORS**: Restricted to known origins
3. **File Cleanup**: Temporary files deleted after processing
4. **Error Messages**: Generic messages to prevent info leakage

For production, consider:
- Rate limiting
- Authentication/Authorization
- Input sanitization
- HTTPS only
- Security headers (CSP, X-Frame-Options, etc.)

## 📞 Support

Issues related to:
- **Backend**: See `/backend/README.md`
- **React/Frontend**: Check `/frontend` documentation
- **Styling**: Modify `DetectionInterface.css`
- **API Connection**: Check CORS and backend URL

---

Happy detecting! 🎯
