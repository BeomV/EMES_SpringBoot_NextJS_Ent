import { apiClient } from './client';
import type { ApiResponse, PageResponse } from '@/types/api';
import type { BaseSearchParams } from '@/types/list-page';

/**
 * 공통 CRUD API 자동 생성 함수
 * 표준적인 CRUD 작업(Create, Read, Update, Delete)을 자동으로 구현
 *
 * 이 함수를 사용하면:
 * 1. 각 엔티티별 API 클라이언트를 쉽게 생성 가능
 * 2. RESTful 패턴을 일관되게 유지
 * 3. 타입 안전성 보장
 * 4. 중복 코드 최소화
 *
 * @template TData - 엔티티 타입 (User, Role, Permission 등)
 * @template TCreateReq - 생성 요청 타입
 * @template TUpdateReq - 수정 요청 타입
 * @template TSearchParams - 검색 파라미터 타입
 *
 * @param basePath - API 기본 경로 (예: '/admin/users')
 * @returns CRUD 함수들을 담은 객체
 *
 * @example
 * ```typescript
 * // 1. 타입 정의
 * interface Role {
 *   roleId: number;
 *   roleName: string;
 *   description: string;
 *   isActive: boolean;
 * }
 *
 * interface RoleCreateRequest {
 *   roleName: string;
 *   description?: string;
 * }
 *
 * interface RoleUpdateRequest {
 *   roleName?: string;
 *   description?: string;
 *   isActive?: boolean;
 * }
 *
 * interface RoleSearchParams extends BaseSearchParams {
 *   roleName?: string;
 *   isActive?: boolean;
 * }
 *
 * // 2. API 자동 생성
 * const baseApi = createCrudApi<
 *   Role,
 *   RoleCreateRequest,
 *   RoleUpdateRequest,
 *   RoleSearchParams
 * >('/admin/roles');
 *
 * // 3. 커스텀 API 추가
 * export const rolesApi = {
 *   ...baseApi,
 *   // 커스텀 작업 (권한 할당 등)
 *   assignPermissions: async (roleId: number, permissionIds: number[]) => {
 *     const response = await apiClient.post<ApiResponse<void>>(
 *       `/admin/roles/${roleId}/permissions`,
 *       { permissionIds }
 *     );
 *     return response.data;
 *   },
 * };
 *
 * // 4. 사용
 * const roles = await rolesApi.list({ roleName: 'admin' });
 * const role = await rolesApi.get(1);
 * await rolesApi.create({ roleName: 'new role' });
 * await rolesApi.update(1, { roleName: 'updated' });
 * await rolesApi.delete(1);
 * await rolesApi.assignPermissions(1, [1, 2, 3]);
 * ```
 *
 * @returns 반환되는 API 객체:
 * - list(params) - 목록 조회 (페이지네이션 포함)
 * - get(id) - 단건 조회
 * - create(data) - 생성
 * - update(id, data) - 수정
 * - delete(id) - 삭제
 */
export function createCrudApi<
  TData,
  TCreateReq,
  TUpdateReq,
  TSearchParams extends BaseSearchParams
>(basePath: string) {
  return {
    /**
     * 목록 조회 (페이지네이션 포함)
     *
     * @param params - 검색 파라미터 (필터, 정렬, 페이지네이션)
     * @returns PageResponse<TData> - 페이지네이션된 목록
     *
     * @example
     * const result = await rolesApi.list({
     *   roleName: 'admin',
     *   page: 0,
     *   size: 20,
     *   sortBy: 'createdAt',
     *   sortDirection: 'desc',
     * });
     * // result.content: Role[]
     * // result.totalElements: number
     * // result.totalPages: number
     */
    list: async (params: TSearchParams = {} as TSearchParams) => {
      const response = await apiClient.get<ApiResponse<PageResponse<TData>>>(basePath, {
        params,
      });
      return response.data;
    },

    /**
     * 단건 조회
     *
     * @param id - 조회할 아이템의 ID
     * @returns TData - 조회된 엔티티
     *
     * @example
     * const role = await rolesApi.get(1);
     */
    get: async (id: number | string) => {
      const response = await apiClient.get<ApiResponse<TData>>(`${basePath}/${id}`);
      return response.data;
    },

    /**
     * 생성
     *
     * @param data - 생성할 데이터
     * @returns ApiResponse<TData> - 생성된 엔티티
     *
     * @example
     * const response = await rolesApi.create({
     *   roleName: 'new role',
     *   description: 'A new role',
     * });
     */
    create: async (data: TCreateReq) => {
      const response = await apiClient.post<ApiResponse<TData>>(basePath, data);
      return response.data;
    },

    /**
     * 수정
     *
     * @param id - 수정할 아이템의 ID
     * @param data - 수정할 데이터 (부분 수정 가능)
     * @returns ApiResponse<TData> - 수정된 엔티티
     *
     * @example
     * const response = await rolesApi.update(1, {
     *   roleName: 'updated role name',
     * });
     */
    update: async (id: number | string, data: TUpdateReq) => {
      const response = await apiClient.put<ApiResponse<TData>>(`${basePath}/${id}`, data);
      return response.data;
    },

    /**
     * 삭제
     *
     * @param id - 삭제할 아이템의 ID
     * @returns ApiResponse<void> - 삭제 완료 응답
     *
     * @example
     * const response = await rolesApi.delete(1);
     */
    delete: async (id: number | string) => {
      const response = await apiClient.delete<ApiResponse<void>>(`${basePath}/${id}`);
      return response.data;
    },
  };
}
