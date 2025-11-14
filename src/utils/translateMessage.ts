import { useI18n } from "vue-i18n";

/**
 * Vue 컴포넌트 내에서 사용할 translateMessage 함수 생성
 * 백엔드에서 반환되는 메시지가 다국어 키인 경우 번역 처리
 *
 * @returns translateMessage 함수
 * @example
 * ```typescript
 * const translateMessage = useTranslateMessage();
 * const errorMessage = translateMessage(error?.message, "messages.error.saveFailed");
 * ```
 */
export const useTranslateMessage = () => {
  const { t } = useI18n();

  const translateMessage = (
    message: string | undefined,
    fallbackKey: string
  ): string => {
    if (!message) return t(fallbackKey);
    return message.startsWith("messages.") ? t(message) : message;
  };

  return translateMessage;
};
