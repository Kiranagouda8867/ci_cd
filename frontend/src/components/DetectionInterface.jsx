import { useState, useRef, useEffect } from 'react';
import '../styles/DetectionInterface.css';
import { speakDetections, testVoice, initializeVoices } from '../utils/speech';
import { playSuccessSound, playErrorSound } from '../utils/sound';
import Toast from './Toast';

/**
 * DetectionInterface Component
 * Handles image upload, webcam capture, and displays detection results
 */
const DetectionInterface = () => {
  // State management
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [detectionResult, setDetectionResult] = useState(null);
  const [confidence, setConfidence] = useState(0.5);
  const [mode, setMode] = useState('upload'); // 'upload' or 'webcam'
  const [webcamActive, setWebcamActive] = useState(false);
  const [classes, setClasses] = useState({});
  const [modelInfo, setModelInfo] = useState(null);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [toast, setToast] = useState(null);

  // Refs
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const BACKEND_URL = 'http://localhost:5000';

  // Fetch model information on component mount
  useEffect(() => {
    fetchModelInfo();
    initializeVoices(); // Initialize voice synthesis on component mount
  }, []);

  /**
   * Fetch available classes and model info from backend
   */
  const fetchModelInfo = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/model-info`);
      if (!response.ok) throw new Error('Failed to fetch model info');

      const data = await response.json();
      setClasses(data.classes);
      setModelInfo(data);
    } catch (err) {
      console.error('Error fetching model info:', err);
      // Still allow upload even if model info fails
    }
  };

  /**
   * Handle file selection from input
   */
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      validateAndSetImage(file);
    }
  };

  /**
   * Validate and set image
   */
  const validateAndSetImage = (file) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

    if (!validTypes.includes(file.type)) {
      setError('Invalid file type. Please upload an image.');
      return;
    }

    if (file.size > 16 * 1024 * 1024) {
      setError('File size too large. Maximum 16MB.');
      return;
    }

    setError(null);
    setSelectedImage(file);
    setDetectionResult(null);
  };

  /**
   * Convert number to words
   */
  const numberToWords = (num) => {
    const ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
    if (num < 10) return ones[num];
    if (num < 100) return 'multiple';
    return 'many';
  };

  /**
   * Send image to backend for detection
   */
  const sendImageForDetection = async (imageFile) => {
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('confidence', confidence);

      const response = await fetch(`${BACKEND_URL}/detect-image`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Detection failed');
      }

      const result = await response.json();
      setDetectionResult(result);
      
      // Show visual notification of detected objects
      if (result.detections && result.detections.length > 0) {
        const detectedNames = result.detections.map(d => d.class.replace(/_/g, ' ')).join(', ');
        const notificationMessage = `✅ Detected: ${detectedNames}`;
        setToast({
          message: notificationMessage,
          type: 'success',
          duration: 5000
        });
        console.log('📢 DETECTION ANNOUNCEMENT:', notificationMessage);
        
        // Play success sound feedback
        playSuccessSound();
      } else {
        setToast({
          message: '⚠️ No objects detected. Try with different lighting or confidence threshold.',
          type: 'warning',
          duration: 4000
        });
        playErrorSound();
      }
      
      // Trigger voice announcement if enabled - await to ensure speech completes
      if (voiceEnabled && result.detections && result.detections.length > 0) {
        const classNames = result.detections.map(d => d.class.replace(/_/g, ' '));
        console.log('🎯 Detection complete. Triggering voice with classes:', classNames);
        try {
          await speakDetections(classNames);
        } catch (error) {
          console.error('Voice announcement failed:', error);
        }
      } else {
        console.log('⚠️ Voice not triggered:', { voiceEnabled, detectionsCount: result.detections?.length });
      }
    } catch (err) {
      setError(`Detection error: ${err.message}`);
      console.error('Detection error:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle upload button click
   */
  const handleUpload = async () => {
    if (!selectedImage) {
      setError('Please select an image first');
      return;
    }
    await sendImageForDetection(selectedImage);
  };

  /**
   * Handle drag and drop
   */
  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
  };

  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove('drag-over');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');

    const file = e.dataTransfer.files[0];
    if (file) {
      validateAndSetImage(file);
    }
  };

  /**
   * Toggle webcam
   */
  const toggleWebcam = async () => {
    if (!webcamActive) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        });
        videoRef.current.srcObject = stream;
        setWebcamActive(true);
        setError(null);
      } catch (err) {
        setError('Unable to access webcam. Check permissions.');
        console.error('Webcam error:', err);
      }
    } else {
      // Stop webcam
      const stream = videoRef.current.srcObject;
      stream.getTracks().forEach((track) => track.stop());
      setWebcamActive(false);
    }
  };

  /**
   * Capture image from webcam
   */
  const captureFromWebcam = async () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    const video = videoRef.current;

    // Set canvas dimensions
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0);

    // Convert canvas to blob
    canvas.toBlob(async (blob) => {
      const file = new File([blob], 'webcam_capture.png', { type: 'image/png' });
      await sendImageForDetection(file);
    }, 'image/png');
  };

  /**
   * Reset state
   */
  const handleReset = () => {
    setSelectedImage(null);
    setDetectionResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  /**
   * Download detected image
   */
  const downloadImage = () => {
    if (!detectionResult?.image) return;

    const link = document.createElement('a');
    link.href = `data:image/png;base64,${detectionResult.image}`;
    link.download = `detection_${Date.now()}.png`;
    link.click();
  };

  return (
    <div className="detection-interface">
      {/* Toast Notification */}
      {toast && <Toast message={toast.message} duration={toast.duration} type={toast.type} />}
      
      <div className="detection-container">
        {/* Header */}
        <div className="detection-header">
          <h1>🎯 Object Detection</h1>
          {modelInfo && (
            <p className="model-status">
              ✓ Model ready • {modelInfo.class_count} classes
            </p>
          )}
        </div>

        {/* Mode Selector */}
        <div className="mode-selector">
          <button
            className={`mode-btn ${mode === 'upload' ? 'active' : ''}`}
            onClick={() => setMode('upload')}
          >
            📤 Upload Image
          </button>
          <button
            className={`mode-btn ${mode === 'webcam' ? 'active' : ''}`}
            onClick={() => setMode('webcam')}
          >
            📹 Webcam
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-message">
            <span>⚠️</span> {error}
          </div>
        )}

        {/* Upload Mode */}
        {mode === 'upload' && (
          <div className="upload-section">
            <div
              className="upload-box"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="upload-content">
                <div className="upload-icon">📸</div>
                <p>Drag & drop your image here</p>
                <p className="upload-hint">or click to select</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
            </div>

            {selectedImage && (
              <div className="selected-file">
                ✓ {selectedImage.name} ({(selectedImage.size / 1024).toFixed(2)} KB)
              </div>
            )}
          </div>
        )}

        {/* Webcam Mode */}
        {mode === 'webcam' && (
          <div className="webcam-section">
            {!webcamActive ? (
              <button className="btn btn-primary" onClick={toggleWebcam}>
                📹 Enable Webcam
              </button>
            ) : (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="webcam-video"
                />
                <div className="webcam-controls">
                  <button className="btn btn-success" onClick={captureFromWebcam}>
                    📷 Capture
                  </button>
                  <button className="btn btn-danger" onClick={toggleWebcam}>
                    ❌ Stop
                  </button>
                </div>
              </>
            )}
            <canvas ref={canvasRef} style={{ display: 'none' }} />
          </div>
        )}

        {/* Confidence Slider */}
        <div className="confidence-control">
          <label>
            Confidence Threshold: <strong>{(confidence * 100).toFixed(0)}%</strong>
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={confidence}
            onChange={(e) => setConfidence(parseFloat(e.target.value))}
            disabled={loading}
          />
        </div>

        {/* Voice Control */}
        <div className="voice-control">
          <div className="voice-buttons">
            <button
              className={`voice-btn ${voiceEnabled ? 'active' : ''}`}
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              title={voiceEnabled ? 'Click to disable voice' : 'Click to enable voice'}
            >
              {voiceEnabled ? '🔊' : '🔇'} {voiceEnabled ? 'Voice ON' : 'Voice OFF'}
            </button>
            <button
              className="voice-btn test-voice-btn"
              onClick={() => {
                console.log('🧪 Test voice button clicked');
                testVoice();
              }}
              title="Click to test voice announcement"
            >
              🔊 Test Voice
            </button>
          </div>
          <span className="voice-info">
            {voiceEnabled ? '✓ Equipment will be announced when detected' : '✗ Voice disabled'}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          {selectedImage && !detectionResult && (
            <button
              className="btn btn-primary"
              onClick={handleUpload}
              disabled={loading}
            >
              {loading ? '⏳ Detecting...' : '🚀 Detect Objects'}
            </button>
          )}
          {(selectedImage || detectionResult) && (
            <button className="btn btn-secondary" onClick={handleReset}>
              🔄 Reset
            </button>
          )}
        </div>

        {/* Detection Results */}
        {detectionResult && (
          <div className="results-section">
            {console.log('✓ Rendering results section. Detections count:', detectionResult.detections?.length)}
            <h2>Detection Results</h2>

            {/* Detected Image */}
            <div className="detected-image-container">
              <img
                src={`data:image/png;base64,${detectionResult.image}`}
                alt="Detection Result"
                className="detected-image"
              />
              <button className="btn btn-small" onClick={downloadImage}>
                ⬇️ Download
              </button>
            </div>

            {/* Detection Stats */}
            <div className="detection-stats">
              <div className="stat">
                <span className="stat-label">Objects Found:</span>
                <span className="stat-value">{detectionResult.detection_count}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Image Size:</span>
                <span className="stat-value">
                  {detectionResult.image_dimensions.width} ×{' '}
                  {detectionResult.image_dimensions.height}
                </span>
              </div>
            </div>

            {/* Detections List */}
            {detectionResult.detections.length > 0 ? (
              <>
                <div className="detections-list">
                  <h3>Detected Objects</h3>
                  {detectionResult.detections.map((detection, idx) => (
                    <div key={idx} className="detection-item">
                      <div className="detection-label">{detection.class}</div>
                      <div className="detection-info">
                        <span className="confidence-badge">
                          {(detection.confidence * 100).toFixed(1)}%
                        </span>
                        <span className="bbox">
                          Box: [{detection.bbox.map((v) => v.toFixed(0)).join(', ')}]
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Speak Results Button */}
                <button
                  className="btn btn-voice"
                  onClick={() => {
                    const classNames = detectionResult.detections.map(d =>
                      d.class.replace(/_/g, ' ')
                    );
                    console.log('🔊 Replaying voice for results:', classNames);
                    speakDetections(classNames);
                  }}
                  title="Click to announce the detected objects"
                >
                  🔊 Speak Results
                </button>
              </>
            ) : (
              <p className="no-detections">No objects detected with current threshold</p>
            )}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="loading-overlay">
            <div className="spinner"></div>
            <p>Analyzing image...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DetectionInterface;
