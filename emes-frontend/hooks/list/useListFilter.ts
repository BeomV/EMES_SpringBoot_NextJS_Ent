import { useCallback } from 'react';
import type { BaseSearchParams } from '@/types/list-page';

/**
 * useListFilter 훅 옵션
 */
interface UseListFilterOptions<TSearchParams, TFilterValues> {
  /**
   * UI 필터 값을 searchParams로 변환하는 함수
   * @param filters - UI에서 입력받은 필터 값들
   * @returns 검색 파라미터로 변환된 값
   */
  filterMapper: (filters: TFilterValues) => Partial<TSearchParams>;

  /**
   * searchParams 설정 함수
   */
  setSearchParams: React.Dispatch<React.SetStateAction<TSearchParams>>;
}

/**
 * useListFilter 훅 반환 타입
 */
interface UseListFilterReturn {
  /**
   * 필터 적용 함수
   * DataTable의 onFilter prop에 전달
   */
  handleFilter: (filters: Record<string, string>) => void;
}

/**
 * 리스트 페이지의 필터 처리 로직을 담당하는 훅
 * 필터 UI 값을 searchParams로 변환하고 상태를 업데이트
 *
 * @template TSearchParams - 검색 파라미터 타입
 * @template TFilterValues - UI 필터 값 타입
 *
 * @param options - 훅 옵션 (filterMapper, setSearchParams)
 * @returns 필터 처리 함수 (handleFilter)
 *
 * @example
 * ```typescript
 * const { handleFilter } = useListFilter({
 *   filterMapper: createUserFilterMapper(),
 *   setSearchParams,
 * });
 *
 * // 또는 DataTable에서
 * <DataTable
 *   onFilter={handleFilter}
 *   filters={[...]}
 * />
 * ```
 *
 * @description
 * 필터 변경 시:
 * 1. filterMapper를 사용하여 UI 값을 searchParams로 변환
 * 2. 기존 searchParams와 병합
 * 3. page를 0으로 초기화 (첫 페이지로 이동)
 * 4. 검색 파라미터 상태 업데이트 -> useListData의 loadData 자동 호출
 */
export function useListFilter<
  TSearchParams extends BaseSearchParams,
  TFilterValues extends Record<string, string>
>({
  filterMapper,
  setSearchParams,
}: UseListFilterOptions<TSearchParams, TFilterValues>): UseListFilterReturn {
  /**
   * 필터 적용 함수
   * useCallback으로 메모이제이션하여 DataTable 리렌더링 방지
   *
   * @param filters - DataTable에서 넘어온 필터 값
   *                  예: { username: 'john', enabled: 'true', accountLocked: '' }
   */
  const handleFilter = useCallback(
    (filters: Record<string, string>) => {
      // filterMapper를 사용하여 필터 값을 searchParams 형식으로 변환
      // 예: { username: 'john', enabled: 'true' } -> { username: 'john', enabled: true }
      const mappedFilters = filterMapper(filters as TFilterValues);

      // searchParams 업데이트
      setSearchParams((prev) => ({
        // 기존 searchParams 유지 (size, sortBy, sortDirection 등)
        ...prev,
        // 변환된 필터 값 적용
        ...mappedFilters,
        // 필터 변경 시 첫 페이지로 초기화 (페이지네이션 구현 시)
        page: 0,
      }));
    },
    [filterMapper, setSearchParams]
  );

  return { handleFilter };
}
