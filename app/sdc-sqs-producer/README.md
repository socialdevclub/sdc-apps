# SQS Producer for Stock User Registration

이 애플리케이션은 AWS Lambda를 통해 실행되는 NestJS 기반 API 서버로, 사용자 등록 요청을 받아 AWS SQS 큐로 전송하는 역할을 담당합니다.

## 주요 기능

- REST API를 통한 사용자 등록 요청 수신
- AWS SQS를 활용한 비동기 메시지 처리
- 클라이언트에 메시지 ID 응답

## 기술 스택

- NestJS: 백엔드 프레임워크
- AWS Lambda: 서버리스 컴퓨팅
- AWS SQS: 메시지 큐
- TypeScript: 프로그래밍 언어

## 프로젝트 구조

```
src/
├── main.ts                  # Lambda 핸들러 및 NestJS 애플리케이션 부트스트랩
├── app.module.ts            # 애플리케이션 모듈 정의
└── sqs-producer/
    ├── sqs-producer.controller.ts  # API 라우팅 및 요청 처리
    ├── sqs-producer.module.ts      # Producer 모듈 정의
    └── sqs-producer.service.ts     # SQS 메시지 전송 로직
```

## API 엔드포인트

- `POST /queue/stock/user/register`: 사용자 등록 요청을 SQS 큐로 전송

## 설치 및 실행

### 개발 환경 설정

1. 패키지 설치:
```bash
yarn
```

2. 환경 변수 설정 (.env 파일):
```
AWS_SQS_QUEUE_URL=https://sqs.ap-northeast-2.amazonaws.com/YOUR-ACCOUNT-ID/sdc-sqs
```

3. 개발 서버 실행:
```bash
yarn dev
```

### 빌드 및 배포

1. 애플리케이션 빌드:
```bash
yarn build
```

2. Lambda 배포 패키지 생성:
```bash
cd dist && zip -r ../function.zip .
```

## AWS 설정 가이드

### 1. Lambda 함수 생성

1. AWS 콘솔에서 Lambda 서비스로 이동
2. "Create function" 클릭
3. 다음 설정으로 함수 생성:
   - 이름: `sdc-stock-producer`
   - 런타임: Node.js 18.x
   - 아키텍처: x86_64 또는 arm64
4. 생성한 `function.zip` 파일을 Lambda 함수에 업로드
5. 환경 변수 설정: .env.tmp 를 보고 .env 파일을 만들어서 채워넣습니다.
6. 핸들러 설정: `main.handler`
7. 메모리: 최소 512MB
8. 타임아웃: 30초

### 2. API Gateway 설정

1. Lambda 함수의 "Configuration" 탭으로 이동
2. "Triggers" 섹션에서 "Add trigger" 클릭
3. API Gateway 선택:
   - API 타입: REST API
   - 보안: Open (필요에 따라 변경)
4. API Gateway 설정에서 자원 및 메서드 구성:
   - 경로: `/queue/stock/user/register`
   - 메서드: POST

### 3. IAM 권한 설정

Lambda 실행 역할에 필요한 권한:
1. AWS 콘솔에서 IAM 서비스로 이동
2. "Roles" 선택 후 Lambda 함수의 실행 역할 클릭
3. "Attach policies" 클릭하여 다음 정책 추가:
   - `AWSLambdaBasicExecutionRole`
   - `AmazonSQSFullAccess` (필요에 따라 제한된 권한으로 대체)

## 테스트

API 엔드포인트에 다음과 같은 POST 요청을 보내 테스트할 수 있습니다:

```bash
curl -X POST https://YOUR-API-GATEWAY-URL/queue/stock/user/register \
  -H "Content-Type: application/json" \
  -d '{"userId": "test123", "stockId": "AAPL"}'
```

성공적인 응답:
```json
{
  "messageId": "12345678-1234-1234-1234-123456789012"
}
``` 