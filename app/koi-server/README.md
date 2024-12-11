# KOI-SERVER

## 소개
KOI-SERVER는 파티 게임 플랫폼의 백엔드 애플리케이션입니다. NestJS와 TypeScript를 기반으로 제작되었으며, MongoDB를 데이터베이스로 사용합니다.

## 기술 스택
- NestJS
- TypeScript
- MongoDB (Mongoose)
- AWS Lambda
- Serverless Framework

## 주요 기능

### 1. 파티 시스템
- 파티 생성/조회/수정/삭제
- 파티 참가/탈퇴
- 실시간 파티 상태 관리

### 2. 게임 기능
- 주식 게임 시스템
- 투표 시스템

### 3. 배포
- AWS Lambda를 통한 서버리스 배포
- Serverless Framework 사용

## 설치 및 실행

1. 의존성 설치
    ```bash
    yarn install
    ```

2. 환경 변수 설정
- 환경 변수에 대한 자세한 내용은 `하이안`에게 문의해 주세요.
    ```
    MONGO_URI=your_mongodb_connection_string
    ```

3. hosts 파일 설정
    ```bash
    # Windows의 경우: C:\Windows\System32\drivers\etc\hosts
    # Mac/Linux의 경우: /etc/hosts
    
    # 아래 내용을 hosts 파일에 추가
    127.0.0.1    local.palete.me
    ```

4. 개발 서버 실행
    ```bash
    yarn turbo:dev
    ```

5. 프로덕션 빌드
    ```bash
    yarn build
    ```

## 트러블 슈팅

### shared config 빌드 관련 오류

  `yarn turbo:dev` 실행 시 빌드 오류가 발생하는 경우:
    ```bash
    # 1. koi-client 디렉토리로 이동 ( ./app/koi-client로 이동 )
    cd ../koi-client

    # 2. shared config 빌드
    yarn build-shared~config

    # 3. 다시 koi-server 디렉토리로 이동
    cd ../koi-server

    # 4. 개발 서버 재실행
    yarn turbo:dev
    ```

### 데이터베이스 연결 오류

  다음과 같은 에러 발생 시:
  ```bash
  koi-server:dev: [Nest] 73196  - 2024. 12. 10. 오후 9:12:54   ERROR [MongooseModule] Unable to connect to the database. Retrying (1)...
  ```
  `.env` 파일의 환경 변수 키와 값이 올바르게 설정되어 있는지 확인하세요.

## API 명세

### 주식 API

> sdc-stock/package/feature/feature-nest-stock 의 README.md 참고

### 파티 API

#### 파티 조회
- **GET** `/party/query`
  - 모든 파티 목록을 조회합니다
  - 응답: `Party[]`

- **GET** `/party/query/:partyId`
  - 특정 파티의 상세 정보를 조회합니다
  - 파라미터:
    - `partyId`: 파티 ID
  - 응답: `Party`

#### 파티 생성
- **POST** `/party`
  - 새로운 파티를 생성합니다

#### 파티 참가/탈퇴
- **POST** `/party/join`
  - 파티에 참가합니다
  - 요청 본문:
    ```typescript
    {
      partyId: string;
      userId: string;
    }
    ```

- **POST** `/party/leave`
  - 파티에서 탈퇴합니다
  - 요청 본문:
    ```typescript
    {
      partyId: string;
      userId: string;
    }
    ```
  - 응답: `Party`

#### 파티 수정/삭제
- **PATCH** `/party`
  - 파티 정보를 수정합니다

- **DELETE** `/party`
  - 파티를 삭제합니다
  - 쿼리 파라미터:
    - `partyId`: 삭제할 파티 ID
  - 응답: `boolean`