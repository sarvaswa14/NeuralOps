import time
import schedule
from db import db
from updater import update_scores
from trigger import trigger_investigation

def run():
    print("anomaly engine running...", flush=True)
    update_scores()
    
    active = db["incidents"].find_one({
        "status": {"$in": ["investigating", "fixing", "verifying","escalated"]}
    })
    
    if active:
        print(f"active incident found, skipping", flush=True)
        return
    
    services = db["metricsnapshots"].distinct("service")
    print(f"services found: {services}", flush=True)
    
    for service in services:
        latest = db["metricsnapshots"].find_one(
            {"service": service},
            sort=[("timestamp", -1)]
        )
        
        if latest and latest.get("anomalyScore", 0) > 0.7:
            trigger_investigation(service, latest["anomalyScore"], latest.get("anomalyType", "UNKNOWN"))
            print(f"triggered investigation for {service}", flush=True)
            db["metricsnapshots"].update_one(
                {"_id": latest["_id"]},
                {"$set": {"anomalyScore": 0.0}}
            )
            time.sleep(35)
            return

schedule.every(30).seconds.do(run)

print("anomaly engine started", flush=True)
run()

while True:
    schedule.run_pending()
    time.sleep(1)