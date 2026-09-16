import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { reviewsApi, PublicBusinessReviewInfo } from '../../api/reviews';
import { ButtonSpinner } from '../../components/common/LoadingStates';
import {
  Star,
  CheckCircle2,
  AlertCircle,
  Store,
  ExternalLink,
} from 'lucide-react';

const RATING_LABELS: Record<number, string> = {
  1: 'Very Disappointed',
  2: 'Needs Improvement',
  3: 'Average Experience',
  4: 'Great Service',
  5: 'Outstanding!',
};

export const PublicReviewPage: React.FC = () => {
  const { slugOrId } = useParams<{ slugOrId: string }>();

  const [businessInfo, setBusinessInfo] = useState<PublicBusinessReviewInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [feedbackText, setFeedbackText] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [redirectedToExternal, setRedirectedToExternal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setErrorMessage('Please select a star rating first.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage(null);

      await reviewsApi.submitPublicReview(slugOrId!, {
        rating,
        feedbackText: feedbackText.trim() || undefined,
        customerName: customerName.trim() || undefined,
      });

      setSubmitted(true);

      if (rating >= 4 && businessInfo?.publicReviewUrl) {
        setRedirectedToExternal(true);
        setTimeout(() => {
          window.location.href = businessInfo.publicReviewUrl!;
        }, 1500);
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

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col justify-between py-10 px-4 sm:px-6 font-sans">
      <div className="max-w-md mx-auto w-full space-y-6">
        {/* Business Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-brand-600 text-white flex items-center justify-center mx-auto shadow-xs font-bold text-xl">
            {businessInfo.name.charAt(0)}
          </div>
          <h1 className="text-xl font-bold text-zinc-900 tracking-tight">
            {businessInfo.name}
          </h1>
          <p className="text-xs text-zinc-500">
            {businessInfo.reviewPromptMessage || 'How was your experience with us today?'}
          </p>
        </div>

        {/* Main Review Card */}
        <div className="bg-white rounded-xl border border-zinc-200 p-6 sm:p-8 shadow-xs space-y-6">
          {submitted ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-12 h-12 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center mx-auto">
                <CheckCircle2 size={28} />
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-bold text-zinc-900">Thank You!</h3>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  Your feedback helps us continuously improve our service and quality.
                </p>
              </div>

              {redirectedToExternal && businessInfo.publicReviewUrl && (
                <div className="p-3.5 rounded-lg bg-brand-50 border border-brand-200 text-brand-900 text-xs space-y-2">
                  <p className="font-semibold">Taking you to Google Reviews...</p>
                  <a
                    href={businessInfo.publicReviewUrl}
                    className="inline-flex items-center space-x-1 font-semibold text-brand-700 hover:underline"
                  >
                    <span>Click here if not redirected automatically</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={(e) => handleSubmitReview(e)} className="space-y-5">
              {errorMessage && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Star Rating Selector */}
              <div className="text-center space-y-2">
                <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wider block">
                  Tap a star to rate
                </label>

                <div className="flex items-center justify-center space-x-2 py-1">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const isFilled = star <= (hoverRating || rating);
                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1.5 transition-transform hover:scale-110 cursor-pointer focus:outline-none"
                      >
                        <Star
                          size={32}
                          className={
                            isFilled
                              ? 'fill-amber-500 text-amber-500'
                              : 'text-zinc-200'
                          }
                        />
                      </button>
                    );
                  })}
                </div>

                {rating > 0 && (
                  <span className="inline-block px-3 py-0.5 rounded-full bg-amber-50 text-amber-800 text-xs font-medium border border-amber-200">
                    {RATING_LABELS[rating]}
                  </span>
                )}
              </div>

              {/* Feedback Textarea */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-700">
                  {rating >= 4 ? 'What did you like the most?' : 'How can we improve?'} (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Share details of your experience..."
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 resize-none"
                />
              </div>

              {/* Customer Name */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-700">Your Name (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Priya"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg border border-zinc-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>

              {/* Submit Action */}
              <button
                type="submit"
                disabled={rating === 0 || submitting}
                className="w-full py-2.5 rounded-lg bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white font-medium text-xs shadow-xs transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <ButtonSpinner text="Submitting..." spinnerColor="text-white" />
                ) : (
                  'Submit Feedback'
                )}
              </button>
            </form>
          )}
        </div>

        <div className="text-center text-xs text-zinc-400 space-y-1">
          <p>Powered by BizFlow Review Boost</p>
        </div>
      </div>
    </div>
  );
};
