import { createCrudApi } from './base';
import {
  createFilterMapper,
  mapTextFilter,
  mapBooleanFilter,
} from '@/lib/utils/filter-mapper';
import type {
  Permission,
  PermissionCreateRequest,
  PermissionUpdateRequest,
  PermissionSearchParams,
} from '@/types/entities/permission';

const PERMISSIONS_BASE = '/admin/permissions';

/**
 * 기본 CRUD API 자동 생성
 * createCrudApi를 사용하여 표준 CRUD 작업 구현
 */
const baseApi = createCrudApi<
  Permission,
  PermissionCreateRequest,
  PermissionUpdateRequest,
  PermissionSearchParams
>(PERMISSIONS_BASE);

/**
 * 권한 관리 API
 * 기본 CRUD 작업만 제공
 */
export const permissionsApi = {
  ...baseApi,
};

/**
 * 권한 필터 값 인터페이스
 * DataTable에서 입력받은 필터 값의 타입
 */
interface PermissionFilterValues extends Record<string, string> {
  permissionCode: string;
  permissionName: string;
  resource: string;
  action: string;
  isActive: string;
}

/**
 * 권한 필터 매퍼 생성
 * UI 필터 값을 PermissionSearchParams로 변환하는 함수를 반환
 *
 * @example
 * ```typescript
 * const { handleFilter } = useListPage({
 *   filterMapper: createPermissionFilterMapper(),
 *   // ...
 * });
 * ```
 */
export function createPermissionFilterMapper() {
  return createFilterMapper<PermissionSearchParams, PermissionFilterValues>({
    permissionCode: mapTextFilter,
    permissionName: mapTextFilter,
    resource: mapTextFilter,
    action: mapTextFilter,
    isActive: mapBooleanFilter,
  });
}
