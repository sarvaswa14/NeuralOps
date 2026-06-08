import os
import json
import time
import redis
from dotenv import load_dotenv
load_dotenv()
r = redis.from_url(os.getenv("REDIS_URL"))
def trigger_investigation(service, score):
    job_id = str(int(time.time() * 1000))
    job_data = {
        "name": "investigate",
        "data": {"service": service, "anomalyScore": score},
        "opts": {}
    }
    
    r.hset(f"bull:investigation-queue:{job_id}", mapping={
        "name": "investigate",
        "data": json.dumps(job_data["data"]),
        "opts": json.dumps(job_data["opts"])
    })
    
    r.lpush("bull:investigation-queue:wait", job_id)