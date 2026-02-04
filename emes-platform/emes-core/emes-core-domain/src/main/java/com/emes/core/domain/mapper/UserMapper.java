package com.emes.core.domain.mapper;

import com.emes.core.domain.model.User;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 사용자 MyBatis Mapper 인터페이스
 */
@Mapper
public interface UserMapper {

    /**
     * 사용자 ID로 조회
     */
    User selectById(@Param("userId") Long userId);

    /**
     * 사용자명으로 조회
     */
    User selectByUsername(@Param("username") String username);

    /**
     * 이메일로 조회
     */
    User selectByEmail(@Param("email") String email);

    /**
     * 모든 사용자 조회
     */
    List<User> selectAll();

    /**
     * 사용자 검색 (페이징)
     */
    List<User> selectByCondition(@Param("username") String username,
                                  @Param("email") String email,
                                  @Param("displayName") String displayName,
                                  @Param("department") String department,
                                  @Param("position") String position,
                                  @Param("enabled") Boolean enabled,
                                  @Param("accountLocked") Boolean accountLocked,
                                  @Param("sortBy") String sortBy,
                                  @Param("sortDirection") String sortDirection,
                                  @Param("limit") Integer limit,
                                  @Param("offset") Integer offset);

    /**
     * 사용자 검색 결과 카운트
     */
    long countByCondition(@Param("username") String username,
                          @Param("email") String email,
                          @Param("displayName") String displayName,
                          @Param("department") String department,
                          @Param("position") String position,
                          @Param("enabled") Boolean enabled,
                          @Param("accountLocked") Boolean accountLocked);

    /**
     * 사용자 생성
     */
    int insert(User user);

    /**
     * 사용자 수정
     */
    int update(User user);

    /**
     * 사용자 삭제 (Soft Delete)
     */
    int softDelete(@Param("userId") Long userId, @Param("deletedAt") java.time.LocalDateTime deletedAt);

    /**
     * 사용자 물리 삭제 (Hard Delete)
     */
    int delete(@Param("userId") Long userId);

    /**
     * 로그인 실패 횟수 증가
     */
    int incrementFailedLoginAttempts(@Param("userId") Long userId);

    /**
     * 로그인 실패 횟수 초기화
     */
    int resetFailedLoginAttempts(@Param("userId") Long userId);

    /**
     * 계정 잠금
     */
    int lockAccount(@Param("userId") Long userId);

    /**
     * 계정 잠금 해제
     */
    int unlockAccount(@Param("userId") Long userId);

    /**
     * 비밀번호 변경
     */
    int updatePassword(@Param("userId") Long userId,
                       @Param("password") String password,
                       @Param("passwordChangedAt") java.time.LocalDateTime passwordChangedAt);

    /**
     * 사용자 권한 코드 목록 조회 (역할 → 권한)
     */
    List<String> selectPermissionsByUserId(@Param("userId") Long userId);
}
