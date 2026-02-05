/**
 * 필터 매핑 유틸리티
 * UI에서 입력받은 필터 값을 API 파라미터로 변환하는 함수들
 *
 * 장점:
 * - 필터링 로직을 재사용 가능한 함수로 분리
 * - 타입 안전성 보장
 * - 새로운 엔티티에서 쉽게 확장 가능
 *
 * @example
 * ```typescript
 * // 1단계: 매퍼 함수 정의
 * const filterMapper = createFilterMapper<UserSearchParams, UserFilterValues>({
 *   username: mapTextFilter,
 *   displayName: mapTextFilter,
 *   department: mapTextFilter,
 *   enabled: mapBooleanFilter,
 *   accountLocked: mapBooleanFilter,
 * });
 *
 * // 2단계: useListPage에서 사용
 * const { handleFilter } = useListPage({
 *   filterMapper,
 *   // ... 다른 config
 * });
 * ```
 */

/**
 * 텍스트 필터 매퍼
 * 빈 문자열을 undefined로 변환 (API에서 필터링하지 않음)
 *
 * @param value - 입력값
 * @returns 정리된 문자열 또는 undefined
 *
 * @example
 * mapTextFilter('john') // 'john'
 * mapTextFilter('') // undefined
 * mapTextFilter('  ') // undefined
 */
export function mapTextFilter(value: string | undefined): string | undefined {
  return value && value.trim() !== '' ? value : undefined;
}

/**
 * 불린 필터 매퍼
 * 문자열 'true' / 'false'를 boolean으로 변환
 *
 * @param value - 입력값 ('true', 'false', 또는 '')
 * @returns boolean 또는 undefined
 *
 * @example
 * mapBooleanFilter('true') // true
 * mapBooleanFilter('false') // false
 * mapBooleanFilter('') // undefined
 */
export function mapBooleanFilter(value: string | undefined): boolean | undefined {
  if (!value || value === '') return undefined;
  return value === 'true';
}

/**
 * 숫자 필터 매퍼
 * 문자열을 숫자로 변환
 *
 * @param value - 입력값
 * @returns 숫자 또는 undefined (NaN 제외)
 *
 * @example
 * mapNumberFilter('100') // 100
 * mapNumberFilter('abc') // undefined
 * mapNumberFilter('') // undefined
 */
export function mapNumberFilter(value: string | undefined): number | undefined {
  if (!value || value === '') return undefined;
  const num = parseInt(value, 10);
  return isNaN(num) ? undefined : num;
}

/**
 * 날짜 필터 매퍼
 * 문자열 날짜를 ISO 형식으로 변환
 *
 * @param value - 입력값 (Date 문자열)
 * @returns ISO 형식 날짜 문자열 또는 undefined
 *
 * @example
 * mapDateFilter('2024-01-01') // '2024-01-01T00:00:00.000Z'
 * mapDateFilter('') // undefined
 */
export function mapDateFilter(value: string | undefined): string | undefined {
  if (!value || value === '') return undefined;
  return new Date(value).toISOString();
}

/**
 * 범위 필터 매퍼 (min-max)
 * 문자열을 최소값과 최대값으로 변환
 *
 * @param value - 입력값 (예: '100-500')
 * @returns { min: number, max: number } 또는 undefined
 *
 * @example
 * mapRangeFilter('100-500') // { min: 100, max: 500 }
 * mapRangeFilter('') // undefined
 */
export function mapRangeFilter(
  value: string | undefined
): { min: number; max: number } | undefined {
  if (!value || value === '') return undefined;

  const parts = value.split('-');
  if (parts.length !== 2) return undefined;

  const min = parseInt(parts[0], 10);
  const max = parseInt(parts[1], 10);

  if (isNaN(min) || isNaN(max)) return undefined;

  return { min, max };
}

/**
 * 제네릭 필터 매퍼 팩토리
 * 각 필터 필드에 대한 매퍼 함수를 정의하면, 자동으로 전체 필터를 변환
 *
 * 이 함수를 사용하면:
 * 1. 필터 로직을 한 곳에서 관리
 * 2. 필터 필드를 추가해도 자동 처리
 * 3. 타입 안전성 보장
 * 4. 코드 반복 최소화
 *
 * @template TSearchParams - API 검색 파라미터 타입
 * @template TFilterValues - UI 필터 값 타입
 *
 * @param mappings - 필터 필드별 매퍼 함수 객체
 * @returns 필터 값을 searchParams로 변환하는 함수
 *
 * @example
 * ```typescript
 * // 1. 필터 값 타입 정의
 * interface UserFilterValues {
 *   username: string;
 *   displayName: string;
 *   department: string;
 *   enabled: string;
 *   accountLocked: string;
 * }
 *
 * // 2. 매퍼 생성
 * export function createUserFilterMapper() {
 *   return createFilterMapper<UserSearchParams, UserFilterValues>({
 *     username: mapTextFilter,
 *     displayName: mapTextFilter,
 *     department: mapTextFilter,
 *     enabled: mapBooleanFilter,
 *     accountLocked: mapBooleanFilter,
 *   });
 * }
 *
 * // 3. useListPage에서 사용
 * const { handleFilter } = useListPage({
 *   filterMapper: createUserFilterMapper(),
 *   // ...
 * });
 * ```
 *
 * @description
 * 동작 방식:
 * 1. 입력 필터 값들을 순회
 * 2. 각 필터에 대한 매퍼 함수 찾기
 * 3. 매퍼 함수 실행하여 변환
 * 4. undefined가 아닌 값만 결과에 포함 (API에 보내지 않음)
 * 5. 변환된 searchParams 반환
 */
export function createFilterMapper<TSearchParams, TFilterValues extends Record<string, string>>(
  mappings: {
    [K in keyof TFilterValues]?: (value: string) => any;
  }
): (filters: Record<string, string>) => Partial<TSearchParams> {
  /**
   * 실제 필터 변환 함수
   * 필터 값들을 searchParams로 변환
   *
   * @param filters - UI에서 입력받은 필터 값들
   * @returns 변환된 searchParams (부분 객체)
   */
  return (filters: Record<string, string>): Partial<TSearchParams> => {
    const result: any = {};

    // 각 필터 필드에 대해 반복
    for (const [key, value] of Object.entries(filters)) {
      // 해당 필드의 매퍼 함수 찾기
      const mapper = mappings[key as keyof TFilterValues];

      // 매퍼가 있으면 변환 (빈 문자열도 처리하여 이전 값 제거)
      if (mapper) {
        // 매퍼 함수 실행
        const mappedValue = mapper(value);

        // undefined가 아니면 결과에 포함, undefined면 이전 값 제거
        if (mappedValue !== undefined) {
          result[key] = mappedValue;
        } else {
          result[key] = undefined;
        }
      }
    }

    return result;
  };
}
