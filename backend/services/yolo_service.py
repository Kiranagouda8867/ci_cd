"""
YOLO Service - Handles YOLOv8 model inference
"""

import logging
from ultralytics import YOLO
from pathlib import Path

logger = logging.getLogger(__name__)


class YOLOService:
    """
    Service class for YOLOv8 model inference
    Loads model once at initialization for performance
    """

    def __init__(self, model_path: str, device: str = 'cpu'):
        """
        Initialize YOLO service

        Args:
            model_path (str): Path to the YOLOv8 model weights file (e.g., best.pt)
            device (str): Device to run inference on ('cpu' or 'cuda')
        """
        self.model_path = model_path
        self.device = device
        self.model = None
        self.class_names = {}

        # Validate model path
        if not Path(model_path).exists():
            raise FileNotFoundError(f"Model not found at: {model_path}")

        # Load the model
        self._load_model()

    def _load_model(self):
        """Load YOLO model from weights file"""
        try:
            logger.info(f"Loading YOLO model from: {self.model_path}")
            self.model = YOLO(self.model_path)
            self.model.to(self.device)

            # Extract class names
            if hasattr(self.model, 'names') and self.model.names:
                self.class_names = self.model.names
                logger.info(f"Loaded {len(self.class_names)} classes: {self.class_names}")
            else:
                logger.warning("No class names found in model")

        except Exception as e:
            logger.error(f"Failed to load model: {str(e)}")
            raise

    def detect(self, image_path: str, confidence_threshold: float = 0.5):
        """
        Run YOLOv8 detection on an image

        Args:
            image_path (str): Path to the image file
            confidence_threshold (float): Minimum confidence score (0.0 - 1.0)

        Returns:
            dict: {
                "detections": [
                    {
                        "class": "class_name",
                        "confidence": 0.92,
                        "bbox": [x, y, w, h]
                    }
                ],
                "raw_results": results object for further processing
            }

        Raises:
            Exception: If inference fails
        """
        try:
            # Run inference
            results = self.model.predict(
                source=image_path,
                conf=confidence_threshold,
                device=self.device,
                verbose=False
            )

            # Parse results
            detections = []
            if results and len(results) > 0:
                result = results[0]  # Get first (and usually only) result

                if result.boxes is not None and len(result.boxes) > 0:
                    for box in result.boxes:
                        # Extract box coordinates (x1, y1, x2, y2)
                        x1, y1, x2, y2 = box.xyxy[0].tolist()

                        # Convert to (x, y, w, h) format
                        x = x1
                        y = y1
                        w = x2 - x1
                        h = y2 - y1

                        # Get class ID and confidence
                        class_id = int(box.cls[0]) if box.cls is not None else 0
                        confidence = float(box.conf[0]) if box.conf is not None else 0

                        # Get class name
                        class_name = self.class_names.get(class_id, f"Class {class_id}")

                        detections.append({
                            "class": class_name,
                            "confidence": round(confidence, 2),
                            "bbox": [round(x, 2), round(y, 2), round(w, 2), round(h, 2)],
                            "class_id": class_id
                        })

                    logger.info(f"Detected {len(detections)} objects")

            return {
                "detections": detections,
                "raw_results": results
            }

        except Exception as e:
            logger.error(f"Detection failed: {str(e)}")
            raise

    def get_class_colors(self):
        """
        Get color mapping for each class (for frontend visualization)

        Returns:
            dict: {class_id: hex_color, ...}
        """
        colors = {}
        if self.class_names:
            # Generate distinct colors for each class
            for class_id in range(len(self.class_names)):
                # Use HSL coloring for better distinction
                hue = (class_id * 360 / len(self.class_names)) % 360
                colors[class_id] = f"hsl({hue}, 100%, 50%)"
        return colors
