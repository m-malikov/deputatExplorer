import json
import pymongo
from pymongo.bulk import BulkWriteError
from collections import defaultdict

DATA_FILE_NAME = 'declarations.json'
HOST = ""
USERNAME = ""
PASSWORD = ""

client = pymongo.MongoClient(HOST, username=USERNAME, password=PASSWORD)

db = client.declarations
print("Server Status: ", db.command("serverStatus"))

with open(DATA_FILE_NAME) as json_file:
    data = json.load(json_file)

print("Количество строк в данных:", len(data))

data_to_db = defaultdict(lambda: [])
for person in data:
    _id = person['main']['person']['id']
    data_to_db[_id].append(person)

del data

query = []
for key, value in data_to_db.items():
    query.append({
        "_id": key,
        "declarations": value
    })

try:
    db.persons.insert_many(query)
except BulkWriteError as e:
    print("Error")
    print(e.details)
