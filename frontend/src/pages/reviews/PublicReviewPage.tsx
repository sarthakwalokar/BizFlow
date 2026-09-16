import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { reviewsApi, PublicBusinessReviewInfo, AiReviewSuggestionResponse } from '../../api/reviews';
import { ButtonSpinner } from '../../components/common/LoadingStates';
import {
  Star,
  CheckCircle2,
  AlertCircle,
  Store,
  ExternalLink,
  Sparkles,
  Copy,
  Check,
  RefreshCw,
  MessageSquareHeart,
  ShieldCheck,
} from 'lucide-react';

const RATING_LABELS: Record<number, string> = {
  1: 'Very Disappointed 😞',
  2: 'Needs Improvement ⚠️',
  3: 'Average Experience ⚖️',
  4: 'Great Service! 👍',
  5: 'Outstanding Experience! 🌟',
};

const DEFAULT_CHIPS_BY_RATING: Record<number, string[]> = {
  5: ['Fast Service ⚡', 'Top Quality ✨', 'Friendly Staff 😊', 'Great Value 💰', 'Clean & Welcoming 🌿'],
  4: ['Good Service 👍', 'Pleasant Visit 😊', 'Fair Prices 🏷️', 'Helpful Team 🤝'],
  3: ['Decent Experience 🆗', 'Can Be Faster ⏱️', 'Average Service ⚖️'],
  2: ['Needs Improvement ⚠️', 'Slow Service ⏳', 'Long Wait Time ⏱️'],
  1: ['Very Disappointed 😞', 'Poor Service ❌', 'Expected Better 👎'],
};

export const PublicReviewPage: React.FC = () => {
  const { slugOrId } = useParams<{ slugOrId: string }>();

  const [businessInfo, setBusinessInfo] = useState<PublicBusinessReviewInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [feedbackText, setFeedbackText] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerContact, setCustomerContact] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);
  const [redirectCountdown, setRedirectCountdown] = useState<number>(3);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // AI Review Assistant States
  const [generatingAi, setGeneratingAi] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [copiedReview, setCopiedReview] = useState(false);

  // Helper to ensure URL always has https:// protocol and falls back to Google search
  const formatExternalUrl = (url?: string): string | null => {
    if (!url) return null;
    const trimmed = url.trim();
    if (!trimmed) return null;
    if (/^https?:\/\//i.test(trimmed)) {
      return trimmed;
    }
    return `https://${trimmed}`;
  };

  const getGoogleReviewDestination = (biz: PublicBusinessReviewInfo | null): string => {
    const directUrl = formatExternalUrl(biz?.publicReviewUrl);
    if (directUrl) return directUrl;
    const searchTarget = encodeURIComponent(`${biz?.name || 'Business'} google reviews`);
    return `https://www.google.com/search?q=${searchTarget}`;
  };

  useEffect(() => {
    const fetchBusiness = async () => {
      if (!slugOrId) return;
      try {
        setLoading(true);
        const data = await reviewsApi.getPublicReviewInfo(slugOrId);
        setBusinessInfo(data);
      } catch (err: any) {
        setErrorMessage('Unable to load review form for this business.');
      } finally {
        setLoading(false);
      }
    };
    fetchBusiness();
  }, [slugOrId]);

  // Handle Star Rating Selection + Auto-generate initial AI review
  const handleSelectRating = async (selectedStar: number) => {
    setRating(selectedStar);
    setSelectedTag(null);
    setAvailableTags(DEFAULT_CHIPS_BY_RATING[selectedStar] || []);

    // Generate AI review suggestions for this star level
    await triggerAiGeneration(selectedStar);
  };

  const triggerAiGeneration = async (starLevel: number, keyword?: string) => {
    if (!slugOrId) return;
    try {
      setGeneratingAi(true);
      const res: AiReviewSuggestionResponse = await reviewsApi.generateAiReview(slugOrId, {
        rating: starLevel,
        keywords: keyword,
      });

      if (res.generatedReview) {
        setFeedbackText(res.generatedReview);
      }
      if (res.alternativeSuggestions && res.alternativeSuggestions.length > 0) {
        setAiSuggestions(res.alternativeSuggestions);
      }
      if (res.highlightTags && res.highlightTags.length > 0) {
        setAvailableTags(res.highlightTags);
      }
    } catch (e) {
      // Fallback local templates if network or AI service encounters temporary hiccup
      const name = businessInfo?.name || 'this business';
      if (starLevel === 5) {
        setFeedbackText(`Outstanding experience at ${name}! Top-notch service, courteous staff, and great quality. Highly recommended!`);
        setAiSuggestions([
          `5 stars for ${name}! Fantastic experience and wonderful customer service.`,
          `Consistently great quality at ${name}. Will definitely be returning!`,
        ]);
      } else if (starLevel === 4) {
        setFeedbackText(`Very good experience at ${name}. Friendly staff, quick service, and great value overall.`);
      } else if (starLevel === 3) {
        setFeedbackText(`Average visit to ${name}. Decent experience, but could improve on response time.`);
      } else {
        setFeedbackText(`Disappointed with my recent visit to ${name}. Hope management addresses service delays.`);
      }
    } finally {
      setGeneratingAi(false);
    }
  };

  const handleChipClick = (tag: string) => {
    setSelectedTag(tag);
    triggerAiGeneration(rating, tag);
  };

  const handleCopyReviewText = () => {
    if (!feedbackText.trim()) return;
    navigator.clipboard.writeText(feedbackText.trim());
    setCopiedReview(true);
    setTimeout(() => setCopiedReview(false), 2500);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setErrorMessage('Please tap a star rating before submitting.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage(null);

      const isPositive = rating >= 4;
      const targetGoogleUrl = isPositive ? getGoogleReviewDestination(businessInfo) : undefined;

      await reviewsApi.submitPublicReview(slugOrId!, {
        rating,
        feedbackText: feedbackText.trim() || undefined,
        customerName: customerName.trim() || undefined,
        customerContact: customerContact.trim() || undefined,
        redirectedToPublicPlatform: isPositive,
      });

      // Auto-copy review text to clipboard for positive reviews so user can paste on Google
      if (isPositive && feedbackText.trim()) {
        try {
          await navigator.clipboard.writeText(feedbackText.trim());
          setCopiedReview(true);
        } catch {
          // Ignore clipboard permission errors
        }
      }

      setSubmitted(true);

      // If positive review, prepare redirect to Google Reviews
      if (isPositive && targetGoogleUrl) {
        setRedirectUrl(targetGoogleUrl);
      }
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        'Failed to submit your feedback. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Countdown timer for automatic redirect to Google Reviews
  useEffect(() => {
    if (!submitted || !redirectUrl) return;

    if (redirectCountdown > 0) {
      const timer = setTimeout(() => {
        setRedirectCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      // Countdown finished -> redirect to external Google Review URL
      window.location.href = redirectUrl;
    }
  }, [submitted, redirectUrl, redirectCountdown]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-medium text-zinc-500">Loading business review page...</span>
        </div>
      </div>
    );
  }

  if (!businessInfo || !businessInfo.reviewEnabled) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-4">
        <div className="max-w-sm w-full bg-white rounded-xl border border-zinc-200 p-6 text-center space-y-3 shadow-xs">
          <Store size={36} className="mx-auto text-zinc-400" />
          <h2 className="text-base font-bold text-zinc-900">Review Page Unavailable</h2>
          <p className="text-xs text-zinc-500 leading-relaxed">
            This business review portal is currently not active or the link has changed.
          </p>
          <Link
            to="/"
            className="inline-block px-4 py-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-medium"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const isPositiveRating = rating >= 4;

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col justify-between py-8 px-4 sm:px-6 font-sans">
      <div className="max-w-lg mx-auto w-full space-y-5">
        {/* Business Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-brand-600 text-white flex items-center justify-center mx-auto shadow-md font-bold text-2xl tracking-wide">
            {businessInfo.name.charAt(0)}
          </div>
          <h1 className="text-xl font-bold text-zinc-900 tracking-tight">
            {businessInfo.name}
          </h1>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            {businessInfo.reviewPromptMessage || 'How was your experience with us today?'}
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl border border-zinc-200 p-6 sm:p-7 shadow-sm space-y-6">
          {submitted ? (
            <div className="text-center py-4 space-y-5">
              <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100 shadow-xs">
                <CheckCircle2 size={32} />
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-bold text-zinc-900">Thank You for Your Review!</h3>
                <p className="text-xs text-zinc-600 leading-relaxed max-w-sm mx-auto">
                  {isPositiveRating
                    ? 'Your positive review means the world to our small business team!'
                    : 'Your feedback has been received and shared directly with management for prompt attention.'}
                </p>
              </div>

              {/* Positive Review Google Action Card */}
              {isPositiveRating && redirectUrl && (
                <div className="p-5 rounded-xl bg-gradient-to-br from-brand-50 via-purple-50/60 to-white border border-brand-200 text-left space-y-4 shadow-xs">
                  <div className="flex items-center justify-between border-b border-brand-100 pb-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-xs border border-brand-200 text-amber-500">
                        <Star size={14} className="fill-amber-500 text-amber-500" />
                      </div>
                      <span className="font-bold text-xs text-brand-900">Post on Google Reviews</span>
                    </div>

                    <span className="text-[11px] font-semibold text-brand-700 bg-brand-100/70 px-2.5 py-0.5 rounded-full">
                      Redirecting in {redirectCountdown}s
                    </span>
                  </div>

                  {feedbackText.trim() && (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] text-zinc-500">
                        <span className="font-medium">Your Review (Copied to clipboard):</span>
                        <button
                          type="button"
                          onClick={handleCopyReviewText}
                          className="inline-flex items-center space-x-1 text-brand-700 hover:text-brand-900 font-semibold cursor-pointer"
                        >
                          {copiedReview ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                          <span>{copiedReview ? 'Copied!' : 'Copy Again'}</span>
                        </button>
                      </div>
                      <div className="p-3 bg-white rounded-lg border border-brand-100 text-xs text-zinc-700 italic font-mono leading-relaxed line-clamp-3">
                        "{feedbackText}"
                      </div>
                    </div>
                  )}

                  <div className="space-y-2 pt-1">
                    <a
                      href={redirectUrl}
                      className="w-full py-2.5 px-4 rounded-lg bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white font-semibold text-xs flex items-center justify-center space-x-2 shadow-sm transition-all cursor-pointer"
                    >
                      <span>Open Google Reviews Now</span>
                      <ExternalLink size={14} />
                    </a>

                    <p className="text-[10px] text-zinc-400 text-center">
                      Simply paste (Ctrl+V) your copied review text when the Google page opens.
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmitReview} className="space-y-5">
              {errorMessage && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
                  <AlertCircle size={15} className="shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Star Rating Selector */}
              <div className="text-center space-y-2.5">
                <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider block">
                  Tap stars to rate your experience
                </label>

                <div className="flex items-center justify-center space-x-2.5 py-1">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const isFilled = star <= (hoverRating || rating);
                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() => handleSelectRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 transition-transform hover:scale-125 active:scale-95 cursor-pointer focus:outline-none"
                        title={`${star} Star${star > 1 ? 's' : ''}`}
                      >
                        <Star
                          size={36}
                          className={
                            isFilled
                              ? 'fill-amber-400 text-amber-400 drop-shadow-xs'
                              : 'text-zinc-200'
                          }
                        />
                      </button>
                    );
                  })}
                </div>

                {rating > 0 && (
                  <div className="animate-fadeIn">
                    <span
                      className={`inline-block px-3.5 py-1 rounded-full text-xs font-semibold border ${
                        rating >= 4
                          ? 'bg-amber-50 text-amber-900 border-amber-200'
                          : 'bg-zinc-100 text-zinc-800 border-zinc-200'
                      }`}
                    >
                      {RATING_LABELS[rating]}
                    </span>
                  </div>
                )}
              </div>

              {/* AI GENERATOR & PROMPT CHIPS (Shows once star is selected) */}
              {rating > 0 && (
                <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-100 space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5 text-brand-800 text-xs font-bold">
                      <Sparkles size={14} className="text-brand-600 animate-pulse" />
                      <span>AI Review Generator</span>
                    </div>

                    <button
                      type="button"
                      disabled={generatingAi}
                      onClick={() => triggerAiGeneration(rating, selectedTag || undefined)}
                      className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md bg-white hover:bg-purple-100/50 border border-brand-200 text-brand-700 text-[11px] font-semibold shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw size={11} className={generatingAi ? 'animate-spin' : ''} />
                      <span>{generatingAi ? 'Generating...' : 'Re-generate'}</span>
                    </button>
                  </div>

                  {/* Highlight aspect chips */}
                  {availableTags.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block">
                        Quick Aspects (Tap to include in review):
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {availableTags.map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => handleChipClick(tag)}
                            className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all cursor-pointer border ${
                              selectedTag === tag
                                ? 'bg-brand-600 text-white border-brand-600 shadow-2xs'
                                : 'bg-white hover:bg-purple-50 text-zinc-700 border-zinc-200'
                            }`}
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Alternative suggestions quick picker */}
                  {aiSuggestions.length > 0 && (
                    <div className="space-y-1 pt-1 border-t border-purple-100/80">
                      <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block">
                        Or pick an AI suggested review:
                      </span>
                      <div className="space-y-1.5">
                        {aiSuggestions.map((sug, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setFeedbackText(sug)}
                            className="w-full text-left p-2 rounded-lg bg-white hover:bg-brand-50/50 border border-zinc-200 text-[11px] text-zinc-700 leading-snug line-clamp-2 transition-colors cursor-pointer hover:border-brand-300"
                          >
                            "{sug}"
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Review Textarea */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-zinc-700">
                    {rating >= 4 ? 'Your Review' : 'Detailed Feedback (Optional)'}
                  </label>
                  {feedbackText.trim().length > 0 && (
                    <button
                      type="button"
                      onClick={handleCopyReviewText}
                      className="inline-flex items-center space-x-1 text-[11px] font-medium text-brand-700 hover:text-brand-900 cursor-pointer"
                    >
                      {copiedReview ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                      <span>{copiedReview ? 'Copied!' : 'Copy text'}</span>
                    </button>
                  )}
                </div>

                <div className="relative">
                  <textarea
                    rows={4}
                    placeholder={
                      rating > 0
                        ? 'Tap a quick aspect above or write your own review here...'
                        : 'Please select a star rating first...'
                    }
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 resize-none leading-relaxed"
                  />
                  {generatingAi && (
                    <div className="absolute inset-0 bg-white/70 backdrop-blur-2xs rounded-xl flex items-center justify-center space-x-2 text-brand-700 font-semibold text-xs">
                      <Sparkles size={16} className="animate-spin text-brand-600" />
                      <span>Crafting AI Review...</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Customer Contact Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-700">Your Name (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Priya Sharma"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg border border-zinc-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-700">Phone / Email (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. 9876543210"
                    value={customerContact}
                    onChange={(e) => setCustomerContact(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg border border-zinc-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                </div>
              </div>

              {/* Submit & Google Redirection Callout */}
              {isPositiveRating && (
                <div className="p-3 rounded-lg bg-amber-50/60 border border-amber-200/80 flex items-start space-x-2 text-[11px] text-amber-900">
                  <Star size={14} className="text-amber-600 shrink-0 mt-0.5 fill-amber-500" />
                  <p>
                    <strong>5-Star Boost:</strong> Submitting will automatically copy your review and direct you to Google Reviews to support <strong>{businessInfo.name}</strong>!
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={rating === 0 || submitting}
                className={`w-full py-3 rounded-xl font-semibold text-xs shadow-sm transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center space-x-2 ${
                  isPositiveRating
                    ? 'bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white'
                    : 'bg-zinc-900 hover:bg-black active:bg-zinc-800 text-white'
                }`}
              >
                {submitting ? (
                  <ButtonSpinner text="Submitting Review..." spinnerColor="text-white" />
                ) : isPositiveRating ? (
                  <>
                    <span>Submit &amp; Open Google Reviews</span>
                    <ExternalLink size={14} />
                  </>
                ) : (
                  <>
                    <MessageSquareHeart size={14} />
                    <span>Submit Private Feedback</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="text-center text-[11px] text-zinc-400 space-y-1 flex items-center justify-center space-x-1.5">
          <ShieldCheck size={13} className="text-zinc-400" />
          <span>Verified Customer Review Portal &bull; Powered by BizFlow</span>
        </div>
      </div>
    </div>
  );
};
