import type { ApiResponse, PageResponse } from './api';
import type { DataTableColumn } from '@/components/common/DataTable';
import type { SearchInputFilter } from '@/components/common/SearchInput';

/**
 * 기본 검색 파라미터 인터페이스
 * 모든 리스트 페이지의 searchParams는 이를 상속해야 함
 */
export interface BaseSearchParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

/**
 * 리스트 페이지 설정 인터페이스
 * 제네릭으로 엔티티별 타입을 완전히 추론
 *
 * @template TData - 엔티티 타입 (User, Role, Permission 등)
 * @template TSearchParams - 검색 파라미터 타입 (UserSearchParams 등)
 * @template TFilterValues - UI 필터 값 타입
 *
 * @example
 * ```typescript
 * const config: ListPageConfig<User, UserSearchParams> = {
 *   api: {
 *     list: usersApi.getUsers,
 *     delete: usersApi.deleteUser,
 *     customActions: {
 *       lock: usersApi.lockAccount,
 *       unlock: usersApi.unlockAccount,
 *     },
 *   },
 *   filterMapper: createUserFilterMapper(),
 *   getEntityId: (user) => user.userId,
 *   entityName: '사용자',
 * };
 * ```
 */
export interface ListPageConfig<
  TData,
  TSearchParams extends BaseSearchParams,
  TFilterValues extends Record<string, string> = Record<string, string>
> {
  /**
   * API 함수들
   */
  api: {
    /**
     * 리스트 조회 함수
     * PageResponse로 페이지네이션된 데이터를 반환해야 함
     */
    list: (params: TSearchParams) => Promise<ApiResponse<PageResponse<TData>>>;

    /**
     * 삭제 함수 (선택사항)
     */
    delete?: (id: number | string) => Promise<ApiResponse<void>>;

    /**
     * 커스텀 액션 함수들 (선택사항)
     * lockAccount, unlockAccount 등 특수한 작업
     */
    customActions?: Record<string, (id: number | string, ...args: any[]) => Promise<ApiResponse<any>>>;
  };

  /**
   * UI 필터 값을 searchParams로 변환하는 함수
   * 예: { username: 'john', enabled: 'true' } -> { username: 'john', enabled: true }
   */
  filterMapper: (filters: Record<string, string>) => Partial<TSearchParams>;

  /**
   * 초기 검색 파라미터 (선택사항)
   * 기본값: { size: 9999, sortBy: 'createdAt', sortDirection: 'desc' }
   */
  defaultParams?: Partial<TSearchParams>;

  /**
   * 엔티티의 ID 필드 추출 함수
   * @param item - 엔티티 객체
   * @returns ID 값 (number 또는 string)
   */
  getEntityId: (item: TData) => number | string;

  /**
   * 엔티티 이름 (선택사항)
   * 삭제 확인 메시지에 사용: "이 {entityName}을(를) 삭제하시겠습니까?"
   * 기본값: "항목"
   */
  entityName?: string;
}

/**
 * useListPage hook의 반환 타입
 * 페이지 컴포넌트에서 필요한 모든 상태와 함수를 제공
 */
export interface UseListPageReturn<TData, TSearchParams extends BaseSearchParams> {
  /**
   * 조회된 데이터 배열
   */
  data: TData[];

  /**
   * 데이터 로딩 중 여부
   */
  loading: boolean;

  /**
   * 현재 검색 파라미터
   */
  searchParams: TSearchParams;

  /**
   * 검색 파라미터 설정 함수
   */
  setSearchParams: React.Dispatch<React.SetStateAction<TSearchParams>>;

  /**
   * 필터 처리 함수
   * DataTable의 onFilter prop에 전달
   * @param filters - UI에서 입력받은 필터 값들
   */
  handleFilter: (filters: Record<string, string>) => void;

  /**
   * 데이터 새로고침 함수
   */
  refresh: () => Promise<void>;

  /**
   * 삭제 함수
   * 확인 다이얼로그를 표시한 후 삭제 작업 수행
   * @param id - 삭제할 엔티티의 ID
   */
  handleDelete: (id: number | string) => Promise<void>;

  /**
   * 커스텀 액션 실행 함수
   * customActions에 정의된 작업을 실행
   * @param actionName - 액션 이름 (예: 'lock', 'unlock')
   * @param id - 대상 엔티티의 ID
   * @param args - 추가 인자들
   */
  handleCustomAction: (actionName: string, id: number | string, ...args: any[]) => Promise<void>;
}

/**
 * 필터 설정 타입
 * SearchInput의 filters prop으로 전달할 필터 정의
 */
export interface FilterConfig {
  /**
   * SearchInput filter 배열
   */
  filters: SearchInputFilter[];

  /**
   * 필터의 초기 값 (선택사항)
   */
  initialValues?: Record<string, string>;
}
