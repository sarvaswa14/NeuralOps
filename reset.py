from db import db

r1 = db.incidents.delete_many({})
r2 = db.agentsteps.delete_many({})
r3 = db.metricsnapshots.delete_many({})  # delete all old snapshots
print("incidents deleted:", r1.deleted_count)
print("steps deleted:", r2.deleted_count)
print("snapshots deleted:", r3.deleted_count)