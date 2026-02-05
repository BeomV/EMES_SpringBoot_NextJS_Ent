/**
 * 포맷팅 유틸리티
 * 리스트 페이지의 DataTable에서 사용하는 공통 포맷팅 함수들
 *
 * 장점:
 * - 일관된 데이터 표시 형식
 * - 날짜, 시간, 전화번호 등 다양한 형식 지원
 * - 다른 페이지에서 쉽게 재사용 가능
 *
 * @example
 * ```typescript
 * // DataTable의 render 함수에서 사용
 * {
 *   key: 'createdAt',
 *   header: '등록일',
 *   render: (_, row) => formatDate(row.createdAt),
 * }
 * ```
 */

/**
 * 날짜 포맷팅
 * 날짜 문자열을 한국식 날짜 형식으로 변환
 *
 * @param date - ISO 형식 날짜 문자열 (또는 undefined)
 * @param format - 포맷 형식 ('short' | 'long')
 * @returns 포맷된 날짜 문자열 또는 '-'
 *
 * @example
 * formatDate('2024-01-15T10:30:00Z', 'short') // '2024.01.15'
 * formatDate('2024-01-15T10:30:00Z', 'long')  // '2024년 1월 15일'
 * formatDate(undefined) // '-'
 */
export function formatDate(
  date: string | undefined,
  format: 'short' | 'long' = 'short'
): string {
  if (!date) return '-';

  const d = new Date(date);

  if (format === 'short') {
    return d.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  }

  // 'long' 형식
  return d.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * 날짜-시간 포맷팅
 * 날짜와 시간을 함께 표시
 *
 * @param date - ISO 형식 날짜 문자열 (또는 undefined)
 * @returns 포맷된 날짜-시간 문자열 또는 '-'
 *
 * @example
 * formatDateTime('2024-01-15T14:30:00Z') // '2024. 1. 15. 오후 2:30:00'
 * formatDateTime(undefined) // '-'
 */
export function formatDateTime(date: string | undefined): string {
  if (!date) return '-';

  return new Date(date).toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

/**
 * 시간 포맷팅 (시:분 형식)
 * 시간만 표시 (날짜 제외)
 *
 * @param date - ISO 형식 날짜 문자열 (또는 undefined)
 * @returns 포맷된 시간 문자열 또는 '-'
 *
 * @example
 * formatTime('2024-01-15T14:30:00Z') // '14:30'
 * formatTime(undefined) // '-'
 */
export function formatTime(date: string | undefined): string {
  if (!date) return '-';

  return new Date(date).toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false, // 24시간 형식
  });
}

/**
 * 전화번호 포맷팅
 * 010-1234-5678 형식으로 변환
 *
 * @param phone - 전화번호 (하이픈 없는 형식 또는 undefined)
 * @returns 포맷된 전화번호 또는 '-'
 *
 * @example
 * formatPhoneNumber('01012345678') // '010-1234-5678'
 * formatPhoneNumber(undefined) // '-'
 *
 * @note
 * 11자리 숫자를 가정하고 있음
 * 다른 형식의 전화번호는 적절히 수정 필요
 */
export function formatPhoneNumber(phone: string | undefined): string {
  if (!phone) return '-';

  // 숫자만 추출
  const digits = phone.replace(/\D/g, '');

  // 11자리인 경우
  if (digits.length === 11) {
    return digits.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
  }

  // 10자리인 경우 (지역번호 2자리)
  if (digits.length === 10) {
    return digits.replace(/(\d{2})(\d{4})(\d{4})/, '$1-$2-$3');
  }

  // 포맷 불가능한 경우 원본 반환
  return phone;
}

/**
 * 숫자 포맷팅 (천 단위 구분)
 * 1000 -> '1,000'
 *
 * @param num - 숫자 (또는 undefined)
 * @param decimals - 소수점 자리수 (선택사항, 기본값: 0)
 * @returns 포맷된 숫자 문자열 또는 '-'
 *
 * @example
 * formatNumber(1234567) // '1,234,567'
 * formatNumber(1234.5, 1) // '1,234.5'
 * formatNumber(undefined) // '-'
 */
export function formatNumber(num: number | undefined, decimals: number = 0): string {
  if (num === undefined || num === null) return '-';

  return num.toLocaleString('ko-KR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * 통화 포맷팅 (원화)
 * 1000 -> '₩1,000'
 *
 * @param amount - 금액 (또는 undefined)
 * @param decimals - 소수점 자리수 (선택사항, 기본값: 0)
 * @returns 포맷된 통화 문자열 또는 '-'
 *
 * @example
 * formatCurrency(1234567) // '₩1,234,567'
 * formatCurrency(1234.5, 1) // '₩1,234.5'
 * formatCurrency(undefined) // '-'
 */
export function formatCurrency(amount: number | undefined, decimals: number = 0): string {
  if (amount === undefined || amount === null) return '-';

  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
}

/**
 * 백분율 포맷팅
 * 0.75 -> '75%'
 *
 * @param value - 값 (0-1 범위 또는 0-100 범위)
 * @param decimals - 소수점 자리수 (선택사항, 기본값: 0)
 * @param isDecimal - 입력값이 0-1 범위인지 여부 (기본값: true)
 * @returns 포맷된 백분율 문자열 또는 '-'
 *
 * @example
 * formatPercent(0.75) // '75%'
 * formatPercent(75, 0, false) // '75%'
 * formatPercent(0.123, 1) // '12.3%'
 * formatPercent(undefined) // '-'
 */
export function formatPercent(
  value: number | undefined,
  decimals: number = 0,
  isDecimal: boolean = true
): string {
  if (value === undefined || value === null) return '-';

  const percent = isDecimal ? value * 100 : value;

  return `${percent.toLocaleString('ko-KR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}%`;
}

/**
 * 자간 폭주 (Truncate)
 * 문자열이 너무 길면 줄임말로 표시
 *
 * @param text - 텍스트 (또는 undefined)
 * @param maxLength - 최대 길이
 * @param suffix - 줄임말 (기본값: '...')
 * @returns 폭주된 텍스트 또는 '-'
 *
 * @example
 * formatTruncate('Very long text here', 10) // 'Very long...'
 * formatTruncate('Short', 10) // 'Short'
 * formatTruncate(undefined) // '-'
 */
export function formatTruncate(
  text: string | undefined,
  maxLength: number,
  suffix: string = '...'
): string {
  if (!text) return '-';

  if (text.length <= maxLength) {
    return text;
  }

  return text.substring(0, maxLength - suffix.length) + suffix;
}

/**
 * 부울 값 표시
 * true -> '예', false -> '아니오'
 *
 * @param value - 부울 값 (또는 undefined)
 * @param trueLabel - true일 때 표시할 텍스트 (기본값: '예')
 * @param falseLabel - false일 때 표시할 텍스트 (기본값: '아니오')
 * @returns 라벨 텍스트 또는 '-'
 *
 * @example
 * formatBoolean(true) // '예'
 * formatBoolean(false) // '아니오'
 * formatBoolean(true, '활성', '비활성') // '활성'
 * formatBoolean(undefined) // '-'
 */
export function formatBoolean(
  value: boolean | undefined,
  trueLabel: string = '예',
  falseLabel: string = '아니오'
): string {
  if (value === undefined || value === null) return '-';

  return value ? trueLabel : falseLabel;
}

/**
 * 파일 크기 포맷팅
 * 1024000 -> '1 MB'
 *
 * @param bytes - 바이트 수 (또는 undefined)
 * @param decimals - 소수점 자리수 (선택사항, 기본값: 2)
 * @returns 포맷된 파일 크기 또는 '-'
 *
 * @example
 * formatFileSize(1024) // '1 KB'
 * formatFileSize(1048576) // '1 MB'
 * formatFileSize(undefined) // '-'
 */
export function formatFileSize(bytes: number | undefined, decimals: number = 2): string {
  if (bytes === undefined || bytes === null || bytes === 0) return '-';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return (
    parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i]
  );
}
