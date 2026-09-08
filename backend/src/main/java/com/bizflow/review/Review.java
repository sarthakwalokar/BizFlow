package com.bizflow.review;

import com.bizflow.business.Business;
import com.bizflow.common.entity.BaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "reviews")
public class Review extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "business_id", nullable = false)
    private Business business;

    @NotNull(message = "Rating is required")
    @Min(value = 1, message = "Rating must be at least 1 star")
    @Max(value = 5, message = "Rating cannot exceed 5 stars")
    @Column(name = "rating", nullable = false)
    private Integer rating;

    @Column(name = "feedback_text", columnDefinition = "TEXT")
    private String feedbackText;

    @Size(max = 150, message = "Customer name must not exceed 150 characters")
    @Column(name = "customer_name", length = 150)
    private String customerName;

    @Size(max = 150, message = "Customer contact must not exceed 150 characters")
    @Column(name = "customer_contact", length = 150)
    private String customerContact;

    @Builder.Default
    @Column(name = "is_positive", nullable = false)
    private boolean positive = false;

    @Builder.Default
    @Column(name = "redirected_to_public_platform", nullable = false)
    private boolean redirectedToPublicPlatform = false;

    @Builder.Default
    @Column(name = "is_hidden", nullable = false)
    private boolean hidden = false;

    @Size(max = 255)
    @Column(name = "moderation_notes", length = 255)
    private String moderationNotes;

    public Long getBusinessId() {
        return business != null ? business.getId() : null;
    }
}
