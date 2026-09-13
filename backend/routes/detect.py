"""
Detection Routes - API endpoints for YOLOv8 object detection
"""

import logging
import os
from flask import Blueprint, request, jsonify, current_app
from werkzeug.exceptions import BadRequest
from utils.image_utils import (
    save_uploaded_file,
    delete_file,
    draw_detections_on_image,
    image_to_base64,
    get_image_dimensions
)

logger = logging.getLogger(__name__)

# Create blueprint
detect_bp = Blueprint('detect', __name__)


@detect_bp.route('/detect-image', methods=['POST'])
def detect_image():
    """
    Detect objects in uploaded image

    Request:
        - Form data with 'image' file
        - Optional: 'confidence' (0.0 - 1.0, default 0.5)

    Response JSON:
        {
            "detections": [
                {
                    "class": "Fire Extinguisher",
                    "confidence": 0.92,
                    "bbox": [x, y, w, h]
                }
            ],
            "image": "base64 encoded output image with bounding boxes",
            "image_dimensions": {"width": 640, "height": 480}
        }

    Error Response:
        {
            "error": "error message"
        }
    """
    uploaded_file_path = None

    try:
        # Validate request
        if 'image' not in request.files:
            return jsonify({"error": "No image file provided"}), 400

        file = request.files['image']

        if file.filename == '':
            return jsonify({"error": "No image file selected"}), 400

        # Get confidence threshold from request (default 0.5)
        try:
            confidence = float(request.form.get('confidence', 0.5))
            if not (0.0 <= confidence <= 1.0):
                return jsonify({"error": "Confidence must be between 0.0 and 1.0"}), 400
        except (ValueError, TypeError):
            confidence = 0.5

        # Save uploaded file
        try:
            uploaded_file_path = save_uploaded_file(file, current_app.config['UPLOAD_FOLDER'])
        except ValueError as e:
            return jsonify({"error": str(e)}), 400

        # Run YOLOv8 detection
        logger.info(f"Running detection on: {uploaded_file_path}")
        detection_result = current_app.yolo_service.detect(
            uploaded_file_path,
            confidence_threshold=confidence
        )

        # Get image dimensions
        image_dims = get_image_dimensions(uploaded_file_path)

        # Draw bounding boxes on image
        detected_image = draw_detections_on_image(
            uploaded_file_path,
            detection_result['detections']
        )

        # Convert output image to base64
        image_base64 = image_to_base64(detected_image)

        # Prepare response
        response = {
            "detections": detection_result['detections'],
            "image": image_base64,
            "image_dimensions": image_dims,
            "confidence_threshold": confidence,
            "detection_count": len(detection_result['detections'])
        }

        logger.info(f"Detection complete. Found {response['detection_count']} objects")

        return jsonify(response), 200

    except Exception as e:
        logger.error(f"Detection error: {str(e)}", exc_info=True)
        return jsonify({"error": f"Detection failed: {str(e)}"}), 500

    finally:
        # Clean up uploaded file
        if uploaded_file_path:
            delete_file(uploaded_file_path)


@detect_bp.route('/classes', methods=['GET'])
def get_classes():
    """
    Get all available class labels

    Response JSON:
        {
            "classes": {
                "0": "Fire Extinguisher",
                "1": "First Aid Kit",
                ...
            }
        }
    """
    try:
        classes = current_app.yolo_service.class_names
        return jsonify({
            "classes": classes,
            "class_count": len(classes)
        }), 200
    except Exception as e:
        logger.error(f"Error getting classes: {str(e)}")
        return jsonify({"error": "Failed to get classes"}), 500


@detect_bp.route('/model-info', methods=['GET'])
def get_model_info():
    """
    Get model information

    Response JSON:
        {
            "model_loaded": true,
            "classes": {...},
            "class_count": 5
        }
    """
    try:
        yolo_service = current_app.yolo_service
        return jsonify({
            "model_loaded": yolo_service.model is not None,
            "classes": yolo_service.class_names,
            "class_count": len(yolo_service.class_names)
        }), 200
    except Exception as e:
        logger.error(f"Error getting model info: {str(e)}")
        return jsonify({"error": "Failed to get model info"}), 500
