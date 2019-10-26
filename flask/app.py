from flask import Flask, jsonify
app = Flask(__name__)

@app.route('/api/getAll')
def get_all():
    return jsonify([
        {
            "name": "Кудрявцев Николай Николаевич",
            "id": 21583,
            "info": "Ректор ФГАОУ ВО Московский физико-технический институт (государственный университет)"
        },
        {
            "name": "Путин Владимир Владимирович",
            "id": 582,
            "info": "Президент Российской Федерации"
        }
    ])

@app.route('/api/get/<int:person_id>')
def get_one(person_id):
    return jsonify(
        {
            "name": "Кудрявцев Николай Николаевич",
            "salary": 20531276,
            "otherSalaries": [
                {
                    "name": "Медицинская сестра",
                    "salary": 28200
                },
                {
                    "name": "Учитель",
                    "salary": 92944
                }
            ],
        }
    )

@app.route('/api/findPerson')
def findPerson():
    return '21583'

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=80)
