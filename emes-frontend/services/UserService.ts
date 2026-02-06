import { apiClient } from '@/lib/api/client';
import type {
  User,
  UserSearchParams,
  UserCreateRequest,
  UserUpdateRequest,
  ApiResponse,
  PageResponse
} from '@/types/api';

/**
 * 사용자 서비스 클래스 (Singleton 패턴)
 * C# Service 패턴과 유사한 구조
 *
 * @example
 * ```typescript
 * import { userService } from '@/services/UserService';
 *
 * // 사용자 조회
 * const response = await userService.getUsers(params);
 *
 * // 사용자 삭제
 * await userService.deleteUser(userId);
 * ```
 */
export class UserService {
  private static instance: UserService;
  private readonly basePath = '/admin/users';

  // Private constructor for Singleton pattern
  private constructor() {}

  /**
   * Singleton instance 가져오기
   */
  public static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  /**
   * 사용자 목록 조회
   * @param params 검색 파라미터
   * @returns 페이지네이션된 사용자 목록
   */
  public async getUsers(params: UserSearchParams = {}): Promise<ApiResponse<PageResponse<User>>> {
    const response = await apiClient.get<ApiResponse<PageResponse<User>>>(
      this.basePath,
      { params }
    );
    return response.data;
  }

  /**
   * 사용자 상세 조회
   * @param userId 사용자 ID
   * @returns 사용자 정보
   */
  public async getUser(userId: number): Promise<ApiResponse<User>> {
    const response = await apiClient.get<ApiResponse<User>>(
      `${this.basePath}/${userId}`
    );
    return response.data;
  }

  /**
   * 사용자 생성
   * @param data 사용자 생성 데이터
   * @returns 생성된 사용자 정보
   */
  public async createUser(data: UserCreateRequest): Promise<ApiResponse<User>> {
    const response = await apiClient.post<ApiResponse<User>>(
      this.basePath,
      data
    );
    return response.data;
  }

  /**
   * 사용자 수정
   * @param userId 사용자 ID
   * @param data 수정할 데이터
   * @returns 수정된 사용자 정보
   */
  public async updateUser(userId: number, data: UserUpdateRequest): Promise<ApiResponse<User>> {
    const response = await apiClient.put<ApiResponse<User>>(
      `${this.basePath}/${userId}`,
      data
    );
    return response.data;
  }

  /**
   * 사용자 삭제
   * @param userId 사용자 ID
   */
  public async deleteUser(userId: number): Promise<ApiResponse<void>> {
    const response = await apiClient.delete<ApiResponse<void>>(
      `${this.basePath}/${userId}`
    );
    return response.data;
  }

  /**
   * 계정 잠금
   * @param userId 사용자 ID
   */
  public async lockAccount(userId: number): Promise<ApiResponse<void>> {
    const response = await apiClient.post<ApiResponse<void>>(
      `${this.basePath}/${userId}/lock`
    );
    return response.data;
  }

  /**
   * 계정 잠금 해제
   * @param userId 사용자 ID
   */
  public async unlockAccount(userId: number): Promise<ApiResponse<void>> {
    const response = await apiClient.post<ApiResponse<void>>(
      `${this.basePath}/${userId}/unlock`
    );
    return response.data;
  }

  /**
   * 비밀번호 재설정
   * @param userId 사용자 ID
   */
  public async resetPassword(userId: number): Promise<ApiResponse<void>> {
    const response = await apiClient.post<ApiResponse<void>>(
      `${this.basePath}/${userId}/reset-password`
    );
    return response.data;
  }
}

/**
 * UserService Singleton 인스턴스
 *
 * @example
 * ```typescript
 * import { userService } from '@/services/UserService';
 *
 * await userService.getUsers(params);
 * await userService.deleteUser(userId);
 * ```
 */
export const userService = UserService.getInstance();
