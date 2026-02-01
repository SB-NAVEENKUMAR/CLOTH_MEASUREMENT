
try:
    import mediapipe as mp
    print(f"Mediapipe version: {mp.__version__}")
    if hasattr(mp, 'solutions'):
        print("mp.solutions exists")
    else:
        print("mp.solutions DOES NOT exist")
        # List attributes
        print(dir(mp))
        
    import cv2
    print(f"OpenCV version: {cv2.__version__}")

except Exception as e:
    print(f"Error: {e}")
