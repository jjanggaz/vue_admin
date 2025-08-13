# 대시보드 API 구현 가이드

## API 엔드포인트

### 대시보드 데이터 (서버 상태 포함)

```
GET /api/dashboard/server
```

## 응답 형식

### 대시보드 데이터 응답 (200)

```json
{
  "success": true,
  "message": "대시보드 데이터를 성공적으로 가져왔습니다.",
  "data": {
    "serverStatus": {
      "capacity": {
        "total": 1023303708672,
        "used": 110692831232,
        "free": 912610877440
      },
      "cpu": {
        "usage": 13,
        "cores": 12,
        "temperature": 0
      },
      "ram": {
        "total": 16253579264,
        "used": 13731098624,
        "free": 2522480640,
        "usage": 84
      },
      "system": {
        "uptime": 14225,
        "loadAverage": [-1, -0.8, -0.6],
        "osInfo": "Windows 11 10.0"
      }
    },
    "projectStats": {
      "total": 10,
      "inProgress": 5,
      "completed": 3
    },
    "modelStats": {
      "total": 25,
      "pending": 8,
      "approved": 15
    },
    "approvalStats": {
      "total": 30,
      "pending": 12,
      "approved": 15,
      "rejected": 3
    }
  },
  "error": null
}
```

### 오류 응답 (500)

```json
{
  "success": false,
  "message": "서버 내부 오류가 발생했습니다.",
  "error": "Internal server error"
}
```

## 데이터 필드 설명

### serverStatus

- **capacity**: 서버 저장소 용량 정보 (바이트 단위)
  - `total`: 전체 용량
  - `used`: 사용 중인 용량
  - `free`: 여유 용량
- **cpu**: CPU 상태 정보
  - `usage`: CPU 사용률 (0-100%)
  - `cores`: CPU 코어 수
  - `temperature`: CPU 온도 (섭씨)
- **ram**: 메모리 상태 정보 (바이트 단위)
  - `total`: 전체 메모리
  - `used`: 사용 중인 메모리
  - `free`: 여유 메모리
  - `usage`: 메모리 사용률 (0-100%)
- **system**: 시스템 정보
  - `uptime`: 시스템 가동 시간 (초)
  - `load_average`: 시스템 로드 평균 [1분, 5분, 15분]
  - `os_info`: 운영체제 정보

### projectStats

- **total**: 전체 프로젝트 수
- **inProgress**: 진행 중인 프로젝트 수
- **completed**: 완료된 프로젝트 수

### modelStats

- **total**: 전체 3D 모델 수
- **pending**: 승인 대기 중인 모델 수
- **approved**: 승인된 모델 수

### approvalStats

- **total**: 전체 승인 건수
- **pending**: 승인 대기 중인 건수
- **approved**: 승인된 건수
- **rejected**: 거부된 건수

## 구현 시 주의사항

1. **용량 단위**: 모든 용량 정보는 바이트 단위로 제공
2. **백분율**: CPU, RAM 사용률은 0-100 사이의 정수
3. **온도**: CPU 온도는 섭씨 단위 (Windows에서는 0으로 표시될 수 있음)
4. **시간**: 업타임은 초 단위
5. **로드 평균**: 3개 값의 배열로 제공 (1분, 5분, 15분 평균, Windows에서는 음수 값이 표시될 수 있음)
6. **에러 처리**: 서버 상태 정보를 가져올 수 없는 경우 적절한 기본값 제공
7. **운영체제**: Windows와 Linux에서 시스템 정보 수집 방식이 다를 수 있음

## 백엔드 구현 예시 (Node.js/Express)

```javascript
const express = require("express");
const router = express.Router();

// 대시보드 데이터 조회 (서버 상태 포함)
router.get("/api/dashboard/server", async (req, res) => {
  try {
    // 서버 상태 정보 수집
    const serverStatus = await collectServerStatus();

    // 프로젝트 통계 수집
    const projectStats = await collectProjectStats();

    // 모델 통계 수집
    const modelStats = await collectModelStats();

    // 승인 통계 수집
    const approvalStats = await collectApprovalStats();

    const dashboardData = {
      serverStatus,
      projectStats,
      modelStats,
      approvalStats,
    };

    res.json({
      success: true,
      message: "대시보드 데이터를 성공적으로 가져왔습니다.",
      data: dashboardData,
    });
  } catch (error) {
    console.error("Dashboard API error:", error);
    res.status(500).json({
      success: false,
      message: "서버 내부 오류가 발생했습니다.",
      error: error.message,
    });
  }
});

async function collectServerStatus() {
  // 시스템 정보 수집 로직 구현
  // 예: os 모듈, systeminformation 라이브러리 등 사용
}

module.exports = router;
```
