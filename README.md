### Backend 실행 방법 ---

1. cd backend
2. npm i
3. Backend 파일 .env 확인(DB, Port 확인필요)
   - 현재 PORT: 5001 / DB PORT: 3307
4. npm run start

### Frontend 실행 방법 ---

1. cd frontend
2. npm i
3. npm run start

### Python 실행 방법 ---

1. cd python
2. pip install basyx-python-sdk==1.1.0
3. pip install flask== 3.1.0
4. pip install orjson==3.10.16
5. python main.py

### 전체적인 페이지 흐름 ---

1. 기초코드
   - aasx 파일로 만들 센서들을 선택하여 저장
2. DATA 변환
   - 기초코드에서 선택한 센서들로 날짜범위를 선택하여 json 파일 생성(등록버튼 클릭)
3. 데이터 관리
   - DATA 변환 페이지에 의해 files/front에 기초코드idx-시작날짜-종료날짜.json으로 저장된 파일을 선택하여 등록 -> aas(aasx json) 파일 생성
4. AASX 관리
   - 데이터 관리 페이지에 의해 files/aas에 저장된 파일을 선택하여 등록 -> aasx 파일 생성
5. DATA 송신
   - 해당 AASX 파일을 트리 구조로 확인 가능
6. Edge Gateway 관리
   - 서버 관련 내용 저장
