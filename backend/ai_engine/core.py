import cv2
import numpy as np
import mediapipe as mp
import mediapipe.python.solutions as mp_solutions
from typing import Dict, Any

class DigitalTailor:
    def __init__(self):
        self.mp_pose = mp_solutions.pose
        self.pose = self.mp_pose.Pose(static_image_mode=True, model_complexity=2, min_detection_confidence=0.5)
        # Placeholder for YOLO model
        # self.yolo_model = YOLO("yolo11n-pose.pt") 

    def process_images(self, front_image_path: str, side_image_path: str, reference_mm: float = 85.6) -> Dict[str, float]:
        front_img = cv2.imread(front_image_path)
        side_img = cv2.imread(side_image_path)
        
        if front_img is None or side_img is None:
            raise ValueError("Could not load one or both images")

        self.front_shape = front_img.shape # h, w, c
        self.side_shape = side_img.shape

        front_landmarks = self._get_landmarks(front_img)
        side_landmarks = self._get_landmarks(side_img)
        
        if not front_landmarks or not side_landmarks:
             raise ValueError("Could not detect pose in one or both images")

        pixels_per_inch = self._calculate_scale(front_img, reference_mm)

        measurements = {
            "chest": self._measure_chest(front_landmarks, side_landmarks, pixels_per_inch),
            "waist": self._measure_waist(front_landmarks, side_landmarks, pixels_per_inch),
            "hips": self._measure_hips(front_landmarks, side_landmarks, pixels_per_inch),
            "shoulders": self._measure_shoulders(front_landmarks, pixels_per_inch),
            "sleeve": self._measure_sleeve(front_landmarks, pixels_per_inch),
            "inseam": self._measure_inseam(front_landmarks, pixels_per_inch)
        }
        
        return measurements

    def _get_px_dist(self, lm1, lm2, shape):
        h, w, _ = shape
        x1, y1 = lm1.x * w, lm1.y * h
        x2, y2 = lm2.x * w, lm2.y * h
        return np.sqrt((x1 - x2)**2 + (y1 - y2)**2)

    def _measure_chest(self, front_lm, side_lm, ppi):
        # Chest Width (Front) + Depth (Side)
        # Using Shoulder points for Width dummy (should use underarms if available, but MP lacks them)
        # Approximating chest width as 85% of shoulder width
        width_px = self._get_px_dist(front_lm[11], front_lm[12], self.front_shape) * 0.85
        
        # Estimate depth from side view (Shoulder to some conceptual back point?)
        # Side view landmarks are tricky because of occlusion.
        # We'll approximate depth as 0.25 * Height for scaffolding or just use a ratio.
        # Better: Average depth is approx 0.7 * Width for normal BMI.
        # Let's simple circle approx for now: Circumference = 2 * (Width + Depth) roughly
        
        chest_width_in = width_px / ppi
        chest_depth_in = chest_width_in * 0.7 # Approximation
        
        return (chest_width_in + chest_depth_in) * 2

    def _measure_waist(self, front_lm, side_lm, ppi):
        width_px = self._get_px_dist(front_lm[23], front_lm[24], self.front_shape)
        waist_width_in = width_px / ppi
        return waist_width_in * 3.14 # Assumes circular waist

    def _measure_hips(self, front_lm, side_lm, ppi):
       # Midpoint between hip and knee is roughly thigh, but for hips, we use hip joints
       width_px = self._get_px_dist(front_lm[23], front_lm[24], self.front_shape)
       # Hips are wider than the joints usually
       return (width_px / ppi) * 3.5

    def _measure_shoulders(self, front_lm, ppi):
        width_px = self._get_px_dist(front_lm[11], front_lm[12], self.front_shape)
        return width_px / ppi

    def _measure_sleeve(self, front_lm, ppi):
        # Shoulder (11) to Wrist (15)
        len_px = self._get_px_dist(front_lm[11], front_lm[15], self.front_shape)
        return len_px / ppi

    def _measure_inseam(self, front_lm, ppi):
        # Hip (23) to Ankle (27)
        len_px = self._get_px_dist(front_lm[23], front_lm[27], self.front_shape)
        return len_px / ppi

