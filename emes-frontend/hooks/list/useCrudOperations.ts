import { useCallback } from 'react';

/**
 * CRUD API 인터페이스
 * 일반적인 Create, Update, Delete 작업을 정의
 */
interface CrudApi<TData, TCreateReq, TUpdateReq> {
  /**
   * 생성 API (선택사항)
   */
  create?: (data: TCreateReq) => Promise<any>;

  /**
   * 수정 API (선택사항)
   */
  update?: (id: number | string, data: TUpdateReq) => Promise<any>;

  /**
   * 삭제 API (선택사항)
   */
  delete?: (id: number | string) => Promise<any>;
}

/**
 * useCrudOperations 훅 반환 타입
 */
interface UseCrudOperationsReturn<TData, TCreateReq, TUpdateReq> {
  /**
   * 생성 함수
   * @param data - 생성할 데이터
   * @returns 성공 여부
   */
  handleCreate: (data: TCreateReq) => Promise<boolean>;

  /**
   * 수정 함수
   * @param id - 수정할 아이템의 ID
   * @param data - 수정할 데이터
   * @returns 성공 여부
   */
  handleUpdate: (id: number | string, data: TUpdateReq) => Promise<boolean>;

  /**
   * 삭제 함수
   * @param id - 삭제할 아이템의 ID
   * @param confirmMessage - 확인 메시지 (없으면 바로 실행)
   * @returns 성공 여부
   */
  handleDelete: (id: number | string, confirmMessage?: string) => Promise<boolean>;
}

/**
 * CRUD 작업을 통합하는 훅
 *
 * 기능:
 * - Create, Update, Delete API 호출
 * - 공통 에러 처리
 * - 성공 시 콜백 실행 (데이터 새로고침 등)
 *
 * @template TData - 엔티티 타입
 * @template TCreateReq - 생성 요청 타입
 * @template TUpdateReq - 수정 요청 타입
 *
 * @param api - CRUD API 객체
 * @param onSuccess - 작업 성공 시 콜백 (선택사항)
 * @returns CRUD 작업 함수들
 *
 * @example
 * ```typescript
 * const { handleCreate, handleUpdate, handleDelete } = useCrudOperations(
 *   {
 *     create: usersApi.createUser,
 *     update: usersApi.updateUser,
 *     delete: usersApi.deleteUser,
 *   },
 *   () => {
 *     // 작업 성공 시 데이터 새로고침
 *     loadUsers();
 *   }
 * );
 *
 * // 생성
 * const success = await handleCreate({ username: 'john', email: 'john@example.com' });
 *
 * // 수정
 * const updated = await handleUpdate(1, { displayName: 'John Doe' });
 *
 * // 삭제 (확인 메시지 포함)
 * const deleted = await handleDelete(1, '이 사용자를 삭제하시겠습니까?');
 * ```
 *
 * @description
 * 이 훅은 useListPage와 함께 사용될 수 있으며,
 * 또는 모달/폼 페이지에서 독립적으로 사용될 수도 있음
 */
export function useCrudOperations<TData, TCreateReq, TUpdateReq>(
  api: CrudApi<TData, TCreateReq, TUpdateReq>,
  onSuccess?: () => void
): UseCrudOperationsReturn<TData, TCreateReq, TUpdateReq> {
  /**
   * 생성 함수
   *
   * @throws API가 구성되지 않은 경우 에러 발생
   */
  const handleCreate = useCallback(
    async (data: TCreateReq): Promise<boolean> => {
      if (!api.create) {
        console.error('Create API not configured');
        return false;
      }

      try {
        await api.create(data);
        onSuccess?.();
        // TODO: 성공 토스트 표시
        return true;
      } catch (error) {
        console.error('Failed to create:', error);
        // TODO: 에러 토스트 표시
        return false;
      }
    },
    [api, onSuccess]
  );

  /**
   * 수정 함수
   *
   * @throws API가 구성되지 않은 경우 에러 발생
   */
  const handleUpdate = useCallback(
    async (id: number | string, data: TUpdateReq): Promise<boolean> => {
      if (!api.update) {
        console.error('Update API not configured');
        return false;
      }

      try {
        await api.update(id, data);
        onSuccess?.();
        // TODO: 성공 토스트 표시
        return true;
      } catch (error) {
        console.error('Failed to update:', error);
        // TODO: 에러 토스트 표시
        return false;
      }
    },
    [api, onSuccess]
  );

  /**
   * 삭제 함수
   *
   * confirmMessage가 주어지면 사용자 확인 후 삭제
   * confirmMessage가 없으면 바로 삭제 (useListPage의 handleDelete 권장)
   *
   * @throws API가 구성되지 않은 경우 에러 발생
   */
  const handleDelete = useCallback(
    async (id: number | string, confirmMessage?: string): Promise<boolean> => {
      if (!api.delete) {
        console.error('Delete API not configured');
        return false;
      }

      // 확인 메시지가 있으면 사용자 확인
      if (confirmMessage && !confirm(confirmMessage)) {
        return false;
      }

      try {
        await api.delete(id);
        onSuccess?.();
        // TODO: 성공 토스트 표시
        return true;
      } catch (error) {
        console.error('Failed to delete:', error);
        // TODO: 에러 토스트 표시
        return false;
      }
    },
    [api, onSuccess]
  );

  return {
    handleCreate,
    handleUpdate,
    handleDelete,
  };
}
