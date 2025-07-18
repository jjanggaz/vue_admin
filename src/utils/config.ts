// 환경 변수 설정 관리
export const config = {
  fileServer: {
    baseUrl:
      import.meta.env.VITE_FILE_SERVER_BASE_URL || "http://localhost:5000",
  },
};

// 파일 API URL 생성 헬퍼 함수
export const getFileApiUrl = (endpoint: string): string => {
  const fullUrl = `${config.fileServer.baseUrl}${endpoint}`;
  return fullUrl;
};
