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
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
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
    private final com.bizflow.ai.provider.OpenRouterProvider openRouterProvider;
    private final com.bizflow.ai.provider.GeminiProvider geminiProvider;
    private final com.fasterxml.jackson.databind.ObjectMapper objectMapper;

    @Value("${app.frontend.url:https://bizflow-frontend-spa8.onrender.com}")
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
                .effectiveReviewUrl(business.getPublicReviewUrl())
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
            String url = request.getPublicReviewUrl().trim();
            if (!url.isEmpty() && !url.toLowerCase().startsWith("http://") && !url.toLowerCase().startsWith("https://")) {
                url = "https://" + url;
            }
            business.setPublicReviewUrl(url.isEmpty() ? null : url);
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
                .effectiveReviewUrl(saved.getPublicReviewUrl())
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
        String reviewBoostUrl = buildDirectReviewUrl(slug);

        // QR encodes the BizFlow Review Boost page URL
        String qrCodeDataUrl = generateQrCodeBase64(reviewBoostUrl, 380, 380);

        return QrCodeResponse.builder()
                .businessId(business.getId())
                .businessName(business.getName())
                .reviewSlug(slug)
                .reviewUrl(reviewBoostUrl)
                .googleReviewUrl(business.getPublicReviewUrl())
                .internalReviewUrl(reviewBoostUrl)
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
        String base = (frontendBaseUrl != null && !frontendBaseUrl.trim().isEmpty())
                ? frontendBaseUrl.trim()
                : "https://bizflow-frontend-spa8.onrender.com";
        if (base.contains("localhost") || base.contains("127.0.0.1") || base.contains("0.0.0.0")) {
            base = "https://bizflow-frontend-spa8.onrender.com";
        }
        base = base.replaceAll("/+$", "");
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

    @Transactional(readOnly = true)
    public AiReviewSuggestionResponse generateAiReview(String slugOrId, AiReviewGenerateRequest request) {
        Business business = resolveBusinessBySlugOrId(slugOrId);

        int rating = request != null && request.getRating() >= 1 && request.getRating() <= 5 ? request.getRating() : 5;
        String bizName = business.getName();
        String bizType = business.getBusinessType() != null ? business.getBusinessType().name() : "establishment";
        String keywords = request != null && request.getKeywords() != null ? request.getKeywords().trim() : "";

        String systemPrompt = "You are an authentic customer review assistant. "
                + "Generate 3 to 5 natural, diverse review suggestions for a business based strictly on the selected star rating.\n"
                + "Rating Guidelines:\n"
                + "1 Star: Respectful negative feedback and constructive improvement suggestions.\n"
                + "2 Stars: Mildly negative and honest feedback.\n"
                + "3 Stars: Balanced feedback acknowledging both positives and areas for growth.\n"
                + "4 Stars: Positive, natural, and helpful feedback.\n"
                + "5 Stars: Highly positive, authentic, and enthusiastic feedback.\n"
                + "CRITICAL CONSTRAINTS:\n"
                + "- Do NOT sound robotic, repetitive, exaggerated, or obviously AI-generated.\n"
                + "- Do NOT invent specific names of staff, discounts, prices, products, or fake events unless explicitly provided by the customer.\n"
                + "- Keep each review concise (1-3 sentences).\n"
                + "Return ONLY a valid JSON object matching this exact schema:\n"
                + "{\n"
                + "  \"suggestions\": [\"Review 1...\", \"Review 2...\", \"Review 3...\", \"Review 4...\"],\n"
                + "  \"highlightTags\": [\"Aspect 1\", \"Aspect 2\", \"Aspect 3\", \"Aspect 4\"]\n"
                + "}\n"
                + "Do NOT wrap in markdown formatting or backticks. Return raw JSON.";

        String userPrompt = String.format("Generate %d-star reviews for '%s' (%s). %s",
                rating, bizName, bizType,
                !keywords.isEmpty() ? "Customer highlighted aspect: " + keywords : "");

        String rawResponse = null;

        // 1. Try OpenRouter first (meta-llama/llama-3.3-70b-instruct)
        if (openRouterProvider != null && openRouterProvider.isConfigured()) {
            try {
                rawResponse = openRouterProvider.generateCompletion(systemPrompt, List.of(), userPrompt);
                log.info("AI review generation succeeded with OpenRouter for business {}", bizName);
            } catch (Exception e) {
                log.warn("OpenRouter review generation failed, falling back to Gemini: {}", e.getMessage());
            }
        }

        // 2. Try Gemini fallback
        if (rawResponse == null && geminiProvider != null && geminiProvider.isConfigured()) {
            try {
                rawResponse = geminiProvider.generateCompletion(systemPrompt, List.of(), userPrompt);
                log.info("AI review generation succeeded with Gemini for business {}", bizName);
            } catch (Exception e) {
                log.warn("Gemini review generation failed: {}", e.getMessage());
            }
        }

        List<String> suggestions = new ArrayList<>();
        List<String> tags = new ArrayList<>();

        if (rawResponse != null) {
            try {
                String cleanJson = cleanJsonString(rawResponse);
                JsonNode root = objectMapper.readTree(cleanJson);
                if (root.path("suggestions").isArray()) {
                    for (JsonNode n : root.path("suggestions")) {
                        String text = n.asText().trim();
                        if (!text.isEmpty()) {
                            suggestions.add(text);
                        }
                    }
                }
                if (root.path("highlightTags").isArray()) {
                    for (JsonNode n : root.path("highlightTags")) {
                        String tag = n.asText().trim();
                        if (!tag.isEmpty()) {
                            tags.add(tag);
                        }
                    }
                }
            } catch (Exception e) {
                log.warn("Failed to parse JSON response from AI review, splitting by lines: {}", e.getMessage());
                String[] lines = rawResponse.split("\n");
                for (String line : lines) {
                    String cleanLine = line.replaceAll("^[-*0-9.]+\\s*", "").replaceAll("^\"|\"$", "").trim();
                    if (cleanLine.length() > 15 && !cleanLine.startsWith("{") && !cleanLine.startsWith("}")) {
                        suggestions.add(cleanLine);
                    }
                }
            }
        }

        // 3. Fallback to tailored review suggestions if AI services are unreachable or unconfigured
        if (suggestions.isEmpty()) {
            suggestions = buildFallbackSuggestions(rating, bizName, keywords);
        }

        // Default highlight tags based on star rating if empty
        if (tags.isEmpty()) {
            if (rating >= 4) {
                tags = List.of("Fast Service ⚡", "Top Quality ✨", "Friendly Staff 😊", "Great Value 💰", "Clean & Welcoming 🌿");
            } else if (rating == 3) {
                tags = List.of("Decent Service 🆗", "Reasonable 🏷️", "Room for Improvement ⏱️");
            } else {
                tags = List.of("Needs Attention ⚠️", "Service Speed ⏳", "Disappointed 😕");
            }
        }

        return AiReviewSuggestionResponse.builder()
                .rating(rating)
                .generatedReview(suggestions.isEmpty() ? "" : suggestions.get(0))
                .alternativeSuggestions(suggestions)
                .highlightTags(tags)
                .build();
    }

    private List<String> buildFallbackSuggestions(int rating, String bizName, String keywords) {
        List<String> list = new ArrayList<>();
        String aspect = (keywords != null && !keywords.trim().isEmpty()) ? " - especially regarding " + keywords.trim() : "";

        if (rating == 5) {
            list.add(String.format("Exceptional experience at %s! Staff was very courteous, service was rapid, and the overall quality was top notch%s. Highly recommended!", bizName, aspect));
            list.add(String.format("Hands down one of the best visits I have had. %s consistently delivers fantastic service and great value.", bizName));
            list.add(String.format("Outstanding quality and super friendly team at %s. Fast checkout and very pleasant atmosphere!", bizName));
        } else if (rating == 4) {
            list.add(String.format("Very good visit to %s. Helpful staff, prompt service, and fair pricing%s. Will definitely visit again.", bizName, aspect));
            list.add(String.format("Great overall experience at %s. Clean premises and good attention to detail.", bizName));
            list.add(String.format("Solid 4-star experience. Quality is reliable and checkout was smooth.", bizName));
        } else if (rating == 3) {
            list.add(String.format("Decent experience at %s. The service was acceptable, though there is some room for improvement in turnaround time%s.", bizName, aspect));
            list.add(String.format("Average visit overall. Fair prices and decent quality, but could be slightly better organized.", bizName));
        } else if (rating == 2) {
            list.add(String.format("Service at %s was below expectations today%s. Hoping the management looks into improving wait times.", bizName, aspect));
            list.add(String.format("Needs noticeable improvement in customer service and efficiency.", bizName));
        } else {
            list.add(String.format("Very disappointed with the service at %s today%s. Urgent attention is needed to improve customer satisfaction.", bizName, aspect));
            list.add("Not satisfied with the service provided during my visit.");
        }
        return list;
    }

    private String cleanJsonString(String text) {
        if (text == null) return "{}";
        String trimmed = text.trim();
        if (trimmed.startsWith("```json")) {
            trimmed = trimmed.substring(7);
        } else if (trimmed.startsWith("```")) {
            trimmed = trimmed.substring(3);
        }
        if (trimmed.endsWith("```")) {
            trimmed = trimmed.substring(0, trimmed.length() - 3);
        }
        return trimmed.trim();
    }
}
