import numpy as np
from db import db

def score_service(service_name):
    snapshots = list(
        db["metricsnapshots"]
        .find({"service": service_name})
        .sort("timestamp", -1)
        .limit(100)
    )
    
    if not snapshots:
        return 0.0, "UNKNOWN"

    latest = snapshots[0]
    
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
            latest_val = latest.get(m, mean)
            z_scores[m] = abs((latest_val - mean) / std)

    weights = {
        "errorRate": 0.35,
        "avgResponseTime": 0.25,
        "memory": 0.25,
        "cpu": 0.15
    }
    
    anomaly_score = sum(z_scores[m] * weights[m] for m in metrics)
    
    dominant = max(z_scores, key=z_scores.get)
    anomaly_type_map = {
        "errorRate": "HIGH_ERROR_RATE",
        "avgResponseTime": "SLOW_RESPONSE",
        "memory": "MEMORY_LEAK",
        "cpu": "HIGH_CPU"
    }
    anomaly_type = anomaly_type_map.get(dominant, "UNKNOWN")
    
    return max(0.0, min(1.0, anomaly_score)), anomaly_type