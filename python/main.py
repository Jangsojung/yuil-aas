import json
from flask import Flask, request
from transform import transform_aas, transform_aasx

app = Flask(__name__)


@app.route('/api/aas', methods=['post'])
def create_aas():
    path = request.get_json()['path']

    with open(path, 'r', encoding='utf-8-sig') as json_file:
        data = json.load(json_file)

    transform_aas(path, data)

    return 'AAS 변환 성공', 201


@app.route('/api/aasx', methods=['post'])
def create_aasx():
    path = request.get_json()['path']

    transform_aasx(path)

    return 'AASX 변환 성공', 201


if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000, debug=True)
