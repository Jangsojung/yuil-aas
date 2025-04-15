import orjson
import os
from flask import Flask, request
from transform import transform_aas, transform_aasx

app = Flask(__name__)


@app.route('/api/aas', methods=['post'])
def create_aas():
    data = request.get_json()
    path = data['path']
    old_path = data.get('old_path')

    if old_path and os.path.exists(old_path):
        try:
            os.remove(old_path)
            os.remove(old_path.replace('front', 'aas'))
            print(f'{old_path}, {old_path.replace("front", "aas")} 파일 삭제 성공')
        except Exception as e:
            print(f'파일 삭제 실패: {e}')

    with open(path, 'rb') as json_file:
        data = orjson.loads(json_file.read())

    transform_aas(path, data)

    return 'AAS 변환 성공', 201


@app.route('/api/aasx', methods=['post'])
def create_aasx():
    data = request.get_json()
    path = data['path']
    old_path = data.get('old_path')

    if old_path and os.path.exists(old_path):
        try:
            os.remove(old_path)
            print(f'{old_path} 파일 삭제 성공')
        except Exception as e:
            print(f'파일 삭제 실패: {e}')

    transform_aasx(path)

    return 'AASX 변환 성공', 201


@app.route('/api/aas', methods=['delete'])
def delete_aas():
    path = request.get_json()['path']

    if path and os.path.exists(path):
        try:
            os.remove(path)
            print(f'{path} 파일 삭제 성공')
        except Exception as e:
            print(f'파일 삭제 실패: {e}')

    return 'AAS 파일 삭제 성공', 200


@app.route('/api/aasx', methods=['delete'])
def delete_aasx():
    path = request.get_json()['path']

    if path and os.path.exists(path):
        try:
            os.remove(path)
            print(f'{path} 파일 삭제 성공')
        except Exception as e:
            print(f'파일 삭제 실패: {e}')

    return 'AASX 파일 삭제 성공', 200


if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000, debug=True)
