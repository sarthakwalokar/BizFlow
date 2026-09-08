import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  reviewsApi,
  Review,
  ReviewAnalytics,
  ReviewSettings,
  ReviewSettingsRequest,
  QrCodeResponse,
} from '../../api/reviews';
import {
  Star,
  Sparkles,
  QrCode,
  Printer,
  Download,
  Copy,
  Check,
  Settings,
  Search,
  CheckCircle2,
  AlertCircle,
  X,
  ExternalLink,
  Eye,
  EyeOff,
} from 'lucide-react';

export const ReviewBoostDashboardPage: React.FC = () => {
  const { business, user } = useAuth();
  const isOwner = user?.role === 'OWNER';

  // Data States
  const [reviews, setReviews] = useState<Review[]>([]);
  const [analytics, setAnalytics] = useState<ReviewAnalytics | null>(null);
  const [settings, setSettings] = useState<ReviewSettings | null>(null);
  const [qrCodeData, setQrCodeData] = useState<QrCodeResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalElements, setTotalElements] = useState<number>(0);

  // Filters State
  const [search, setSearch] = useState<string>('');
  const [selectedRatingFilter, setSelectedRatingFilter] = useState<string>('ALL');
  const [positiveOnlyFilter, setPositiveOnlyFilter] = useState<string>('ALL');

  // Modals
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [moderatingReview, setModeratingReview] = useState<Review | null>(null);
  const [moderationNotes, setModerationNotes] = useState('');

  // Settings Form State
  const [settingsForm, setSettingsForm] = useState<ReviewSettingsRequest>({
    reviewSlug: '',
    publicReviewUrl: '',
    reviewPromptMessage: '',
    reviewEnabled: true,
  });
  const [settingsSubmitting, setSettingsSubmitting] = useState(false);

  // Feedback notifications
  const [copiedLink, setCopiedLink] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchDashboardData = async (pageNumber = 0) => {
    try {
      setLoading(true);
      const [revRes, anaRes, setRes, qrRes] = await Promise.all([
        reviewsApi.getReviews({
          search: search.trim() || undefined,
          rating: selectedRatingFilter !== 'ALL' ? parseInt(selectedRatingFilter) : undefined,
          isPositive: positiveOnlyFilter === 'POSITIVE' ? true : positiveOnlyFilter === 'PRIVATE' ? false : undefined,
          page: pageNumber,
          size: 15,
        }),
        reviewsApi.getAnalytics(),
        reviewsApi.getSettings(),
        reviewsApi.getQrCode(),
      ]);

      setReviews(revRes.content);
      setPage(revRes.pageNumber);
      setTotalPages(revRes.totalPages);
      setTotalElements(revRes.totalElements);
      setAnalytics(anaRes);
      setSettings(setRes);
      setQrCodeData(qrRes);

      setSettingsForm({
        reviewSlug: setRes.reviewSlug,
        publicReviewUrl: setRes.publicReviewUrl || '',
        reviewPromptMessage: setRes.reviewPromptMessage || '',
        reviewEnabled: setRes.reviewEnabled,
      });
    } catch (err: any) {
      setErrorMessage('Failed to load Review Boost dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData(0);
  }, [selectedRatingFilter, positiveOnlyFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDashboardData(0);
  };

  const handleCopyReviewLink = () => {
    if (!settings?.directReviewPageUrl) return;
    navigator.clipboard.writeText(settings.directReviewPageUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleDownloadQrPng = () => {
    if (!qrCodeData?.qrCodeDataUrl) return;
    const link = document.createElement('a');
    link.href = qrCodeData.qrCodeDataUrl;
    link.download = `${settings?.reviewSlug || 'bizflow'}-review-qr.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsSubmitting(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const updated = await reviewsApi.updateSettings(settingsForm);
      setSettings(updated);
      setIsSettingsModalOpen(false);
      setSuccessMessage('Review Boost configuration updated.');
      // Refresh QR code
      const updatedQr = await reviewsApi.getQrCode();
      setQrCodeData(updatedQr);
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        'Failed to update review settings.'
      );
    } finally {
      setSettingsSubmitting(false);
    }
  };

  const handleToggleModerate = async () => {
    if (!moderatingReview) return;
    try {
      await reviewsApi.moderateReview(
        moderatingReview.id,
        !moderatingReview.hidden,
        moderationNotes.trim() || undefined
      );
      setSuccessMessage(
        `Review #${moderatingReview.id} is now ${!moderatingReview.hidden ? 'hidden' : 'visible'}.`
      );
      setModeratingReview(null);
      setModerationNotes('');
      fetchDashboardData(page);
    } catch (err: any) {
      setErrorMessage('Failed to update review moderation status.');
    }
  };

  const handlePrintStandee = () => {
    window.print();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-3 py-0.5 rounded-full bg-amber-500/10 text-amber-700 text-xs font-bold border border-amber-500/20 flex items-center gap-1.5">
              <Sparkles size={13} className="text-amber-500" />
              <span>Reputation Engine</span>
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">Review Boost</h1>
          <p className="text-slate-500 text-sm">
            Collect real customer reviews, generate counter QR standees, route 5-star praise to Google, and protect reputation with private feedback.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Copy Review Link */}
          <button
            onClick={handleCopyReviewLink}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs shadow-xs transition-all cursor-pointer"
          >
            {copiedLink ? (
              <>
                <Check size={14} className="text-emerald-600" />
                <span className="text-emerald-600">Link Copied!</span>
              </>
            ) : (
              <>
                <Copy size={14} className="text-slate-500" />
                <span>Copy Review Link</span>
              </>
            )}
          </button>

          {/* Standee Print */}
          <button
            onClick={() => setIsPrintModalOpen(true)}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs shadow-xs transition-all cursor-pointer"
          >
            <Printer size={14} className="text-indigo-600" />
            <span>Print Counter Standee</span>
          </button>

          {/* Settings (Owner only) */}
          {isOwner && (
            <button
              onClick={() => setIsSettingsModalOpen(true)}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              <Settings size={14} />
              <span>Configure Settings</span>
            </button>
          )}
        </div>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center space-x-3 text-emerald-800 text-sm font-semibold">
          <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center space-x-3 text-rose-800 text-sm font-semibold">
          <AlertCircle size={18} className="text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Hero Analytics & QR Code Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: KPI Cards (2 Columns on large) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Average Rating Card */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Average Rating</span>
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-black text-slate-900">
                  {loading ? '...' : (analytics?.averageRating ?? 0).toFixed(1)}
                </span>
                <span className="text-xs text-slate-400 font-semibold">/ 5.0</span>
              </div>
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={14}
                    className={`${
                      star <= Math.round(analytics?.averageRating ?? 0)
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-slate-200 fill-slate-100'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Total Reviews Card */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Reviews</span>
              <div className="text-3xl font-black text-slate-900 mt-2">
                {loading ? '...' : analytics?.totalReviews ?? 0}
              </div>
              <span className="text-[11px] text-slate-400 font-medium">Customer responses</span>
            </div>

            {/* Positive Feedback % Card */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Positive (4-5★)</span>
              <div className="text-3xl font-black text-emerald-700 mt-2">
                {loading ? '...' : `${(analytics?.positivePercentage ?? 0).toFixed(1)}%`}
              </div>
              <span className="text-[11px] text-emerald-600 font-medium">
                {analytics?.positiveReviewsCount ?? 0} happy clients
              </span>
            </div>

            {/* Public Platform Redirects Card */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Google Boosts</span>
              <div className="text-3xl font-black text-indigo-700 mt-2">
                {loading ? '...' : analytics?.publicPlatformRedirectsCount ?? 0}
              </div>
              <span className="text-[11px] text-indigo-600 font-medium">Routed to public site</span>
            </div>
          </div>

          {/* Rating Distribution Breakdown */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Star size={16} className="text-amber-500 fill-amber-500" />
                <span>Rating Distribution Breakdown</span>
              </h3>
              <span className="text-xs font-semibold text-slate-400">
                {analytics?.totalReviews ?? 0} total verified reviews
              </span>
            </div>

            <div className="space-y-2.5">
              {(analytics?.ratingDistribution ?? []).map((item) => (
                <div key={item.stars} className="flex items-center space-x-3 text-xs">
                  <div className="flex items-center space-x-1 w-12 shrink-0">
                    <span className="font-bold text-slate-700">{item.stars}</span>
                    <Star size={12} className="text-amber-400 fill-amber-400" />
                  </div>

                  {/* Progress bar */}
                  <div className="flex-1 h-3 rounded-full bg-slate-100 overflow-hidden relative">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        item.stars >= 4
                          ? 'bg-amber-400'
                          : item.stars === 3
                          ? 'bg-indigo-400'
                          : 'bg-rose-400'
                      }`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>

                  <div className="w-20 text-right text-[11px] font-semibold text-slate-500">
                    <span>{item.count}</span>
                    <span className="text-slate-400 ml-1">({item.percentage.toFixed(0)}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: QR Code & Review Hub Card */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between space-y-6">
          <div className="space-y-4 text-center">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
              <QrCode size={13} />
              <span>Counter Review QR</span>
            </div>

            <h3 className="text-base font-black text-slate-900">
              Scan to Review {business?.name}
            </h3>

            {/* QR Code Frame */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 inline-block shadow-inner">
              {qrCodeData?.qrCodeDataUrl ? (
                <img
                  src={qrCodeData.qrCodeDataUrl}
                  alt="Review QR Code"
                  className="w-44 h-44 mx-auto rounded-xl shadow-xs"
                />
              ) : (
                <div className="w-44 h-44 flex items-center justify-center text-slate-400 text-xs">
                  Loading QR Code...
                </div>
              )}
            </div>

            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Place this QR code on checkout counters, restaurant tables, salon mirrors, or delivery bags.
            </p>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            <button
              onClick={handleDownloadQrPng}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer"
            >
              <Download size={14} />
              <span>Download QR Code (PNG)</span>
            </button>

            <button
              onClick={() => setIsPrintModalOpen(true)}
              className="w-full py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer"
            >
              <Printer size={14} />
              <span>Print Table Standee</span>
            </button>

            {settings?.directReviewPageUrl && (
              <a
                href={settings.directReviewPageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center justify-center gap-1 pt-1"
              >
                <span>Test Public Review Page</span>
                <ExternalLink size={12} />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Reviews Register & Filter Section */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-xs space-y-6">
        {/* Filter and Search Toolbar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
            <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search reviewer, text, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-medium"
            />
          </form>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            {/* Rating Filter Dropdown */}
            <select
              value={selectedRatingFilter}
              onChange={(e) => setSelectedRatingFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="ALL">All Star Ratings</option>
              <option value="5">5 Stars Only</option>
              <option value="4">4 Stars Only</option>
              <option value="3">3 Stars Only</option>
              <option value="2">2 Stars Only</option>
              <option value="1">1 Star Only</option>
            </select>

            {/* Positive vs Private feedback filter */}
            <select
              value={positiveOnlyFilter}
              onChange={(e) => setPositiveOnlyFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="ALL">All Feedback Types</option>
              <option value="POSITIVE">Positive Praise (4-5★)</option>
              <option value="PRIVATE">Private Constructive (1-3★)</option>
            </select>
          </div>
        </div>

        {/* Reviews List Cards */}
        <div className="space-y-3">
          {loading ? (
            <div className="p-12 text-center text-slate-400 text-xs font-medium">
              Loading reviews...
            </div>
          ) : reviews.length === 0 ? (
            <div className="p-12 text-center text-slate-500 space-y-2">
              <Star size={32} className="mx-auto text-slate-300" />
              <p className="font-bold text-slate-700">No customer reviews yet</p>
              <p className="text-[11px] text-slate-400">
                Share your review link or print the QR code counter standee to begin receiving customer reviews.
              </p>
            </div>
          ) : (
            reviews.map((rev) => (
              <div
                key={rev.id}
                className={`p-5 rounded-2xl border transition-all ${
                  rev.hidden
                    ? 'bg-slate-50/60 border-slate-200 opacity-60'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center space-x-3">
                      {/* Star Rating Badge */}
                      <div className="flex items-center space-x-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            size={14}
                            className={`${
                              s <= rev.rating
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-slate-200 fill-slate-100'
                            }`}
                          />
                        ))}
                      </div>

                      <span className="text-xs font-extrabold text-slate-900">
                        {rev.customerName || 'Anonymous Customer'}
                      </span>

                      {/* Tag: Positive vs Private Feedback */}
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          rev.positive
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {rev.positive ? 'Public Praise' : 'Private Improvement'}
                      </span>

                      {rev.redirectedToPublicPlatform && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1">
                          <ExternalLink size={10} />
                          <span>Google Shared</span>
                        </span>
                      )}

                      {rev.hidden && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          Hidden
                        </span>
                      )}
                    </div>

                    {/* Feedback Content */}
                    <p className="text-xs text-slate-700 leading-relaxed font-medium">
                      {rev.feedbackText || <span className="text-slate-400 italic">No written comment provided.</span>}
                    </p>

                    {/* Contact information if submitted */}
                    {rev.customerContact && (
                      <div className="text-[11px] text-slate-500 font-medium">
                        Contact: <span className="text-slate-800">{rev.customerContact}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 shrink-0 sm:self-start">
                    <span className="text-[11px] text-slate-400">
                      {new Date(rev.createdAt).toLocaleDateString()}
                    </span>

                    {/* Moderate / Hide action */}
                    {isOwner && (
                      <button
                        onClick={() => {
                          setModeratingReview(rev);
                          setModerationNotes(rev.moderationNotes || '');
                        }}
                        title={rev.hidden ? 'Restore Review' : 'Hide from Public'}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                      >
                        {rev.hidden ? <Eye size={15} /> : <EyeOff size={15} />}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs">
            <span className="text-slate-400">
              Page {page + 1} of {totalPages} ({totalElements} total reviews)
            </span>
            <div className="flex space-x-2">
              <button
                disabled={page === 0}
                onClick={() => fetchDashboardData(page - 1)}
                className="px-3 py-1 rounded-lg border border-slate-200 font-semibold disabled:opacity-40 hover:bg-slate-50"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages - 1}
                onClick={() => fetchDashboardData(page + 1)}
                className="px-3 py-1 rounded-lg border border-slate-200 font-semibold disabled:opacity-40 hover:bg-slate-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Review Settings Modal (Owner Only) */}
      {isSettingsModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 p-6 md:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="text-lg font-black text-slate-900">Review Boost Configuration</h2>
              <button
                onClick={() => setIsSettingsModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Custom Review Slug <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center rounded-xl border border-slate-200 overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500">
                  <span className="px-3 py-2 bg-slate-50 text-slate-400 text-xs font-mono border-r border-slate-200">
                    /review/
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="my-business-slug"
                    value={settingsForm.reviewSlug || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, reviewSlug: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Unique public web address for your review portal.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Public Review Platform URL (Google, Yelp, TripAdvisor)
                </label>
                <input
                  type="url"
                  placeholder="https://g.page/r/your-google-review-link/review"
                  value={settingsForm.publicReviewUrl || ''}
                  onChange={(e) => setSettingsForm({ ...settingsForm, publicReviewUrl: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-medium"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  When customers rate 4 or 5 stars, they will be given a button to post directly on this public link.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Review Prompt Message
                </label>
                <textarea
                  rows={2}
                  placeholder="Thank you for choosing us! How was your experience today?"
                  value={settingsForm.reviewPromptMessage || ''}
                  onChange={(e) => setSettingsForm({ ...settingsForm, reviewPromptMessage: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-medium"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Enable Public Review Page</span>
                  <span className="text-[10px] text-slate-400">
                    Allow customers to access review page and submit feedback
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={settingsForm.reviewEnabled ?? true}
                  onChange={(e) => setSettingsForm({ ...settingsForm, reviewEnabled: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsSettingsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={settingsSubmitting}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-100 disabled:opacity-50"
                >
                  {settingsSubmitting ? 'Saving...' : 'Save Configuration'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Moderation Confirmation Modal */}
      {moderatingReview && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 p-6 space-y-4">
            <h3 className="text-base font-black text-slate-900">
              {moderatingReview.hidden ? 'Restore Review to Public' : 'Hide Review Entry'}
            </h3>
            <p className="text-xs text-slate-500">
              {moderatingReview.hidden
                ? 'This review will be restored and factored back into average rating statistics.'
                : 'Hidden reviews will not appear in public rating calculations. You can attach an internal note below.'}
            </p>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Moderation Note (Optional)
              </label>
              <input
                type="text"
                placeholder="Reason for hiding/moderating..."
                value={moderationNotes}
                onChange={(e) => setModerationNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={() => setModeratingReview(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleToggleModerate}
                className={`px-5 py-2 rounded-xl font-bold text-xs text-white ${
                  moderatingReview.hidden ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {moderatingReview.hidden ? 'Restore Review' : 'Hide Review'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Printable Counter Standee Modal */}
      {isPrintModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 p-8 space-y-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 print:hidden">
              <div>
                <h2 className="text-base font-black text-slate-900">Print Counter Standee / Card</h2>
                <p className="text-xs text-slate-400">Ready for table tents, counters, and packaging</p>
              </div>
              <button
                onClick={() => setIsPrintModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            {/* Standee Preview Card (Printable) */}
            <div
              id="printable-standee"
              className="border-2 border-dashed border-slate-300 rounded-3xl p-8 text-center space-y-4 bg-gradient-to-b from-slate-50 to-white print:border-none print:shadow-none"
            >
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  {business?.businessType || 'BUSINESS'}
                </span>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  {business?.name}
                </h2>
              </div>

              <div className="flex items-center justify-center space-x-1 py-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={18} className="text-amber-400 fill-amber-400" />
                ))}
              </div>

              <p className="text-xs font-medium text-slate-600 max-w-xs mx-auto">
                {settings?.reviewPromptMessage || 'How was your experience today? Scan the QR code to leave us a review!'}
              </p>

              {/* QR Image */}
              <div className="p-4 bg-white rounded-2xl border border-slate-200 inline-block shadow-md">
                {qrCodeData?.qrCodeDataUrl ? (
                  <img
                    src={qrCodeData.qrCodeDataUrl}
                    alt="Scan to Review"
                    className="w-48 h-48 mx-auto"
                  />
                ) : null}
              </div>

              <div className="space-y-1 pt-2">
                <span className="text-xs font-black text-slate-800 tracking-tight block">
                  Scan with your Phone Camera
                </span>
                <span className="text-[10px] font-mono text-slate-400 block">
                  {settings?.directReviewPageUrl}
                </span>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-2 print:hidden">
              <button
                onClick={() => setIsPrintModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs"
              >
                Close
              </button>
              <button
                onClick={handlePrintStandee}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md"
              >
                <Printer size={14} />
                <span>Print Standee Now</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
