import json
from flask import Flask, request, jsonify
from transform import transform_aas

app = Flask(__name__)


@app.route('/api/aas', methods=['post'])
def create_aas():
    path = request.get_json()['path']

    with open(path, 'r', encoding='utf-8-sig') as json_file:
        data = json.load(json_file)

    transform_aas(path, data)

    return '성공', 201


if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000, debug=True)
