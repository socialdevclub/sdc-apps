# SQS Worker for Stock User Registration

이 애플리케이션은 AWS SQS에서 메시지를 수신하여 사용자 등록 요청을 비동기적으로 처리하는 Lambda 함수입니다.

## 배포 방법

1. 애플리케이션 빌드
```bash
npm run build
```

2. Lambda 배포 패키지 생성
```bash
cd dist && zip -r ../function.zip .
```

## AWS 설정 가이드

### 1. SQS 큐 생성

1. AWS 콘솔에서 SQS 서비스로 이동
2. **Create queue** 클릭
3. 다음 설정으로 큐 생성:
   - 타입: 표준 큐 (Standard Queue)
   - 이름: `stock-user-register-queue`
   - 기본 설정 사용 (필요에 따라 조정)
4. **Create** 클릭하여 큐 생성

### 2. Lambda 함수 생성

1. AWS 콘솔에서 Lambda 서비스로 이동
2. **Create function** 클릭
3. 다음 설정으로 함수 생성:
   - 이름: `sdc-stock-worker`
   - 런타임: Node.js 18.x
   - 아키텍처: x86_64 또는 arm64
4. 생성한 `function.zip` 파일을 Lambda 함수에 업로드
5. 환경 변수 설정:
   ```
   AWS_REGION=ap-northeast-2
   AWS_SQS_QUEUE_URL=https://sqs.ap-northeast-2.amazonaws.com/YOUR-ACCOUNT-ID/stock-user-register-queue
   ```
6. 핸들러 설정: `main.handler`
7. 메모리: 최소 512MB
8. 타임아웃: 30초

### 3. SQS 트리거 설정

1. Lambda 함수의 **Configuration** 탭으로 이동
2. 왼쪽 메뉴에서 **Triggers** 선택
3. **Add trigger** 클릭
4. 다음 설정으로 트리거 구성:
   - 트리거 유형: SQS
   - SQS 큐: `stock-user-register-queue`
   - 배치 크기: 10 (한 번에 처리할 최대 메시지 수)
   - 배치 창: 30초 (최대 대기 시간)
5. **Add** 클릭하여 트리거 추가

### 4. IAM 권한 설정

Lambda 실행 역할에 필요한 권한:
1. AWS 콘솔에서 IAM 서비스로 이동
2. **Roles** 선택 후 Lambda 함수의 실행 역할 클릭
3. **Attach policies** 클릭하여 다음 정책 추가:
   - `AWSLambdaSQSQueueExecutionRole`
   - `AWSLambdaBasicExecutionRole`

또는 다음 인라인 정책 추가:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "sqs:ReceiveMessage",
        "sqs:DeleteMessage",
        "sqs:GetQueueAttributes"
      ],
      "Resource": "arn:aws:sqs:ap-northeast-2:YOUR-ACCOUNT-ID:stock-user-register-queue"
    },
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "*"
    }
  ]
}
```

### 5. 데드 레터 큐(DLQ) 설정 (선택 사항)

1. 처리 실패한 메시지를 저장할 새로운 SQS 큐 생성: `stock-user-register-dlq`
2. 원본 SQS 큐의 설정으로 이동하여 **Dead-letter queue** 섹션에서 DLQ 활성화
3. 최대 수신 횟수: 3회 (3번 실패 시 DLQ로 이동)

### 6. CloudWatch 알람 설정 (선택 사항)

1. Lambda 함수나 SQS 큐의 모니터링 탭으로 이동
2. **Create alarm** 클릭
3. 다음 지표에 대한 알람 설정:
   - 큐 깊이(Queue Depth) 임계값: 100개 이상 메시지
   - 처리 지연(Processing Latency) 임계값: 5분 이상
   - 오류 발생률(Error Rate) 임계값: 10% 이상

## 로컬 개발 환경 설정

1. 환경 변수 설정 (.env.local 파일)
```
AWS_REGION=ap-northeast-2
AWS_ACCESS_KEY_ID=YOUR_ACCESS_KEY
AWS_SECRET_ACCESS_KEY=YOUR_SECRET_KEY
AWS_SQS_QUEUE_URL=https://sqs.ap-northeast-2.amazonaws.com/YOUR-ACCOUNT-ID/stock-user-register-queue
```

2. 로컬 개발 서버 실행
```bash
npm run start:dev
``` 