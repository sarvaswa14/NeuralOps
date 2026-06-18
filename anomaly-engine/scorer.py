import numpy as np
from db import db

def score_service(service_name):
    snapshots = list(
        db["metricsnapshots"]
        .find({"service": service_name})
        .sort("timestamp", -1)
        .limit(50)
    )
    
    if len(snapshots) < 20:
        return 0.0, "UNKNOWN"

    latest = snapshots[0]

    # Hard minimums — must cross these to even consider anomaly
    error_rate = latest.get("errorRate", 0)
    avg_response = latest.get("avgResponseTime", 0)
    memory = latest.get("memory", 0)
    cpu = latest.get("cpu", 0)

    if error_rate < 5 and avg_response < 3000 and memory < 800 and cpu < 80:
        return 0.0, "UNKNOWN"

    # Only Z-score the metrics that crossed minimums
    metrics = ["errorRate", "avgResponseTime", "memory", "cpu"]
    z_scores = {}
    
    for m in metrics:
        values = [s[m] for s in snapshots if m in s]
        if len(values) < 2:
            z_scores[m] = 0.0
            continue
        mean = np.mean(values)
        std = np.std(values)
        if std == 0:
            z_scores[m] = 0.0
        else:
            z_scores[m] = min(abs((latest.get(m, mean) - mean) / std), 3.0)

    weights = {"errorRate": 0.45, "avgResponseTime": 0.25, "memory": 0.20, "cpu": 0.10}
    anomaly_score = sum(z_scores[m] * weights[m] for m in metrics)
    normalized = max(0.0, min(1.0, anomaly_score / 3.0))

    dominant = max(z_scores, key=z_scores.get)
    anomaly_type_map = {
        "errorRate": "HIGH_ERROR_RATE",
        "avgResponseTime": "SLOW_RESPONSE",
        "memory": "MEMORY_LEAK",
        "cpu": "HIGH_CPU"
    }

    return normalized, anomaly_type_map.get(dominant, "UNKNOWN")