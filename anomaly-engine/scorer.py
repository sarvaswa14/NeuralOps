from db import db

def score_service(service_name):
    latest = db["metricsnapshots"].find_one(
        {"service": service_name},
        sort=[("timestamp", -1)]
    )
    
    if not latest:
        return 0.0, "UNKNOWN"

    error_rate = latest.get("errorRate", 0)
    avg_response = latest.get("avgResponseTime", 0)
    memory = latest.get("memory", 0)
    cpu = latest.get("cpu", 0)

    if error_rate > 20:
        return 1.0, "HIGH_ERROR_RATE"
    if avg_response > 5000:
        return 1.0, "SLOW_RESPONSE"
    if memory > 850:
        return 1.0, "MEMORY_LEAK"
    if cpu > 85:
        return 1.0, "HIGH_CPU"

    return 0.0, "UNKNOWN"