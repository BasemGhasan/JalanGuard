import cv2
import numpy as np
import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt
from pathlib import Path
from ultralytics import YOLO

# ==========================================
# ⚙️ CONFIGURATION & THRESHOLDS
# ==========================================
MODEL_PATH = "best.pt"
INPUT_DIR = "test_images"
OUTPUT_DIR = "annotated_results"
CHARTS_DIR = "report_charts"

CONF_THRESHOLD = 0.25
IOMIN_THRESHOLD = 0.45  # Overlap tolerance (lower = more aggressive removal)

# BGR Styling for OpenCV Annotations
CLASS_COLOURS = {
    "crack-high":     (0, 0, 220),
    "crack-low":      (0, 165, 255),
    "crack-medium":   (0, 100, 255),
    "pothole-high":   (220, 0, 0),
    "pothole-low":    (255, 200, 0),
    "pothole-medium": (120, 0, 200),
}
DEFAULT_COLOUR = (128, 128, 128)


# ==========================================
# 🧠 CORE LOGIC: OVERLAP DETECTION
# ==========================================
def compute_iomin(box_a, box_b):
    """
    Computes Intersection over Minimum (IoMin) area.
    Ideal for detecting when a smaller hazard is completely enclosed by a larger one.
    """
    x1 = max(box_a[0], box_b[0])
    y1 = max(box_a[1], box_b[1])
    x2 = min(box_a[2], box_b[2])
    y2 = min(box_a[3], box_b[3])

    intersection = max(0, x2 - x1) * max(0, y2 - y1)
    if intersection == 0:
        return 0.0

    area_a = (box_a[2] - box_a[0]) * (box_a[3] - box_a[1])
    area_b = (box_b[2] - box_b[0]) * (box_b[3] - box_b[1])
    min_area = min(area_a, area_b)

    return intersection / min_area if min_area > 0 else 0.0


def apply_custom_nms(detections, iomin_threshold):
    """
    Applies custom Non-Maximum Suppression (NMS) to filter redundant bounding boxes.
    Includes an exemption rule: allows differing hazard types (e.g., pothole in a crack) to overlap.
    """
    if not detections:
        return [], 0 

    # Sort by confidence descending to prioritize the AI's strongest guesses
    detections = sorted(detections, key=lambda d: d["conf"], reverse=True)
    
    kept = []
    suppressed = set()
    exemptions_made = 0

    for i, det_a in enumerate(detections):
        if i in suppressed:
            continue

        kept.append(det_a)
        box_a = [det_a["x1"], det_a["y1"], det_a["x2"], det_a["y2"]]
        base_type_a = det_a["label"].split('-')[0] # Extracts root classification (crack/pothole)

        for j, det_b in enumerate(detections):
            if j <= i or j in suppressed:
                continue
            
            box_b = [det_b["x1"], det_b["y1"], det_b["x2"], det_b["y2"]]
            base_type_b = det_b["label"].split('-')[0]
            
            iomin = compute_iomin(box_a, box_b)

            if iomin >= iomin_threshold:
                # Exemption: Do not suppress if a pothole is inside a crack
                if base_type_a != base_type_b:
                    exemptions_made += 1
                    continue 
                
                # Suppress weaker detection of the same hazard type
                suppressed.add(j)

    return kept, exemptions_made


# ==========================================
# 📊 ANALYTICS: CHART GENERATION
# ==========================================
def generate_academic_charts(stats, class_counts, confidences):
    """Generates three high-resolution academic charts for the final report."""
    print("\nGenerating academic charts for report...")
    sns.set_theme(style="whitegrid")

    # 1. NMS Efficacy Chart (Bar Chart)
    plt.figure(figsize=(8, 6))
    categories = ['Raw Detections', 'Final Detections\n(Post-NMS)', 'Ghost Boxes\nRemoved']
    values = [stats['total_before'], stats['total_after'], stats['total_removed']]
    
    ax1 = sns.barplot(x=categories, y=values, palette=['#34495e', '#27ae60', '#e74c3c'])
    plt.title('Impact of Custom Cross-Class NMS on Detection Artifacts', fontsize=14, pad=15)
    plt.ylabel('Number of Bounding Boxes', fontsize=12)
    for i, v in enumerate(values):
        ax1.text(i, v + (max(values) * 0.02), str(v), ha='center', fontweight='bold')
    plt.tight_layout()
    plt.savefig(f"{CHARTS_DIR}/1_nms_efficacy.png", dpi=300)
    plt.close()

    # 2. Hazard Class Distribution (Horizontal Bar Chart)
    plt.figure(figsize=(10, 6))
    df_counts = pd.DataFrame(list(class_counts.items()), columns=['Class', 'Count'])
    df_counts = df_counts[df_counts['Count'] > 0].sort_values('Count', ascending=True)
    
    # Convert BGR CV2 colours to Hex for Matplotlib
    hex_colors = {k: '#%02x%02x%02x' % (v[2], v[1], v[0]) for k, v in CLASS_COLOURS.items()}
    ordered_colors = [hex_colors.get(c, '#808080') for c in df_counts['Class']]

    ax2 = sns.barplot(x='Count', y='Class', data=df_counts, palette=ordered_colors)
    plt.title('Distribution of Validated Road Hazards in Test Dataset', fontsize=14, pad=15)
    plt.xlabel('Number of Instances', fontsize=12)
    plt.ylabel('Hazard Classification', fontsize=12)
    for i, v in enumerate(df_counts['Count']):
        ax2.text(v + 0.2, i, str(v), va='center', fontweight='bold')
    plt.tight_layout()
    plt.savefig(f"{CHARTS_DIR}/2_hazard_distribution.png", dpi=300)
    plt.close()

    # 3. AI Confidence Distribution (Histogram)
    if confidences:
        plt.figure(figsize=(9, 6))
        sns.histplot(confidences, bins=15, kde=True, color='#2980b9')
        plt.title('Distribution of AI Confidence Scores (Post-NMS)', fontsize=14, pad=15)
        plt.xlabel('Confidence Score', fontsize=12)
        plt.ylabel('Frequency', fontsize=12)
        plt.axvline(np.mean(confidences), color='#e74c3c', linestyle='dashed', linewidth=2, 
                    label=f'Mean: {np.mean(confidences):.2f}')
        plt.legend()
        plt.tight_layout()
        plt.savefig(f"{CHARTS_DIR}/3_confidence_histogram.png", dpi=300)
        plt.close()


# ==========================================
# 🚀 MAIN EXECUTION WORKFLOW
# ==========================================
def main():
    # Setup directories
    Path(OUTPUT_DIR).mkdir(parents=True, exist_ok=True)
    Path(CHARTS_DIR).mkdir(parents=True, exist_ok=True)

    # Load Model & Validate Input Directory
    model = YOLO(MODEL_PATH)
    image_extensions = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}
    image_files = [f for f in Path(INPUT_DIR).iterdir() if f.suffix.lower() in image_extensions]

    if not image_files:
        print(f"❌ Error: No images found in '{INPUT_DIR}'.")
        return

    print(f"✅ Found {len(image_files)} images. Initializing evaluation...\n")

    # Initialize Analytics Trackers
    stats = {'total_before': 0, 'total_after': 0, 'total_removed': 0, 'images_with_hazards': 0, 'total_exemptions': 0}
    all_confidences = []
    class_counts = {k: 0 for k in CLASS_COLOURS.keys()}

    # Process Dataset
    for img_path in sorted(image_files):
        img = cv2.imread(str(img_path))
        if img is None:
            continue

        # 1. Raw Inference
        results = model(img, conf=CONF_THRESHOLD, verbose=False)[0]
        
        raw_detections = []
        for box in results.boxes:
            raw_detections.append({
                "x1": int(box.xyxy[0][0]), "y1": int(box.xyxy[0][1]), 
                "x2": int(box.xyxy[0][2]), "y2": int(box.xyxy[0][3]),
                "conf": float(box.conf[0]), 
                "label": model.names[int(box.cls[0])]
            })

        stats['total_before'] += len(raw_detections)

        # 2. Filter Detections via Custom NMS
        final_detections, exemptions = apply_custom_nms(raw_detections, IOMIN_THRESHOLD)
        stats['total_exemptions'] += exemptions
        stats['total_after'] += len(final_detections)
        stats['total_removed'] += (len(raw_detections) - len(final_detections))

        if final_detections:
            stats['images_with_hazards'] += 1

        # 3. Draw Annotations & Log Analytics
        for det in final_detections:
            all_confidences.append(det["conf"])
            if det["label"] in class_counts:
                class_counts[det["label"]] += 1
                
            x1, y1, x2, y2 = det["x1"], det["y1"], det["x2"], det["y2"]
            colour = CLASS_COLOURS.get(det["label"], DEFAULT_COLOUR)
            
            # Draw Bounding Box
            cv2.rectangle(img, (x1, y1), (x2, y2), colour, 2)
            
            # Draw Label Tag
            display_text = f"{det['label']} {det['conf']:.2f}"
            (text_w, text_h), baseline = cv2.getTextSize(display_text, cv2.FONT_HERSHEY_SIMPLEX, 0.55, 1)
            cv2.rectangle(img, (x1, y1 - text_h - baseline - 6), (x1 + text_w + 6, y1), colour, -1)
            cv2.putText(img, display_text, (x1 + 3, y1 - baseline - 3), 
                        cv2.FONT_HERSHEY_SIMPLEX, 0.55, (255, 255, 255), 1, cv2.LINE_AA)

        # Save annotated image
        cv2.imwrite(str(Path(OUTPUT_DIR) / img_path.name), img)
        
        # Terminal Logging
        status = "✅" if final_detections else "⬜"
        exempt_msg = f" [Saved {exemptions} diff-type overlap!]" if exemptions > 0 else ""
        print(f"  {status} {img_path.name:<35} {len(final_detections)} box(es){exempt_msg}")

    # Generate Final Report Data
    generate_academic_charts(stats, class_counts, all_confidences)

    # Print Formal Summary
    print(f"""
    {'='*60}
     FYP TESTING COMPLETE
    {'='*60}
     Images processed:          {len(image_files)}
     Validated Detections:      {stats['total_after']}
     Overlapping Ghost Removed: {stats['total_removed']}
     Edge-Case Exemptions:      {stats['total_exemptions']} 🛡️
     
     Annotated Images saved to: {OUTPUT_DIR}/
     Formal Charts saved to:    {CHARTS_DIR}/
    {'='*60}
    """)

# Execute Script
if __name__ == "__main__":
    main()