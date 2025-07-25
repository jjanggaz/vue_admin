import { defineStore } from "pinia";
import { getFileApiUrl } from "@/utils/config";

// request 함수 스타일을 따른 파일 업로드 API 함수
const fileUploadRequest = async (
  path: string,
  formData: FormData,
  onProgress?: (progress: number) => void
) => {
  return new Promise<any>((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    // 진행률 추적
    if (onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round(
            (event.loaded / event.total) * 100
          );
          onProgress(percentComplete);
        }
      };
    }

    // 요청 완료 처리 (request 함수와 동일한 패턴)
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          resolve(response);
        } catch (error) {
          resolve({ success: true }); // JSON 파싱 실패 시 기본 성공 응답
        }
      } else {
        // 400 오류 등에서 서버 응답 메시지 확인
        let errorMessage = `HTTP ${xhr.status}: ${xhr.statusText}`;
        try {
          const errorResponse = JSON.parse(xhr.responseText);
          if (errorResponse.error || errorResponse.message) {
            errorMessage = errorResponse.error || errorResponse.message;
          }
        } catch (e) {
          // JSON 파싱 실패 시 원본 응답 텍스트 사용
          if (xhr.responseText) {
            errorMessage = `${errorMessage} - ${xhr.responseText}`;
          }
        }

        console.error(`[fileUploadRequest] 업로드 실패:`, {
          status: xhr.status,
          statusText: xhr.statusText,
          responseText: xhr.responseText,
          url: getFileApiUrl(path),
        });

        reject(new Error(`파일 업로드 실패: ${errorMessage}`));
      }
    };

    // 네트워크 오류 처리 (request 함수와 동일한 패턴)
    xhr.onerror = () => {
      console.error(`[fileUploadRequest] 네트워크 오류 발생:`, {
        url: getFileApiUrl(path),
        errorType: "XMLHttpRequest Network Error",
      });
      reject(
        new Error(
          `네트워크 연결에 실패했습니다. 서버가 실행중인지 확인해주세요. (${getFileApiUrl(
            path
          )})`
        )
      );
    };

    // 타임아웃 처리
    xhr.ontimeout = () => {
      reject(new Error("API Call Fail: Timeout"));
    };

    // 요청 설정 및 전송
    const url = getFileApiUrl(path);
    xhr.open("POST", url);
    xhr.timeout = 30000; // 30초 타임아웃
    xhr.send(formData);
  });
};

// request 함수 패턴을 따른 파일 관련 API 함수
const fileApiRequest = async (
  path: string,
  options: RequestInit = { method: "GET" }
) => {
  try {
    const url = getFileApiUrl(path);
    const res = await fetch(url, options);

    if (!res.ok) {
      throw new Error(`API Call Fail: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    return data;
  } catch (e) {
    if (e instanceof Error) {
      console.error(`[fileApiRequest] 오류 발생:`, e);
      console.error(`[fileApiRequest] 오류 메시지:`, e.message);
      console.error(`[fileApiRequest] 오류 타입:`, e.name);

      // CORS 오류 감지
      if (e.message.includes("Failed to fetch") || e.name === "TypeError") {
        console.error(`[fileApiRequest] CORS 또는 네트워크 오류 상세:`, {
          url: getFileApiUrl(path),
          options,
          errorType: "Network/CORS Error",
          message: e.message,
          name: e.name,
          possibleCauses: [
            "CORS 설정 문제 (가장 가능성 높음)",
            "서버가 실행되지 않음",
            "네트워크 연결 문제",
            "방화벽 차단",
          ],
          solution: "Python 서버에 CORS 설정을 추가해주세요",
        });

        // CORS 문제일 가능성이 높다는 메시지
        throw new Error(
          `CORS 오류가 발생했습니다. Python 서버에 CORS 설정을 추가해주세요.\n` +
            `URL: ${getFileApiUrl(path)}\n` +
            `원본 오류: ${e.message}`
        );
      }

      throw e;
    } else {
      const error = new Error("An unexpected error occurred");
      console.error(error.message);
      throw error;
    }
  }
};

// 업로드된 파일 타입 정의
export interface UploadedFile {
  id: number;
  name: string;
  originalName: string;
  uploadDate: Date;
  size: number;
  filepath: string; // 서버 파일 경로
  filename: string; // 서버에서 생성한 파일명
}

export const useFileUploadStore = defineStore("fileUpload", {
  state: () => ({
    // 선택된 파일들 (업로드 전)
    selectedFiles: [] as File[],

    // 업로드된 파일들 (업로드 완료)
    uploadedFiles: [] as UploadedFile[],

    // 업로드 상태
    uploading: false,
    uploadProgress: 0,

    // 드래그 상태
    isDragOver: false,

    // 설정
    maxFileSize: 10 * 1024 * 1024, // 10MB (바이트 단위)
    allowedFileTypes: [] as string[], // 허용할 파일 확장자 (빈 배열이면 모든 타입 허용)
    defaultUploadFolder: "excel", // 기본 업로드 폴더명
  }),

  getters: {
    // 파일 크기를 읽기 쉬운 형태로 변환
    formatFileSize:
      () =>
      (bytes: number): string => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
      },

    // 최대 파일 크기를 읽기 쉬운 형태로 변환
    maxFileSizeFormatted(): string {
      return this.formatFileSize(this.maxFileSize);
    },

    // 선택된 파일이 있는지 확인
    hasSelectedFiles(): boolean {
      return this.selectedFiles.length > 0;
    },

    // 업로드된 파일이 있는지 확인
    hasUploadedFiles(): boolean {
      return this.uploadedFiles.length > 0;
    },
  },

  actions: {
    // 파일 추가 (단일 파일, 유효성 검사 포함)
    addFiles(files: File[]) {
      if (files.length === 0) return;

      // 첫 번째 파일만 선택 (단일 파일 업로드)
      const file = files[0];

      // 파일 크기 검사
      if (file.size > this.maxFileSize) {
        alert(
          `${file.name}은(는) 파일 크기가 너무 큽니다. (최대 ${this.maxFileSizeFormatted})`
        );
        return;
      }

      // 파일 타입 검사 (설정된 경우에만)
      if (this.allowedFileTypes.length > 0) {
        const fileExtension = file.name.split(".").pop()?.toLowerCase();
        if (!fileExtension || !this.allowedFileTypes.includes(fileExtension)) {
          alert(
            `${
              file.name
            }은(는) 허용되지 않는 파일 형식입니다. (허용: ${this.allowedFileTypes.join(
              ", "
            )})`
          );
          return;
        }
      }

      // 기존 파일 대체 (단일 파일만 유지)
      this.selectedFiles = [file];
    },

    // 선택된 파일 제거
    removeSelectedFile(index: number) {
      this.selectedFiles.splice(index, 1);
    },

    // 선택된 파일 전체 삭제
    clearSelectedFiles() {
      this.selectedFiles = [];
    },

    // 드래그 상태 관리
    setDragOver(isDragOver: boolean) {
      this.isDragOver = isDragOver;
    },

    // 파일 업로드 (단일 파일 업로드)
    async uploadFiles(uploadFolder?: string, onSuccess?: () => void) {
      const folderToUse = uploadFolder || this.defaultUploadFolder;
      if (this.selectedFiles.length === 0) {
        alert("업로드할 파일을 선택해주세요.");
        return;
      }

      this.uploading = true;
      this.uploadProgress = 0;

      try {
        const file = this.selectedFiles[0]; // 단일 파일만 업로드
        const formData = new FormData();
        formData.append("file", file); // 서버 스펙에 맞춰 'file' 파라미터 사용
        formData.append("upload_folder", folderToUse); // 폴더명 추가

        // 파일 업로드
        const response = await fileUploadRequest(
          "/api/upload",
          formData,
          (progress) => {
            this.uploadProgress = progress;
          }
        );

        // API 스펙에 맞는 응답 처리
        if (response && response.message) {
          // 성공 메시지
          alert(
            `파일 "${
              response.original_filename || file.name
            }"이(가) 성공적으로 업로드되었습니다.`
          );

          // 선택된 파일 초기화
          this.clearSelectedFiles();

          // 완료 상태를 잠시 표시하기 위해 지연
          setTimeout(() => {
            this.uploadProgress = 0;
          }, 1500); // 1.5초 후 프로그래스바 숨김

          // 성공 콜백 호출 (파일 목록 새로고침용)
          if (onSuccess) {
            onSuccess();
          }
        } else {
          throw new Error("서버 응답이 올바르지 않습니다.");
        }
      } catch (error) {
        console.error("파일 업로드 중 오류:", error);

        // 사용자에게 친화적인 오류 메시지 표시
        let errorMessage = "파일 업로드 중 오류가 발생했습니다.";

        if (error instanceof Error) {
          if (error.message.includes("CORS 오류가 발생했습니다")) {
            errorMessage = error.message; // CORS 오류 메시지 그대로 표시
          } else if (error.message.includes("API Call Fail: Network Error")) {
            errorMessage = "네트워크 연결을 확인해주세요.";
          } else if (error.message.includes("API Call Fail: Timeout")) {
            errorMessage =
              "파일이 너무 크거나 네트워크가 느립니다. 다시 시도해주세요.";
          } else if (error.message.includes("API Call Fail")) {
            errorMessage = `서버 오류가 발생했습니다. ${error.message}`;
          } else {
            errorMessage = error.message;
          }
        }

        alert(errorMessage);

        // 오류 발생 시 즉시 프로그래스바 초기화
        this.uploadProgress = 0;
      } finally {
        this.uploading = false;
      }
    },

    // 업로드된 파일 다운로드
    async downloadFile(file: UploadedFile) {
      try {
        // 새로운 API 스펙에 맞춘 다운로드 URL 생성
        const downloadUrl = getFileApiUrl(
          `/api/download?filename=${encodeURIComponent(file.filename)}`
        );

        // 서버 응답을 Blob으로 받아서 강제로 원본 파일명으로 다운로드
        const response = await fetch(downloadUrl);

        if (!response.ok) {
          throw new Error(
            `다운로드 실패: ${response.status} ${response.statusText}`
          );
        }

        // 응답을 Blob으로 변환
        const blob = await response.blob();

        // Blob URL 생성
        const blobUrl = URL.createObjectURL(blob);

        // 다운로드 링크 생성 및 클릭
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = file.originalName; // 원본 파일명으로 강제 다운로드
        link.style.display = "none";
        document.body.appendChild(link);
        link.click();

        // 정리
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
      } catch (error) {
        console.error("파일 다운로드 중 오류:", error);
        alert(`파일 "${file.originalName}" 다운로드 중 오류가 발생했습니다.`);
      }
    },

    // 업로드된 파일 삭제
    async deleteUploadedFile(fileId: number, uploadFolder?: string) {
      const folderToUse = uploadFolder || this.defaultUploadFolder;
      const file = this.uploadedFiles.find((f) => f.id === fileId);
      if (!file) {
        alert("삭제할 파일을 찾을 수 없습니다.");
        return;
      }

      if (!confirm(`${file.name} 파일을 삭제하시겠습니까?`)) {
        return;
      }

      try {
        const requestBody = {
          filename: file.filename, // 서버 파일명 사용
          upload_folder: folderToUse, // 폴더명 추가
        };

        // 여러 가지 API 방식을 시도해보기
        let response;
        let lastError;

        // 방법 1: POST with JSON body (현재 방식)
        try {
          response = await fileApiRequest("/api/delete", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
          });
        } catch (error1) {
          lastError = error1;

          // 방법 2: DELETE with query parameter
          try {
            response = await fileApiRequest(
              `/api/delete?filename=${encodeURIComponent(
                file.filename
              )}&upload_folder=${encodeURIComponent(folderToUse)}`,
              {
                method: "DELETE",
              }
            );
          } catch (error2) {
            // 방법 3: DELETE /api/files/{filename}
            try {
              response = await fileApiRequest(
                `/api/files/${encodeURIComponent(
                  file.filename
                )}?upload_folder=${encodeURIComponent(folderToUse)}`,
                {
                  method: "DELETE",
                }
              );
            } catch (error3) {
              // 방법 4: POST with form data
              try {
                const formData = new FormData();
                formData.append("filename", file.filename);
                formData.append("upload_folder", folderToUse);

                const url = getFileApiUrl("/api/delete");
                const deleteResponse = await fetch(url, {
                  method: "POST",
                  body: formData,
                });

                if (!deleteResponse.ok) {
                  throw new Error(
                    `HTTP ${deleteResponse.status}: ${deleteResponse.statusText}`
                  );
                }

                response = await deleteResponse.json();
              } catch (error4) {
                // 모든 방법이 실패했으므로 첫 번째 오류를 던짐
                throw lastError;
              }
            }
          }
        }

        // 삭제 성공 시 응답 처리
        if (response && response.message) {
          // 로컬 상태에서도 파일 제거
          const index = this.uploadedFiles.findIndex((f) => f.id === fileId);
          if (index > -1) {
            this.uploadedFiles.splice(index, 1);
            alert(`파일 "${file.name}"이(가) 성공적으로 삭제되었습니다.`);
          }
        } else {
          throw new Error("서버 응답이 올바르지 않습니다.");
        }
      } catch (error) {
        console.error("파일 삭제 중 오류:", error);

        let errorMessage = "파일 삭제 중 오류가 발생했습니다.";
        if (error instanceof Error) {
          if (error.message.includes("API Call Fail")) {
            errorMessage = `서버 오류가 발생했습니다. ${error.message}`;
          } else {
            errorMessage = error.message;
          }
        }

        alert(errorMessage);
      }
    },

    // 업로드된 파일 목록 불러오기
    async loadUploadedFiles(uploadFolder?: string) {
      const folderToUse = uploadFolder || this.defaultUploadFolder;
      try {
        // request 함수 패턴을 사용한 GET 요청
        const data = await fileApiRequest(
          `/api/files?upload_folder=${encodeURIComponent(folderToUse)}`
        );

        // 서버에서 받은 파일 목록을 상태에 저장 (새로운 API 스펙에 맞춤)
        if (data && Array.isArray(data.files)) {
          this.uploadedFiles = data.files.map((file: any, index: number) => {
            // filename에서 원본 파일명 추출 (20231201_143025_document.pdf -> document.pdf)
            const originalName = this.extractOriginalFilename(file.filename);

            return {
              id: index + 1, // API에서 ID를 제공하지 않으므로 인덱스 기반 생성
              name: originalName,
              originalName: originalName,
              uploadDate: new Date(file.upload_time),
              size: file.size,
              filepath: `uploads/${file.filename}`, // 경로 추정
              filename: file.filename,
            };
          });
        } else {
          this.uploadedFiles = [];
        }
      } catch (error) {
        console.error("파일 목록 불러오기 실패:", error);

        let errorMessage = "파일 목록을 불러오는 중 오류가 발생했습니다.";
        if (error instanceof Error) {
          if (error.message.includes("API Call Fail")) {
            errorMessage = `서버 오류가 발생했습니다. ${error.message}`;
          } else {
            errorMessage = error.message;
          }
        }

        alert(errorMessage);
        throw error;
      }
    },

    // 설정 업데이트
    updateMaxFileSize(sizeInMB: number) {
      this.maxFileSize = sizeInMB * 1024 * 1024;
    },

    updateAllowedFileTypes(types: string[]) {
      this.allowedFileTypes = types;
    },

    // 파일명에서 원본 파일명 추출 (20250718_133352_Data_20250715114331.xlsx -> Data_20250715114331.xlsx)
    extractOriginalFilename(serverFilename: string): string {
      // 서버에서 생성한 파일명 패턴: YYYYMMDD_HHMMSS_원본파일명
      const match = serverFilename.match(/^\d{8}_\d{6}_(.+)$/);
      const originalName = match ? match[1] : serverFilename;

      return originalName;
    },

    // 전체 초기화
    reset() {
      this.selectedFiles = [];
      this.uploadedFiles = [];
      this.uploading = false;
      this.uploadProgress = 0;
      this.isDragOver = false;
    },
  },
});
