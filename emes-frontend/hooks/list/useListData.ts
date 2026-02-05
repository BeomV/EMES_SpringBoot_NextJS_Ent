import { useState, useCallback, useEffect } from 'react';
import type { ApiResponse, PageResponse } from '@/types/api';

/**
 * useListData 훅 옵션
 * 데이터 로딩 로직을 캡슐화하는 훅의 파라미터
 */
interface UseListDataOptions<TData, TSearchParams> {
  /**
   * API 함수
   * @param params - 검색 파라미터
   * @returns Promise<ApiResponse<PageResponse<TData>>>
   */
  apiFn: (params: TSearchParams) => Promise<ApiResponse<PageResponse<TData>>>;

  /**
   * 초기 검색 파라미터
   */
  initialParams: TSearchParams;
}

/**
 * useListData 훅 반환 타입
 */
interface UseListDataReturn<TData, TSearchParams> {
  /** 조회된 데이터 배열 */
  data: TData[];

  /** 로딩 상태 */
  loading: boolean;

  /** 현재 검색 파라미터 */
  searchParams: TSearchParams;

  /** 검색 파라미터 설정 함수 */
  setSearchParams: React.Dispatch<React.SetStateAction<TSearchParams>>;

  /** 데이터 로드 함수 (수동 새로고침용) */
  loadData: () => Promise<void>;
}

/**
 * 리스트 페이지의 데이터 로딩 로직을 담당하는 훅
 * 상태 관리, API 호출, 에러 처리를 통합
 *
 * @template TData - 엔티티 타입
 * @template TSearchParams - 검색 파라미터 타입
 *
 * @param options - 훅 옵션 (apiFn, initialParams)
 * @returns 데이터, 로딩 상태, 검색 파라미터 및 설정 함수
 *
 * @example
 * ```typescript
 * const { data, loading, searchParams, setSearchParams, loadData } = useListData({
 *   apiFn: usersApi.getUsers,
 *   initialParams: {
 *     size: 9999,
 *     sortBy: 'createdAt',
 *     sortDirection: 'desc',
 *   },
 * });
 * ```
 */
export function useListData<TData, TSearchParams>({
  apiFn,
  initialParams,
}: UseListDataOptions<TData, TSearchParams>): UseListDataReturn<TData, TSearchParams> {
  // 상태 관리
  const [data, setData] = useState<TData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useState<TSearchParams>(initialParams);

  /**
   * 데이터 로드 함수
   * useCallback으로 메모이제이션하여 불필요한 재생성 방지
   *
   * API 호출 후 response.data.content에서 실제 데이터 추출
   * 에러 발생 시 console.error 출력 및 데이터 초기화
   */
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiFn(searchParams);
      // ApiResponse<PageResponse<T>>에서 실제 데이터 추출
      // response.data -> ApiResponse<PageResponse<T>>
      // response.data.data -> PageResponse<T>
      // response.data.data.content -> T[]
      setData(response.data.content);
    } catch (error) {
      console.error('Failed to load data:', error);
      // TODO: 에러 토스트 또는 에러 바운더리에서 처리
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [apiFn, searchParams]);

  /**
   * searchParams 변경 시 자동으로 데이터 로드
   *
   * useEffect 의존성으로 loadData를 사용하면,
   * loadData의 의존성(apiFn, searchParams)이 변경될 때마다 실행됨
   */
  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    data,
    loading,
    searchParams,
    setSearchParams,
    loadData,
  };
}
