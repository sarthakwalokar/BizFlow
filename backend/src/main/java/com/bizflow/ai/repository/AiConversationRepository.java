package com.bizflow.ai.repository;

import com.bizflow.ai.entity.AiConversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AiConversationRepository extends JpaRepository<AiConversation, Long> {

    @Query("SELECT c FROM AiConversation c WHERE c.business.id = :businessId AND c.user.id = :userId ORDER BY c.updatedAt DESC")
    List<AiConversation> findByBusinessIdAndUserIdOrderByUpdatedAtDesc(@Param("businessId") Long businessId, @Param("userId") Long userId);

    @Query("SELECT c FROM AiConversation c WHERE c.id = :id AND c.business.id = :businessId AND c.user.id = :userId")
    Optional<AiConversation> findByIdAndBusinessIdAndUserId(@Param("id") Long id, @Param("businessId") Long businessId, @Param("userId") Long userId);

    @Query("SELECT c FROM AiConversation c WHERE c.id = :id AND c.business.id = :businessId")
    Optional<AiConversation> findByIdAndBusinessId(@Param("id") Long id, @Param("businessId") Long businessId);

    @Query("SELECT c FROM AiConversation c LEFT JOIN FETCH c.messages WHERE c.id = :id AND c.business.id = :businessId")
    Optional<AiConversation> findByIdWithMessages(@Param("id") Long id, @Param("businessId") Long businessId);

    @Query("SELECT COUNT(c) FROM AiConversation c WHERE c.business.id = :businessId AND c.user.id = :userId")
    long countByBusinessIdAndUserId(@Param("businessId") Long businessId, @Param("userId") Long userId);
}
