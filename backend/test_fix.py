
try:
    import mediapipe.python.solutions as mp_solutions
    print("Success: mediapipe.python.solutions imported")
    print(dir(mp_solutions.pose))
except Exception as e:
    print(f"Failed: {e}")
