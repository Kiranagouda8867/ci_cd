"""
Image Utilities - Image processing and encoding functions
"""

import os
import base64
import logging
from pathlib import Path
from PIL import Image
import cv2
import numpy as np

logger = logging.getLogger(__name__)


def save_uploaded_file(file_obj, upload_folder: str) -> str:
    """
    Save uploaded file to disk

    Args:
        file_obj: Flask FileStorage object
        upload_folder (str): Folder to save the file

    Returns:
        str: Path to saved file

    Raises:
        ValueError: If file is invalid
    """
    try:
        # Validate file
        if not file_obj or file_obj.filename == '':
            raise ValueError("No file provided")

        # Check file extension
        allowed_extensions = {'jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'}
        file_ext = Path(file_obj.filename).suffix.lower().lstrip('.')

        if file_ext not in allowed_extensions:
            raise ValueError(f"File type '.{file_ext}' not allowed. Use: {allowed_extensions}")

        # Create unique filename
        import uuid
        unique_filename = f"{uuid.uuid4()}_{file_obj.filename}"
        filepath = os.path.join(upload_folder, unique_filename)

        # Save file
        file_obj.save(filepath)
        logger.info(f"File saved: {filepath}")

        return filepath

    except Exception as e:
        logger.error(f"Error saving file: {str(e)}")
        raise


def delete_file(filepath: str):
    """
    Delete a file from disk

    Args:
        filepath (str): Path to file to delete
    """
    try:
        if os.path.exists(filepath):
            os.remove(filepath)
            logger.info(f"File deleted: {filepath}")
    except Exception as e:
        logger.error(f"Error deleting file {filepath}: {str(e)}")


def draw_detections_on_image(image_path: str, detections: list) -> np.ndarray:
    """
    Draw bounding boxes on image

    Args:
        image_path (str): Path to input image
        detections (list): List of detection dicts with class, confidence, bbox

    Returns:
        np.ndarray: Image with drawn boxes
    """
    try:
        # Load image
        image = cv2.imread(image_path)
        if image is None:
            raise ValueError(f"Could not load image: {image_path}")

        # Color map for classes
        colors = {
            0: (0, 255, 0),      # Green
            1: (255, 0, 0),      # Blue
            2: (0, 0, 255),      # Red
            3: (255, 255, 0),    # Cyan
            4: (255, 0, 255),    # Magenta
            5: (0, 255, 255),    # Yellow
        }

        # Draw each detection
        for detection in detections:
            x, y, w, h = detection['bbox']
            class_name = detection['class']
            confidence = detection['confidence']
            class_id = detection.get('class_id', 0)

            # Get color for this class
            color = colors.get(class_id % len(colors), (0, 255, 0))

            # Draw rectangle
            x1, y1 = int(x), int(y)
            x2, y2 = int(x + w), int(y + h)
            cv2.rectangle(image, (x1, y1), (x2, y2), color, 2)

            # Draw label
            label = f"{class_name} {confidence:.0%}"
            label_size, baseline = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 2)

            # Background for text
            cv2.rectangle(
                image,
                (x1, y1 - label_size[1] - baseline),
                (x1 + label_size[0], y1),
                color,
                -1
            )

            # Put text
            cv2.putText(
                image,
                label,
                (x1, y1 - baseline),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.6,
                (255, 255, 255),
                2
            )

        logger.info("Bounding boxes drawn successfully")
        return image

    except Exception as e:
        logger.error(f"Error drawing detections: {str(e)}")
        raise


def image_to_base64(image_array: np.ndarray) -> str:
    """
    Convert numpy image array to base64 string

    Args:
        image_array (np.ndarray): OpenCV image array

    Returns:
        str: Base64 encoded image string
    """
    try:
        # Convert BGR to RGB for PIL
        image_rgb = cv2.cvtColor(image_array, cv2.COLOR_BGR2RGB)

        # Convert to PIL Image
        pil_image = Image.fromarray(image_rgb)

        # Encode to base64
        import io
        buffer = io.BytesIO()
        pil_image.save(buffer, format='PNG')
        buffer.seek(0)
        base64_str = base64.b64encode(buffer.getvalue()).decode('utf-8')

        logger.info("Image converted to base64")
        return base64_str

    except Exception as e:
        logger.error(f"Error converting image to base64: {str(e)}")
        raise


def get_image_dimensions(image_path: str) -> dict:
    """
    Get image dimensions

    Args:
        image_path (str): Path to image

    Returns:
        dict: {"width": int, "height": int}
    """
    try:
        image = cv2.imread(image_path)
        height, width = image.shape[:2]
        return {
            "width": width,
            "height": height
        }
    except Exception as e:
        logger.error(f"Error getting image dimensions: {str(e)}")
        raise
