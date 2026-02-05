import type { BaseSearchParams } from '../list-page';

/**
 * 역할 엔티티 타입
 */
export interface Role {
  /** 역할 ID */
  roleId: number;

  /** 역할 코드 (예: ADMIN, USER) */
  roleCode: string;

  /** 역할명 */
  roleName: string;

  /** 설명 */
  description?: string;

  /** 시스템 기본 역할 여부 */
  isSystem: boolean;

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

  /** 삭제 일시 */
  deletedAt?: string;
}

/**
 * 역할 생성 요청 타입
 */
export interface RoleCreateRequest {
  /** 역할 코드 */
  roleCode: string;

  /** 역할명 */
  roleName: string;

  /** 설명 (선택사항) */
  description?: string;
}

/**
 * 역할 수정 요청 타입
 * 모든 필드가 선택사항 (부분 수정 가능)
 */
export interface RoleUpdateRequest {
  /** 역할명 */
  roleName?: string;

  /** 설명 */
  description?: string;

  /** 활성 여부 */
  isActive?: boolean;
}

/**
 * 역할 검색 파라미터 타입
 * BaseSearchParams를 상속받아 페이지네이션, 정렬 포함
 */
export interface RoleSearchParams extends BaseSearchParams {
  /** 역할 코드 필터 */
  roleCode?: string;

  /** 역할명 필터 */
  roleName?: string;

  /** 활성 여부 필터 */
  isActive?: boolean;
}
