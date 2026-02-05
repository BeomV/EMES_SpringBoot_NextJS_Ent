import type { BaseSearchParams } from '../list-page';

/**
 * 권한 엔티티 타입
 */
export interface Permission {
  /** 권한 ID */
  permissionId: number;

  /** 권한 코드 (예: USER_READ, USER_WRITE, USER_DELETE) */
  permissionCode: string;

  /** 권한명 */
  permissionName: string;

  /** 리소스 (예: USER, MENU, CODE) */
  resource: string;

  /** 액션 (예: READ, WRITE, DELETE) */
  action: string;

  /** 설명 */
  description?: string;

  /** 활성 여부 */
  isActive: boolean;

  /** 생성자 ID */
  createdBy?: number;

  /** 생성 일시 */
  createdAt: string;

  /** 수정자 ID */
  updatedBy?: number;

  /** 수정 일시 */
  updatedAt?: string;
}

/**
 * 권한 생성 요청 타입
 */
export interface PermissionCreateRequest {
  /** 권한 코드 */
  permissionCode: string;

  /** 권한명 */
  permissionName: string;

  /** 리소스 */
  resource: string;

  /** 액션 */
  action: string;

  /** 설명 (선택사항) */
  description?: string;
}

/**
 * 권한 수정 요청 타입
 * 모든 필드가 선택사항 (부분 수정 가능)
 */
export interface PermissionUpdateRequest {
  /** 권한명 */
  permissionName?: string;

  /** 설명 */
  description?: string;

  /** 활성 여부 */
  isActive?: boolean;
}

/**
 * 권한 검색 파라미터 타입
 * BaseSearchParams를 상속받아 페이지네이션, 정렬 포함
 */
export interface PermissionSearchParams extends BaseSearchParams {
  /** 권한 코드 필터 */
  permissionCode?: string;

  /** 권한명 필터 */
  permissionName?: string;

  /** 리소스 필터 */
  resource?: string;

  /** 액션 필터 */
  action?: string;

  /** 활성 여부 필터 */
  isActive?: boolean;
}
