from flask import Flask, jsonify, request
import pymongo
import sys
from google_images_download import google_images_download
import time
import urllib.parse

app = Flask(__name__)

client = pymongo.MongoClient("176.99.11.79:27017", username="root", password="example")
db = client.declarations.persons

@app.route('/api/get/<int:person_id>')
def get_one(person_id):
    person = db.find_one({"_id": person_id})
    declaration = max(person["declarations"],
                             key=lambda x: x["main"]["year"])
    incomes = filter(lambda x: x.get("relative") is None, declaration["incomes"])
    total_income = sum(map(lambda x: x["size"], incomes))

    office_names = [declaration["main"]["office"]["name"] for declaration in person["declarations"]]
    office_names = list(set(office_names))

    region_names = []
    region_ids = []
    for declaration in person["declarations"]:
        if declaration["main"]["office"]["region"] is not None:
            region_names.append(declaration["main"]["office"]["region"]["name"])
            region_ids.append(declaration["main"]["office"]["region"]["id"])
    region_names = list(set(region_names))
    region_ids = list(set(region_ids))

    return jsonify({
        "name": declaration["main"]["person"]["name"],
        "salary": total_income,
        "office_names": office_names,
        "region_names": region_names,
        "region_ids": region_ids
    })

@app.route('/api/getPhoto')
def getPhoto():
    name = urllib.parse.unquote(request.args.get("name"))
    orig_stdout = sys.stdout
    f = open('URLS.txt', 'w')
    sys.stdout = f

    response = google_images_download.googleimagesdownload()

    arguments = {"keywords"    : name,
                "limit"        : 1,
                "print_urls"   : True,
                }
    paths = response.download(arguments)

    sys.stdout = orig_stdout
    f.close()

    with open('URLS.txt') as f:
        content = f.readlines()
    f.close()

    time.sleep(2)
    for j in range(len(content)):
        print(content)
        if content[j][:9] == 'Completed':
            url = content[j-1][11:-1]
            break

    with open('URLS.txt') as f:
        content = f.readlines()
    f.close()
    return url

@app.route('/api/findPerson')
def findPerson():
    try:
        match_expression = {}

        gender = request.args.get("gender")
        match_expression.update({
            'declarations.main.person.gender': gender
        })

        region = int(request.args.get("region"))
        if region == 0:
            match_expression.update({
                'declarations.main.office.region': None,
            })

        else:
            match_expression.update({
                'declarations.main.office.region.id': region 
            })
        
        job = request.args.get("job")
        if job == "3":
            match_expression.update({
                '$or': [
                    {'declarations.main.office.name': {'$regex': '.*БОУ.*'}},
                    {'declarations.main.office.name': {'$regex': '.*институт.*', "$options": "-i"}},
                    {'declarations.main.office.name': {'$regex': '.*университет.*', "$options": "-i"}},
                    {'declarations.main.office.name': {'$regex': '.*обр.*', "$options": "-i"}},
                ]
            })
        elif job == "2":
            match_expression.update({
                '$or': [
                {'declarations.main.office.name': {'$regex': '.*ФСИН.*'}}, 
                {'declarations.main.office.name': {'$regex': '.*МВД.*'}}
                ]
            })
        elif job == "1":
            match_expression.update({
                '$or': [
                {'declarations.main.office.name': {'$regex': '.*БУЗ.*'}}, 
                {'declarations.main.office.name': {'$regex': '.*здрав.*', "$options": "-i"}}
                ]
            })

        cursor = db.aggregate([
            {
                '$unwind': '$declarations'
            },
            {
                '$match': match_expression
            },
            {
                '$limit': 10
            },
        ])

        data = [item["_id"] for item in list(cursor)]
        data = list(set(data))[:5]
        return jsonify(data)
    except:
        return jsonify([])

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=80)
