import os
import json
import time
import uuid
import redis
from dotenv import load_dotenv
load_dotenv()

r = redis.from_url(os.getenv("REDIS_URL"))

def trigger_investigation(service, score, anomaly_type="UNKNOWN"):
    job_id = str(uuid.uuid4())
    timestamp = int(time.time() * 1000)
    
    job_data = {
        "id": job_id,
        "name": "investigate",
        "data": json.dumps({"service": service, "anomalyScore": score, "anomalyType": anomaly_type}),
        "opts": json.dumps({"attempts": 1, "timestamp": timestamp}),
        "timestamp": str(timestamp),
        "attempts": "0",
        "delay": "0",
        "priority": "0"
    }
    
    r.hset(f"bull:investigation-queue:{job_id}", mapping=job_data)
    r.lpush("bull:investigation-queue:wait", job_id)