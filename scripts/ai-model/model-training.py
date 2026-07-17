from ultralytics import YOLO

# Load the YOLOv8 Small model
model = YOLO("yolov8s.pt")

# The Final FYP Master Training Run
results = model.train(
    data=f"{dataset.location}/data.yaml",
    epochs=110,
    patience=15,
    batch=16,
    imgsz=640,
    device=0,

    # Advanced FYP Learning Tactics
    cos_lr=True,
    warmup_epochs=5,
    label_smoothing=0.1,
    close_mosaic=10,

    # YOLO-Specific Structural Augmentations (Keep these!)
    scale=0.5,            # Forces model to recognize hazards at different distances
    mosaic=1.0,           # Stitches 4 images together; highly effective for YOLO

    # Disabled to prevent "Double-Dipping" with Roboflow
    degrees=0.0,
    flipud=0.0,
    fliplr=0.0,           # Handled by Roboflow
    hsv_v=0.0,            # Handled by Roboflow (Brightness/Exposure)
    hsv_s=0.0,            # Handled by Roboflow (Saturation/Grayscale)
    hsv_h=0.0,            # Handled by Roboflow (Hue)
    copy_paste=0.0,
    mixup=0.0,

    # Output Management
    plots=True,
    save=True
)