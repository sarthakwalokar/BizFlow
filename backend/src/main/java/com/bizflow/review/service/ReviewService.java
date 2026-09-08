package com.bizflow.review.service;

import com.bizflow.business.Business;
import com.bizflow.business.BusinessRepository;
import com.bizflow.common.api.PageResponse;
import com.bizflow.common.exception.BadRequestException;
import com.bizflow.common.exception.ResourceNotFoundException;
import com.bizflow.review.Review;
import com.bizflow.review.ReviewRepository;
import com.bizflow.review.dto.*;
import com.bizflow.security.SecurityUtils;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.google.zxing.qrcode.decoder.ErrorCorrectionLevel;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final BusinessRepository businessRepository;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendBaseUrl;

    @Transactional(readOnly = true)
    public PublicBusinessReviewInfo getPublicBusinessReviewInfo(String slugOrId) {
        Business business = resolveBusinessBySlugOrId(slugOrId);

        if (!business.isActive() || !business.isReviewEnabled()) {
            throw new ResourceNotFoundException("Review page is currently disabled or unavailable for this business.");
        }

        return PublicBusinessReviewInfo.builder()
                .businessId(business.getId())
                .name(business.getName())
                .businessType(business.getBusinessType())
                .logo(business.getLogo())
                .reviewSlug(business.getReviewSlug() != null ? business.getReviewSlug() : String.valueOf(business.getId()))
                .reviewPromptMessage(business.getReviewPromptMessage() != null ? business.getReviewPromptMessage() : "Thank you for choosing us! How was your experience today?")
                .publicReviewUrl(business.getPublicReviewUrl())
                .reviewEnabled(business.isReviewEnabled())
                .build();
    }

    @Transactional
    public ReviewResponse submitPublicReview(String slugOrId, SubmitReviewRequest request) {
        Business business = resolveBusinessBySlugOrId(slugOrId);

        if (!business.isActive() || !business.isReviewEnabled()) {
            throw new BadRequestException("Review submissions are disabled for this business.");
        }

        if (request.getRating() < 1 || request.getRating() > 5) {
            throw new BadRequestException("Rating must be between 1 and 5 stars.");
        }

        boolean isPositive = request.getRating() >= 4;
        boolean redirected = Boolean.TRUE.equals(request.getRedirectedToPublicPlatform());

        Review review = Review.builder()
                .business(business)
                .rating(request.getRating())
                .feedbackText(request.getFeedbackText() != null ? request.getFeedbackText().trim() : null)
                .customerName(request.getCustomerName() != null ? request.getCustomerName().trim() : null)
                .customerContact(request.getCustomerContact() != null ? request.getCustomerContact().trim() : null)
                .positive(isPositive)
                .redirectedToPublicPlatform(redirected)
                .hidden(false)
                .build();

        Review saved = reviewRepository.save(review);
        log.info("Recorded {} star review for business {} (Positive: {})", request.getRating(), business.getId(), isPositive);

        return ReviewResponse.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public PageResponse<ReviewResponse> getReviews(
            Integer rating,
            Boolean isPositive,
            String search,
            int page,
            int size,
            String sort) {

        Long businessId = SecurityUtils.getCurrentBusinessId();
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        Specification<Review> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("business").get("id"), businessId));

            if (rating != null) {
                predicates.add(cb.equal(root.get("rating"), rating));
            }
            if (isPositive != null) {
                predicates.add(cb.equal(root.get("positive"), isPositive));
            }
            if (search != null && !search.trim().isEmpty()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                Predicate textMatch = cb.like(cb.lower(root.get("feedbackText")), pattern);
                Predicate nameMatch = cb.like(cb.lower(root.get("customerName")), pattern);
                Predicate contactMatch = cb.like(cb.lower(root.get("customerContact")), pattern);
                predicates.add(cb.or(textMatch, nameMatch, contactMatch));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<Review> reviewPage = reviewRepository.findAll(spec, pageable);

        List<ReviewResponse> content = reviewPage.getContent().stream()
                .map(ReviewResponse::fromEntity)
                .collect(Collectors.toList());

        return PageResponse.<ReviewResponse>builder()
                .content(content)
                .pageNumber(reviewPage.getNumber())
                .pageSize(reviewPage.getSize())
                .totalElements(reviewPage.getTotalElements())
                .totalPages(reviewPage.getTotalPages())
                .isFirst(reviewPage.isFirst())
                .isLast(reviewPage.isLast())
                .build();
    }

    @Transactional(readOnly = true)
    public ReviewAnalyticsResponse getReviewAnalytics() {
        Long businessId = SecurityUtils.getCurrentBusinessId();

        Double avgRatingRaw = reviewRepository.getAverageRating(businessId);
        double averageRating = BigDecimal.valueOf(avgRatingRaw != null ? avgRatingRaw : 0.0)
                .setScale(1, RoundingMode.HALF_UP)
                .doubleValue();

        long totalReviews = reviewRepository.countByBusinessIdAndHiddenFalse(businessId);
        long positiveCount = reviewRepository.countPositiveReviews(businessId);
        long redirectsCount = reviewRepository.countPublicPlatformRedirects(businessId);

        double positivePercentage = 0.0;
        if (totalReviews > 0) {
            positivePercentage = BigDecimal.valueOf((double) positiveCount / totalReviews * 100)
                    .setScale(1, RoundingMode.HALF_UP)
                    .doubleValue();
        }

        // Rating distribution map for 5, 4, 3, 2, 1 stars
        List<Object[]> distRows = reviewRepository.getRatingDistribution(businessId);
        Map<Integer, Long> countMap = new HashMap<>();
        for (Object[] row : distRows) {
            if (row[0] != null && row[1] != null) {
                countMap.put((Integer) row[0], (Long) row[1]);
            }
        }

        List<RatingDistributionItem> distribution = new ArrayList<>();
        for (int stars = 5; stars >= 1; stars--) {
            long count = countMap.getOrDefault(stars, 0L);
            double pct = totalReviews > 0
                    ? BigDecimal.valueOf((double) count / totalReviews * 100).setScale(1, RoundingMode.HALF_UP).doubleValue()
                    : 0.0;
            distribution.add(RatingDistributionItem.builder()
                    .stars(stars)
                    .count(count)
                    .percentage(pct)
                    .build());
        }

        // Recent 10 reviews
        List<Review> recentList = reviewRepository.findRecentReviews(businessId, PageRequest.of(0, 10));
        List<ReviewResponse> recent = recentList.stream()
                .map(ReviewResponse::fromEntity)
                .collect(Collectors.toList());

        return ReviewAnalyticsResponse.builder()
                .averageRating(averageRating)
                .totalReviews(totalReviews)
                .positiveReviewsCount(positiveCount)
                .positivePercentage(positivePercentage)
                .publicPlatformRedirectsCount(redirectsCount)
                .ratingDistribution(distribution)
                .recentReviews(recent)
                .build();
    }

    @Transactional
    public ReviewSettingsResponse getReviewSettings() {
        Long businessId = SecurityUtils.getCurrentBusinessId();
        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Business", "id", businessId));

        if (business.getReviewSlug() == null || business.getReviewSlug().trim().isEmpty()) {
            String autoSlug = generateInitialSlug(business.getName(), business.getId());
            business.setReviewSlug(autoSlug);
            business = businessRepository.save(business);
        }

        String directUrl = buildDirectReviewUrl(business.getReviewSlug());

        return ReviewSettingsResponse.builder()
                .businessId(business.getId())
                .businessName(business.getName())
                .reviewSlug(business.getReviewSlug())
                .publicReviewUrl(business.getPublicReviewUrl())
                .reviewPromptMessage(business.getReviewPromptMessage())
                .reviewEnabled(business.isReviewEnabled())
                .directReviewPageUrl(directUrl)
                .build();
    }

    @Transactional
    public ReviewSettingsResponse updateReviewSettings(ReviewSettingsRequest request) {
        Long businessId = SecurityUtils.getCurrentBusinessId();
        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Business", "id", businessId));

        if (request.getReviewSlug() != null && !request.getReviewSlug().trim().isEmpty()) {
            String cleanedSlug = slugify(request.getReviewSlug());
            if (businessRepository.existsByReviewSlugAndIdNot(cleanedSlug, businessId)) {
                throw new BadRequestException("Review slug '" + cleanedSlug + "' is already taken. Please choose another.");
            }
            business.setReviewSlug(cleanedSlug);
        }

        if (request.getPublicReviewUrl() != null) {
            business.setPublicReviewUrl(request.getPublicReviewUrl().trim());
        }

        if (request.getReviewPromptMessage() != null) {
            business.setReviewPromptMessage(request.getReviewPromptMessage().trim());
        }

        if (request.getReviewEnabled() != null) {
            business.setReviewEnabled(request.getReviewEnabled());
        }

        Business saved = businessRepository.save(business);
        String directUrl = buildDirectReviewUrl(saved.getReviewSlug());

        return ReviewSettingsResponse.builder()
                .businessId(saved.getId())
                .businessName(saved.getName())
                .reviewSlug(saved.getReviewSlug())
                .publicReviewUrl(saved.getPublicReviewUrl())
                .reviewPromptMessage(saved.getReviewPromptMessage())
                .reviewEnabled(saved.isReviewEnabled())
                .directReviewPageUrl(directUrl)
                .build();
    }

    @Transactional(readOnly = true)
    public QrCodeResponse generateQrCode() {
        Long businessId = SecurityUtils.getCurrentBusinessId();
        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Business", "id", businessId));

        String slug = business.getReviewSlug() != null ? business.getReviewSlug() : String.valueOf(business.getId());
        String reviewUrl = buildDirectReviewUrl(slug);

        String qrCodeDataUrl = generateQrCodeBase64(reviewUrl, 380, 380);

        return QrCodeResponse.builder()
                .businessId(business.getId())
                .businessName(business.getName())
                .reviewSlug(slug)
                .reviewUrl(reviewUrl)
                .qrCodeDataUrl(qrCodeDataUrl)
                .build();
    }

    @Transactional
    public ReviewResponse moderateReview(Long id, boolean hidden, String notes) {
        Long businessId = SecurityUtils.getCurrentBusinessId();
        Review review = reviewRepository.findByIdAndBusinessId(id, businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Review", "id", id));

        review.setHidden(hidden);
        if (notes != null) {
            review.setModerationNotes(notes.trim());
        }

        Review saved = reviewRepository.save(review);
        return ReviewResponse.fromEntity(saved);
    }

    private Business resolveBusinessBySlugOrId(String slugOrId) {
        if (slugOrId == null || slugOrId.trim().isEmpty()) {
            throw new ResourceNotFoundException("Business identifier is missing.");
        }

        String input = slugOrId.trim();

        // 1. Try finding by reviewSlug
        Optional<Business> bySlug = businessRepository.findByReviewSlug(input);
        if (bySlug.isPresent()) {
            return bySlug.get();
        }

        // 2. Try parsing as numeric ID
        try {
            Long id = Long.parseLong(input);
            return businessRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Business", "id", id));
        } catch (NumberFormatException e) {
            throw new ResourceNotFoundException("Business with review slug '" + input + "' not found.");
        }
    }

    private String buildDirectReviewUrl(String slug) {
        String base = frontendBaseUrl.replaceAll("/+$", "");
        return base + "/review/" + slug;
    }

    private String generateInitialSlug(String name, Long id) {
        String baseSlug = slugify(name);
        return baseSlug.isEmpty() ? "biz-" + id : baseSlug + "-" + id;
    }

    private String slugify(String input) {
        if (input == null) return "";
        return input.toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("-+", "-")
                .replaceAll("^-|-$", "");
    }

    private String generateQrCodeBase64(String text, int width, int height) {
        try {
            QRCodeWriter qrCodeWriter = new QRCodeWriter();
            Map<EncodeHintType, Object> hints = new HashMap<>();
            hints.put(EncodeHintType.CHARACTER_SET, "UTF-8");
            hints.put(EncodeHintType.ERROR_CORRECTION, ErrorCorrectionLevel.H);
            hints.put(EncodeHintType.MARGIN, 2);

            BitMatrix bitMatrix = qrCodeWriter.encode(text, BarcodeFormat.QR_CODE, width, height, hints);
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(bitMatrix, "PNG", outputStream);

            byte[] pngData = outputStream.toByteArray();
            return "data:image/png;base64," + Base64.getEncoder().encodeToString(pngData);
        } catch (Exception e) {
            log.error("Failed to generate QR code for URL {}", text, e);
            throw new RuntimeException("Failed to generate QR code", e);
        }
    }
}
