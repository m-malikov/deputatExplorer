from flask import Flask, jsonify, request
import pymongo

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
    for declaration in person["declarations"]:
        if declaration["main"]["office"]["region"] is not None:
            region_names.append(declaration["main"]["office"]["region"]["name"])
    region_names = list(set(region_names))

    return jsonify({
        "name": declaration["main"]["person"]["name"],
        "salary": total_income,
        "office_names": office_names,
        "region_names": region_names
    })

@app.route('/api/findPerson')
def findPerson():
    gender = request.args.get("gender")
    region = int(request.args.get("region"))
    age = request.args.get("age")
    job = request.args.get("job")
    """
     Нужно найти чиновников по следующим критериям:
        gender должен совпадать со значением параметра (M или F)
        
        Если в region ноль -- у чиновника должен быть регион null (не привязан к региону)
        Если в region не ноль -- надо искать чиновника с тем же регионом (в параметре id региона)

        age -- там целое число от 0 до 3 включительно. Нужно посмотреть на данные и разбить по группам чтобы
        было примерно одинаково.

        job -- вообще предполагалось 1 - здравоохранение, 2 - силовые ведомства и суды, 
        3 - наука и образование, 0 - всё остальное. Но чет не очень понятно как их отсеивать.
        У людей из минздрава office 596, у минобрнауки 579 и 6742, у мвд 4 и 959. Но все эти люди походу без региона.
        Надо порисерчить данные и понять как выцепить остальных. Короче это лучше напоследок оставить.

        Вернуть нужно id чиновника или 0 если такого не нашлось. Если нашлось несколько -- наверное выбирать с наибольшим доходом.
        Можно что-то рандомизировать наверное.

    """
    gender_cursor = db.aggregate([
        {
            '$project': {
                'declaration': {'$arrayElemAt': ['$declarations', -1]}
            }
        },
        {
            '$match': {
                'declaration.main.person.gender': gender,
                'declaration.main.office.region.id': region
            }
        }
])
    return str(gender_cursor.next()["_id"])

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=80)
