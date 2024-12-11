# Feature Nest Stock

NestJS 주식 게임 기능입니다.

## 기능

- 주식 거래 시스템
- 사용자 관리
- 거래 로그 기록
- 게임 결과 저장

## 주요 모듈

### Stock Module
- 주식 거래의 핵심 기능 담당
- 주식 생성, 구매, 판매, 초기화 등의 기능 제공
- 실시간 주가 변동 처리

### User Module
- 사용자 정보 관리
- 사용자별 주식 보유 현황 및 자산 관리
- 사용자 추가/삭제 기능

### Log Module
- 모든 거래 내역 기록
- 거래 시간, 종목, 수량, 가격 등 상세 정보 저장

### Result Module
- 게임 결과 저장 및 조회
- 라운드별 사용자 순위 및 수익률 기록

## 기술 스택

- NestJS
- MongoDB (Mongoose)

## API 엔드포인트

### Stock
- `GET /stock/list` - 모든 주식 세션 조회
- `GET /stock?stockId={stockId}` - 특정 주식 세션 조회
- `GET /stock/phase?stockId={stockId}` - 특정 주식 세션의 현재 상태 조회
- `POST /stock/create` - 새로운 주식 세션 생성
- `PATCH /stock?stockId={stockId}` - 특정 주식 세션 수정
- `POST /stock/reset?stockId={stockId}` - 특정 주식 세션 리셋
- `POST /stock/result?stockId={stockId}` - 특정 주식 세션의 결과 저장
- `POST /stock/init?stockId={stockId}` - 특정 주식 세션 초기 환경 세팅
- `POST /stock/buy` - 주식 구매
- `POST /stock/sell` - 주식 판매
- `POST /stock/finish?stockId={stockId}` - 특정 주식 세션 거래 정지 후, 모든 사용자 주식 판매

### User
- `GET /stock/user` - 사용자 목록 조회
- `POST /stock/user` - 사용자 추가
- `DELETE /stock/user` - 사용자 삭제'
- `DELETE /stock/user/all?stockId={stockId}` - 특정 주식 세션의 모든 사용자 삭제

### Log
- `GET /stock/log?stockId={stockId}&userId={userId}` - 거래 로그 조회

### Result
- `GET /stock/result?stockId={stockId}` - 게임 결과 조회
```
