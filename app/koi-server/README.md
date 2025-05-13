# KOI-SERVER

## 소개
KOI-SERVER는 파티 게임 플랫폼의 백엔드 애플리케이션입니다. NestJS와 TypeScript를 기반으로 제작되었으며, MongoDB와 DynamoDB를 데이터베이스로 사용합니다.

## 기술 스택
- NestJS
- TypeScript
- MongoDB (Mongoose)
- DynamoDB
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
    AWS_PROFILE=your_aws_profile_name
    ```

3. hosts 파일 설정
    ```bash
    # Windows의 경우: C:\Windows\System32\drivers\etc\hosts
    # Mac/Linux의 경우: /etc/hosts
    
    # 아래 내용을 hosts 파일에 추가
    127.0.0.1    local.socialdev.club
    ```

4. DynamoDB 액세스 설정
   1. 소셜데브클럽 디스코드에 아래 양식을 작성하고, 하이안을 태그합니다.
      ```
      사용자 이름: 영어닉네임
      이메일주소:
      이름: 이름
      성: 성
      표시이름: 영어닉네임
      ```

   2. AWS CLI 설치
      - macOS
        ```bash
        curl "https://awscli.amazonaws.com/AWSCLIV2.pkg" -o "AWSCLIV2.pkg"
        sudo installer -pkg AWSCLIV2.pkg -target /
        ```
      - Windows
        ```
        https://awscli.amazonaws.com/AWSCLIV2.msi 다운로드 후 실행
        ```
      - Linux
        ```bash
        curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
        unzip awscliv2.zip
        sudo ./aws/install
        ```
      - 자세한 설치 방법은 [AWS CLI 설치 가이드](https://docs.aws.amazon.com/ko_kr/cli/latest/userguide/getting-started-install.html)를 참고하세요.

   3. AWS SSO 설정
      ```bash
      aws configure sso
      ```
      
      아래와 같이 입력합니다:
      ```
      SSO session name (Recommended): socialdevclub
      SSO start URL [None]: https://socialdevclub.awsapps.com/start
      SSO region [None]: ap-northeast-2
      SSO registration scopes [sso:account:access]: (그냥 엔터 입력)
      ```
      
      이후 AWS 브라우저가 열리면 로그인합니다.
      
      ```
      Default client Region [None]: ap-northeast-2
      CLI default output format (json if not specified) [None]: json
      Profile name: (원하는 프로필 이름으로 입력)
      ```

   4. AWS 프로필 환경변수 설정
      - macOS/Linux의 경우: `.zshrc` 또는 `.bashrc` 파일에 추가
        ```bash
        export AWS_PROFILE=your_profile_name
        ```
      - Windows의 경우: 시스템 환경 변수에 추가
        ```
        변수 이름: AWS_PROFILE
        변수 값: your_profile_name
        ```

5. 개발 서버 실행
    ```bash
    yarn turbo:dev
    ```

6. 프로덕션 빌드
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

> [sdc-stock/package/feature/feature-nest-stock의 README.md](https://github.com/omizha/sdc-stock/blob/main/package/feature/feature-nest-stock/README.md) 참고

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
  - 응답: `Party`

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