### Backend 실행 방법 ---

- backend/.env 파일 생성 필요
  - PORT, DB_HOST, DB_USER, DB_PASS, DB_NAME, DB_PORT, JWT_SECRET

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

### DB 관련 ---

#### 별칭

1. tb_aasx_alias
   - aasx 파일 생성을 위한 영어 이름 명시 테이블
   - as_en에는 괄호 등 기호 사용 불가. 영어, 숫자 정도만 사용하기
   - 사용하는 모든 이름들은 꼭 등록 후 프로그램 사용 요망

#### 기초코드

1. tb_aasx_base
   - 기초 코드 관련 테이블
2. tb_aasx_base_sensor
   - 기초 코드 - 센서 중간 테이블 (각 기초코드에서 선택한 센서들 저장)

#### AASX 기본 구조 (idx는 제공 DB 참고하여 작성 -> auto_increment X)

1. tb_aasx_data
   - 공장 관련 테이블
2. tb_aasx_data_aas
   - 설비 그룹 관련 테이블 (1호기 ~ 16호기)
3. tb_aasx_data_sm
   - 설비 관련 테이블
4. tb_aasx_data_prop
   - 센서 관련 테이블

#### 엣지 게이트웨이

1. tb_aasx_edge_gateway
   - edge gateway 관리 관련 테이블

#### 파일 관련

1. tb_aasx_file
   - 파일 관련 테이블
   - af_kind (1: json / 2: aas / 3: aasx)

#### 센서 관련 테이블

1. tb_aasx_sensor_info
   - 각 센서의 공장이름, 설비그룹이름, 설비이름, 센서이름, 데이터 수식, 단위 저장
2. tb_aasx_sensor_data
   - 각 센서의 mt_idx, sn_data, 수식을 통해 도출된 데이터 저장

### 유의사항 ---

- fc_idx는 제1공장 3으로 fix되어있습니다. (공장 1개)
