import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  reviewsApi,
  PublicBusinessReviewInfo,
  SubmitReviewRequest,
} from '../../api/reviews';
import {
  Star,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  ShieldCheck,
  Store,
} from 'lucide-react';

const RATING_LABELS = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent!'];

export const PublicReviewPage: React.FC = () => {
  const { slugOrId } = useParams<{ slugOrId: string }>();

  const [businessInfo, setBusinessInfo] = useState<PublicBusinessReviewInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [notFound, setNotFound] = useState<boolean>(false);

  // Form State
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [feedbackText, setFeedbackText] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerContact, setCustomerContact] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [redirectedToExternal, setRedirectedToExternal] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchInfo = async () => {
      if (!slugOrId) return;
      try {
        setLoading(true);
        const data = await reviewsApi.getPublicReviewInfo(slugOrId);
        setBusinessInfo(data);
      } catch (err) {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchInfo();
  }, [slugOrId]);

  const handleSubmitReview = async (e?: React.FormEvent, forceRedirect = false) => {
    if (e) e.preventDefault();
    if (!slugOrId || rating === 0) return;

    setSubmitting(true);
    setErrorMessage(null);

    const payload: SubmitReviewRequest = {
      rating,
      feedbackText: feedbackText.trim() || undefined,
      customerName: customerName.trim() || undefined,
      customerContact: customerContact.trim() || undefined,
      redirectedToPublicPlatform: forceRedirect || redirectedToExternal,
    };

    try {
      await reviewsApi.submitPublicReview(slugOrId, payload);
      setSubmitted(true);

      if (forceRedirect && businessInfo?.publicReviewUrl) {
        window.open(businessInfo.publicReviewUrl, '_blank', 'noopener,noreferrer');
      }
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        'Failed to submit your review. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const activeStar = hoverRating || rating;
  const isPositive = rating >= 4;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-400 text-xs font-medium">Connecting to review terminal...</p>
        </div>
      </div>
    );
  }

  if (notFound || !businessInfo) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-md w-full text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
            <AlertCircle size={24} />
          </div>
          <h2 className="text-lg font-bold text-white">Review Page Unavailable</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            This business review page is currently inactive or the link is invalid.
          </p>
          <Link
            to="/"
            className="inline-block px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all"
          >
            Back to BizFlow Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100 flex flex-col justify-between py-8 px-4 sm:px-6 selection:bg-amber-400 selection:text-slate-950">
      <div className="max-w-xl mx-auto w-full space-y-6">
        {/* Business Header Card */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-slate-800/80 border border-slate-700/80 text-slate-300 text-[11px] font-semibold">
            <Store size={13} className="text-indigo-400" />
            <span>{businessInfo.businessType || 'BUSINESS'} FEEDBACK</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            {businessInfo.name}
          </h1>

          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
            {businessInfo.reviewPromptMessage || 'How was your experience today?'}
          </p>
        </div>

        {/* Main Feedback Box */}
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          {submitted ? (
            <div className="text-center py-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 size={32} />
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-black text-white">Thank You for Your Feedback!</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                  {isPositive
                    ? 'Your positive review means the world to our team.'
                    : 'We have received your private feedback and our management will work to improve.'}
                </p>
              </div>

              {isPositive && businessInfo.publicReviewUrl && (
                <div className="pt-3">
                  <a
                    href={businessInfo.publicReviewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all shadow-lg shadow-amber-500/20 active:scale-95"
                  >
                    <span>Post on Public Google Reviews</span>
                    <ExternalLink size={14} />
                  </a>
                </div>
              )}

              <div className="pt-4 border-t border-slate-800/80">
                <span className="text-[11px] text-slate-500 flex items-center justify-center gap-1">
                  <ShieldCheck size={13} className="text-emerald-500" />
                  <span>Verified Review Powered by BizFlow</span>
                </span>
              </div>
            </div>
          ) : (
            <form onSubmit={(e) => handleSubmitReview(e, false)} className="space-y-6">
              {/* Star Rating Interactive Selector */}
              <div className="text-center space-y-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Tap to rate your visit
                </span>

                <div className="flex items-center justify-center space-x-2 sm:space-x-3 py-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 sm:p-2 rounded-2xl hover:scale-110 active:scale-95 transition-all focus:outline-none"
                    >
                      <Star
                        size={36}
                        className={`transition-colors ${
                          star <= activeStar
                            ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                            : 'text-slate-700 hover:text-slate-600'
                        }`}
                      />
                    </button>
                  ))}
                </div>

                <div className="h-5">
                  {activeStar > 0 && (
                    <span className="text-xs font-black text-amber-300 animate-in fade-in duration-150">
                      {RATING_LABELS[activeStar]}
                    </span>
                  )}
                </div>
              </div>

              {/* Dynamic Review Routing UI depending on star selection */}
              {rating > 0 && (
                <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-200">
                  {/* Positive Flow (4-5 Stars) */}
                  {isPositive ? (
                    <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-200 space-y-2">
                      <div className="flex items-center space-x-2">
                        <Sparkles size={16} className="text-amber-400 shrink-0" />
                        <span className="text-xs font-bold">Awesome! We appreciate your support.</span>
                      </div>
                      <p className="text-[11px] text-amber-200/80 leading-relaxed">
                        Sharing a quick mention on our public review page helps local customers discover us.
                      </p>
                    </div>
                  ) : (
                    /* Constructive Private Flow (1-3 Stars) */
                    <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-200 space-y-2">
                      <div className="flex items-center space-x-2">
                        <MessageSquare size={16} className="text-indigo-400 shrink-0" />
                        <span className="text-xs font-bold">We're sorry your visit was not 5-star quality.</span>
                      </div>
                      <p className="text-[11px] text-indigo-200/80 leading-relaxed">
                        Your honest feedback goes directly to management so we can fix the problem.
                      </p>
                    </div>
                  )}

                  {/* Feedback Text Area */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      {isPositive ? 'What did you enjoy the most? (Optional)' : 'How can we make things right?'}
                    </label>
                    <textarea
                      rows={3}
                      placeholder={
                        isPositive
                          ? 'Friendly staff, great atmosphere, quick service...'
                          : 'Please tell us what went wrong so we can resolve it...'
                      }
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-800/80 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400 text-xs font-medium"
                    />
                  </div>

                  {/* Optional Customer Contact Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                        Your Name (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Alex"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400 text-xs font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                        Contact Info (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="Phone or Email"
                        value={customerContact}
                        onChange={(e) => setCustomerContact(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400 text-xs font-medium"
                      />
                    </div>
                  </div>

                  {errorMessage && (
                    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center space-x-2">
                      <AlertCircle size={15} className="shrink-0 text-rose-400" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="space-y-2 pt-2">
                    {isPositive && businessInfo.publicReviewUrl ? (
                      <button
                        type="button"
                        disabled={submitting}
                        onClick={(e) => {
                          setRedirectedToExternal(true);
                          handleSubmitReview(e, true);
                        }}
                        className="w-full py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm flex items-center justify-center space-x-2 shadow-lg shadow-amber-400/20 active:scale-95 transition-all cursor-pointer"
                      >
                        <span>{submitting ? 'Submitting...' : 'Post on Google Reviews'}</span>
                        <ExternalLink size={16} />
                      </button>
                    ) : null}

                    <button
                      type="submit"
                      disabled={submitting}
                      className={`w-full py-3 rounded-2xl font-bold text-xs transition-all active:scale-95 cursor-pointer ${
                        isPositive && businessInfo.publicReviewUrl
                          ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                          : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30'
                      }`}
                    >
                      {submitting
                        ? 'Sending Feedback...'
                        : isPositive && businessInfo.publicReviewUrl
                        ? 'Submit Privately Only'
                        : 'Submit Feedback'}
                    </button>
                  </div>
                </div>
              )}
            </form>
          )}
        </div>

        {/* Footer Guarantee */}
        <div className="text-center text-slate-500 text-[11px] space-y-1">
          <p>BizFlow Review Boost • Direct Verified Feedback Channel</p>
        </div>
      </div>
    </div>
  );
};
