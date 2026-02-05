import { useEffect } from 'react';
import { toast } from 'sonner';
import { useListData } from './useListData';
import { useListFilter } from './useListFilter';
import type { ListPageConfig, UseListPageReturn, BaseSearchParams } from '@/types/list-page';

/**
 * 리스트 페이지의 모든 로직을 통합하는 메인 훅
 *
 * 기능:
 * - 데이터 로딩 (useListData)
 * - 필터 처리 (useListFilter)
 * - CRUD 작업 (delete, custom actions)
 * - 에러 처리
 *
 * 이 훅 하나로 기존의 227줄 페이지 코드를 120줄로 단축 가능
 *
 * @template TData - 엔티티 타입 (User, Role, Permission 등)
 * @template TSearchParams - 검색 파라미터 타입 (UserSearchParams 등)
 * @template TFilterValues - UI 필터 값 타입
 *
 * @param config - 리스트 페이지 설정
 * @returns 페이지에서 필요한 모든 상태와 함수
 *
 * @example
 * ```typescript
 * // 기본 사용법
 * const { data, loading, handleFilter, handleDelete } = useListPage<User, UserSearchParams>({
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
 * });
 *
 * // 페이지에서
 * return (
 *   <DataTable
 *     data={data}
 *     loading={loading}
 *     filters={[...]}
 *     onFilter={handleFilter}
 *   />
 * );
 * ```
 *
 * @description
 * 호출 순서:
 * 1. useListData로 데이터 로딩 상태 관리
 * 2. useListFilter로 필터 처리
 * 3. 초기 데이터 로드 (useEffect)
 * 4. CRUD 작업 함수 구현 (handleDelete, handleCustomAction)
 * 5. 모든 상태와 함수를 반환
 *
 * searchParams 변경 -> loadData 자동 실행 -> 데이터 업데이트 (자동화된 흐름)
 */
export function useListPage<
  TData,
  TSearchParams extends BaseSearchParams,
  TFilterValues extends Record<string, string> = Record<string, string>
>(
  config: ListPageConfig<TData, TSearchParams, TFilterValues>
): UseListPageReturn<TData, TSearchParams> {
  /**
   * 기본 검색 파라미터 설정
   * config.defaultParams가 있으면 오버라이드
   */
  const initialParams: TSearchParams = {
    size: 9999,
    sortBy: 'createdAt',
    sortDirection: 'desc',
    ...config.defaultParams,
  } as TSearchParams;

  /**
   * 1단계: 데이터 로딩 로직
   * useListData hook으로 data, loading, searchParams 관리
   */
  const { data, loading, searchParams, setSearchParams, loadData } = useListData({
    apiFn: config.api.list,
    initialParams,
  });

  /**
   * 2단계: 필터 처리 로직
   * useListFilter hook으로 handleFilter 구현
   */
  const { handleFilter } = useListFilter({
    filterMapper: config.filterMapper,
    setSearchParams,
  });

  /**
   * 3단계: 초기 데이터 로드 (searchParams 변경 시 자동)
   * useListData에 이미 useEffect가 있지만,
   * 명시적으로 한 번 더 호출하면 더 명확함
   * (실제로는 useListData의 useEffect에서 이미 처리됨)
   */
  useEffect(() => {
    // loadData는 이미 useListData의 useEffect에서 호출됨
    // 여기서는 명시적 초기화가 필요한 경우 추가 가능
  }, []);

  /**
   * 4단계: 삭제 함수 구현
   *
   * 동작:
   * 1. 확인 다이얼로그 표시 (브라우저 기본 confirm)
   * 2. API 호출로 엔티티 삭제
   * 3. 성공 시 데이터 재조회
   *
   * @param id - 삭제할 엔티티의 ID
   *
   * @throws config.api.delete가 없으면 조용히 반환
   *
   * TODO: 나중에 커스텀 모달 컴포넌트로 전환
   * TODO: 에러 토스트 추가
   */
  const handleDelete = async (id: number | string) => {
    // API가 구성되지 않은 경우
    if (!config.api.delete) {
      toast.error('삭제 기능이 설정되지 않았습니다');
      return;
    }

    // 엔티티 이름 (삭제 확인 메시지에 사용)
    const entityName = config.entityName || '항목';

    // 사용자 확인
    if (!confirm(`이 ${entityName}을(를) 삭제하시겠습니까?`)) {
      return;
    }

    try {
      // 삭제 API 호출
      await config.api.delete(id);

      // 성공 시 데이터 재조회
      await loadData();

      // 성공 토스트 표시
      toast.success(`${entityName}이(가) 삭제되었습니다`);
    } catch (error) {
      console.error('Failed to delete:', error);
      // 에러 토스트 표시
      toast.error(`${entityName} 삭제에 실패했습니다`);
    }
  };

  /**
   * 5단계: 커스텀 액션 함수 구현
   *
   * 동작:
   * 1. customActions에서 해당 액션 찾기
   * 2. API 호출
   * 3. 성공 시 데이터 재조회
   *
   * @param actionName - 액션 이름 (예: 'lock', 'unlock')
   * @param id - 대상 엔티티의 ID
   * @param args - 추가 인자들
   *
   * @example
   * // handleCustomAction('lock', userId)
   * // handleCustomAction('resetPassword', userId, newPassword)
   *
   * @throws actionName에 해당하는 액션이 없으면 조용히 반환
   */
  const handleCustomAction = async (
    actionName: string,
    id: number | string,
    ...args: any[]
  ) => {
    // customActions에서 액션 찾기
    const action = config.api.customActions?.[actionName];

    if (!action) {
      toast.error(`'${actionName}' 액션을 찾을 수 없습니다`);
      return;
    }

    try {
      // 커스텀 액션 실행
      await action(id, ...args);

      // 성공 시 데이터 재조회
      await loadData();

      // 성공 토스트 표시
      toast.success('작업이 완료되었습니다');
    } catch (error) {
      console.error(`Failed to execute ${actionName}:`, error);
      // 에러 토스트 표시
      toast.error('작업 실행에 실패했습니다');
    }
  };

  /**
   * 최종 반환값
   * 페이지 컴포넌트에서 필요한 모든 상태와 함수 제공
   */
  return {
    // 데이터 상태
    data,
    loading,

    // 검색 파라미터
    searchParams,
    setSearchParams,

    // 필터 처리
    handleFilter,

    // 데이터 조작
    refresh: loadData,
    handleDelete,
    handleCustomAction,
  };
}
