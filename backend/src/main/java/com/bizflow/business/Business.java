package com.bizflow.business;

import com.bizflow.common.entity.BaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "businesses")
public class Business extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Business name is required")
    @Size(max = 150, message = "Business name must not exceed 150 characters")
    @Column(name = "name", nullable = false, length = 150)
    private String name;

    @NotNull(message = "Business type is required")
    @Enumerated(EnumType.STRING)
    @Column(name = "business_type", nullable = false, length = 50)
    private BusinessType businessType;

    @Column(name = "email", length = 150)
    private String email;

    @Column(name = "phone", length = 30)
    private String phone;

    @Column(name = "address", columnDefinition = "TEXT")
    private String address;

    @Column(name = "logo", length = 255)
    private String logo;

    @Builder.Default
    @Column(name = "currency", nullable = false, length = 10)
    private String currency = "INR";

    @Builder.Default
    @Column(name = "timezone", nullable = false, length = 50)
    private String timezone = "UTC";

    // Tax Configuration
    @Builder.Default
    @Column(name = "tax_rate", precision = 5, scale = 2)
    private BigDecimal taxRate = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "tax_name", length = 50)
    private String taxName = "Sales Tax";

    @Column(name = "tax_number", length = 100)
    private String taxNumber;

    @Builder.Default
    @Column(name = "tax_inclusive", nullable = false)
    private boolean taxInclusive = false;

    // Review Boost Configuration
    @Column(name = "review_slug", length = 150, unique = true)
    private String reviewSlug;

    @Column(name = "public_review_url", length = 500)
    private String publicReviewUrl;

    @Builder.Default
    @Column(name = "review_prompt_message", length = 500)
    private String reviewPromptMessage = "Thank you for choosing us! How was your experience today?";

    @Builder.Default
    @Column(name = "review_enabled", nullable = false)
    private boolean reviewEnabled = true;

    // Inventory & Tier Configuration
    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "business_size", nullable = false, length = 20)
    private BusinessSize businessSize = BusinessSize.SMALL;

    @Builder.Default
    @Column(name = "inventory_enabled", nullable = false)
    private boolean inventoryEnabled = true;

    @Builder.Default
    @Column(name = "is_active", nullable = false)
    private boolean active = true;
}
