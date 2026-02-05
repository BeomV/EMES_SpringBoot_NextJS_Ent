import { apiClient } from './client';
import { createCrudApi } from './base';
import {
  createFilterMapper,
  mapTextFilter,
  mapBooleanFilter,
} from '@/lib/utils/filter-mapper';
import type { ApiResponse } from '@/types/api';
import type {
  Role,
  RoleCreateRequest,
  RoleUpdateRequest,
  RoleSearchParams,
} from '@/types/entities/role';

const ROLES_BASE = '/api/v1/admin/roles';

/**
 * 기본 CRUD API 자동 생성
 * createCrudApi를 사용하여 표준 CRUD 작업 구현
 */
const baseApi = createCrudApi<Role, RoleCreateRequest, RoleUpdateRequest, RoleSearchParams>(
  ROLES_BASE
);

/**
 * 역할 관리 API
 * 기본 CRUD 작업 + 커스텀 액션
 */
export const rolesApi = {
  ...baseApi,

  /**
   * 역할에 권한 할당
   *
   * @param roleId - 역할 ID
   * @param permissionIds - 할당할 권한 ID 배열
   * @returns API 응답
   *
   * @example
   * await rolesApi.assignPermissions(1, [1, 2, 3]);
   */
  assignPermissions: async (roleId: string | number, permissionIds: number[]) => {
    const response = await apiClient.post<ApiResponse<void>>(
      `${ROLES_BASE}/${roleId}/permissions`,
      { permissionIds }
    );
    return response.data;
  },

  /**
   * 역할의 권한 조회
   *
   * @param roleId - 역할 ID
   * @returns 권한 ID 배열
   *
   * @example
   * const permissions = await rolesApi.getPermissions(1);
   */
  getPermissions: async (roleId: string | number) => {
    const response = await apiClient.get<ApiResponse<number[]>>(
      `${ROLES_BASE}/${roleId}/permissions`
    );
    return response.data;
  },
};

/**
 * 역할 필터 값 인터페이스
 * DataTable에서 입력받은 필터 값의 타입
 */
interface RoleFilterValues extends Record<string, string> {
  roleCode: string;
  roleName: string;
  isActive: string;
}

/**
 * 역할 필터 매퍼 생성
 * UI 필터 값을 RoleSearchParams로 변환하는 함수를 반환
 *
 * @example
 * ```typescript
 * const { handleFilter } = useListPage({
 *   filterMapper: createRoleFilterMapper(),
 *   // ...
 * });
 * ```
 */
export function createRoleFilterMapper() {
  return createFilterMapper<RoleSearchParams, RoleFilterValues>({
    roleCode: mapTextFilter,
    roleName: mapTextFilter,
    isActive: mapBooleanFilter,
  });
}
