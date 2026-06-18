import os
from pymongo import MongoClient
from dotenv import load_dotenv
load_dotenv()
client = MongoClient(os.getenv('MONGO_URI'))
db = client['neuralops']
r1 = db.incidents.delete_many({})
r2 = db.agentsteps.delete_many({})
print('incidents deleted:', r1.deleted_count)
print('steps deleted:', r2.deleted_count)