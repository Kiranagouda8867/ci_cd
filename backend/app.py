"""
Flask Application - YOLOv8 Object Detection Server
Main entry point for the backend API
"""

import os
import logging
from flask import Flask
from flask_cors import CORS
from services.yolo_service import YOLOService
from routes.detect import detect_bp

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)

# Enable CORS for all routes
CORS(app, resources={
    r"/*": {
        # Vite is configured to run on 5175 in frontend/vite.config.js.
        # Keeping this list explicit allows the React app to call the local
        # best.pt inference API while rejecting unrelated browser origins.
        "origins": ["http://localhost:5175", "http://127.0.0.1:5175", "http://localhost:5173", "http://localhost:3000"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})

# Create uploads directory if it doesn't exist
UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'uploads')
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
    logger.info(f"Created uploads directory: {UPLOAD_FOLDER}")

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Initialize YOLO service (loads model once at startup)
logger.info("Initializing YOLO service...")
model_path = os.path.join(os.path.dirname(__file__), 'trained-model', 'weights', 'best.pt')

try:
    yolo_service = YOLOService(model_path)
    app.yolo_service = yolo_service
    logger.info("✓ YOLO service initialized successfully")
except Exception as e:
    logger.error(f"✗ Failed to initialize YOLO service: {str(e)}")
    raise


# Health check endpoint
@app.route('/health', methods=['GET'])
def health():
    """
    Health check endpoint
    Returns: {"status": "running"}
    """
    return {
        "status": "running",
        "model_loaded": app.yolo_service.model is not None
    }, 200


# Register blueprints
app.register_blueprint(detect_bp)

logger.info("═" * 50)
logger.info("Flask Backend Ready!")
logger.info("═" * 50)


if __name__ == '__main__':
    # Development server
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=True,
        use_reloader=False  # Prevents model from loading twice
    )
