import time
import schedule
from db import db
from updater import update_scores
from trigger import trigger_investigation

def run():
    update_scores()
    
    services = db["metricsnapshots"].distinct("service")
    
    for service in services:
        latest = db["metricsnapshots"].find_one(
            {"service": service},
            sort=[("timestamp", -1)]
        )
        
        if latest and latest.get("anomalyScore", 0) > 0.7:
            trigger_investigation(service, latest["anomalyScore"])

schedule.every(30).seconds.do(run)

while True:
    schedule.run_pending()
    time.sleep(1)
