import { createCrudApi } from './base';
import {
  createFilterMapper,
  mapTextFilter,
  mapBooleanFilter,
} from '@/lib/utils/filter-mapper';
import type {
  Code,
  CodeCreateRequest,
  CodeUpdateRequest,
  CodeSearchParams,
} from '@/types/entities/code';

const CODES_BASE = '/admin/codes';

/**
 * 기본 CRUD API 자동 생성
 * createCrudApi를 사용하여 표준 CRUD 작업 구현
 */
const baseApi = createCrudApi<
  Code,
  CodeCreateRequest,
  CodeUpdateRequest,
  CodeSearchParams
>(CODES_BASE);

/**
 * 기초코드 관리 API
 * 기본 CRUD 작업만 제공
 */
export const codesApi = {
  ...baseApi,
};

/**
 * 기초코드 필터 값 인터페이스
 * DataTable에서 입력받은 필터 값의 타입
 */
interface CodeFilterValues extends Record<string, string> {
  codeType: string;
  codeValue: string;
  codeName: string;
  isActive: string;
}

/**
 * 기초코드 필터 매퍼 생성
 * UI 필터 값을 CodeSearchParams로 변환하는 함수를 반환
 *
 * @example
 * ```typescript
 * const { handleFilter } = useListPage({
 *   filterMapper: createCodeFilterMapper(),
 *   // ...
 * });
 * ```
 */
export function createCodeFilterMapper() {
  return createFilterMapper<CodeSearchParams, CodeFilterValues>({
    codeType: mapTextFilter,
    codeValue: mapTextFilter,
    codeName: mapTextFilter,
    isActive: mapBooleanFilter,
  });
}
