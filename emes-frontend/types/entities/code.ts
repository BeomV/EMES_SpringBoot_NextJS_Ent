import type { BaseSearchParams } from '../list-page';

/**
 * 기초코드 엔티티 타입
 */
export interface Code {
  /** 코드 ID */
  codeId: number;

  /** 코드 유형 (예: STATUS, PRIORITY, CATEGORY) */
  codeType: string;

  /** 코드 값 (예: ACTIVE, INACTIVE) */
  codeValue: string;

  /** 코드명 */
  codeName: string;

  /** 설명 */
  description?: string;

  /** 정렬 순서 */
  sortOrder: number;

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
 * 기초코드 생성 요청 타입
 */
export interface CodeCreateRequest {
  /** 코드 유형 */
  codeType: string;

  /** 코드 값 */
  codeValue: string;

  /** 코드명 */
  codeName: string;

  /** 설명 (선택사항) */
  description?: string;

  /** 정렬 순서 */
  sortOrder: number;
}

/**
 * 기초코드 수정 요청 타입
 * 모든 필드가 선택사항 (부분 수정 가능)
 */
export interface CodeUpdateRequest {
  /** 코드명 */
  codeName?: string;

  /** 설명 */
  description?: string;

  /** 정렬 순서 */
  sortOrder?: number;

  /** 활성 여부 */
  isActive?: boolean;
}

/**
 * 기초코드 검색 파라미터 타입
 * BaseSearchParams를 상속받아 페이지네이션, 정렬 포함
 */
export interface CodeSearchParams extends BaseSearchParams {
  /** 코드 유형 필터 */
  codeType?: string;

  /** 코드 값 필터 */
  codeValue?: string;

  /** 코드명 필터 */
  codeName?: string;

  /** 활성 여부 필터 */
  isActive?: boolean;
}
