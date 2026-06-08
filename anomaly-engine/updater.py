from db import db
from scorer import score_service

def update_scores():
    services = db["metricsnapshots"].distinct("service")
    
    for service in services:
        score = score_service(service)
        
        latest = db["metricsnapshots"].find_one(
            {"service": service},
            sort=[("timestamp", -1)]
        )
        
        if latest:
            db["metricsnapshots"].update_one(
                {"_id": latest["_id"]},
                {"$set": {"anomalyScore": score}}
            )
