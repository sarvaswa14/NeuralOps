import os
from pymongo import MongoClient
from dotenv import load_dotenv
load_dotenv()
client = MongoClient(os.getenv('MONGO_URI'))
db = client['neuralops']
result = db.incidents.update_many({}, {'$set': {'status': 'escalated'}})
print('modified:', result.modified_count)