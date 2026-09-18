import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import {
  reviewsApi,
  Review,
  ReviewAnalytics,
  ReviewSettingsRequest,
  QrCodeResponse,
} from '../../api/reviews';
import { ButtonSpinner, SkeletonBlock } from '../../components/common/LoadingStates';
import {
  Star,
  QrCode,
  Printer,
  Download,
  Copy,
  Check,
  Settings,
  CheckCircle2,
  AlertCircle,
  X,
  ExternalLink,
} from 'lucide-react';

export const ReviewBoostDashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const { business, user } = useAuth();
  const isOwner = user?.role === 'OWNER';

  // Data States
  const [reviews, setReviews] = useState<Review[]>([]);
  const [analytics, setAnalytics] = useState<ReviewAnalytics | null>(null);
  const [qrCodeData, setQrCodeData] = useState<QrCodeResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Filters State
  const [selectedRatingFilter, setSelectedRatingFilter] = useState<string>('ALL');
  const [positiveOnlyFilter, setPositiveOnlyFilter] = useState<string>('ALL');

  // Modals
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
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
      setAnalytics(anaRes);
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

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      let cleanedUrl = settingsForm.publicReviewUrl?.trim() || '';
      if (cleanedUrl && !/^https?:\/\//i.test(cleanedUrl)) {
        cleanedUrl = `https://${cleanedUrl}`;
      }

      await reviewsApi.updateSettings({
        ...settingsForm,
        publicReviewUrl: cleanedUrl || undefined,
      });
      setSuccessMessage('Review Boost configuration updated.');
      setIsSettingsModalOpen(false);
      fetchDashboardData(page);
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

  const handleModerateReview = async (isPublic: boolean) => {
    if (!moderatingReview) return;
    try {
      await reviewsApi.moderateReview(moderatingReview.id, isPublic, moderationNotes);
      setSuccessMessage(`Review visibility updated.`);
      setModeratingReview(null);
      setModerationNotes('');
      fetchDashboardData(page);
    } catch (err: any) {
      setErrorMessage('Failed to update review moderation status.');
    }
  };

  const avgRating = analytics?.averageRating ?? 5.0;
  const totalRevCount = analytics?.totalReviews ?? 0;

  const getRatingCount = (star: number) => {
    if (Array.isArray(analytics?.ratingDistribution)) {
      const found = analytics?.ratingDistribution.find((item) => item.stars === star);
      return found?.count ?? 0;
    }
    return 0;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 tracking-tight">{t('reviews.title')}</h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            {t('reviews.subtitle')}
          </p>
        </div>

        {isOwner && (
          <button
            onClick={() => setIsSettingsModalOpen(true)}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-white hover:bg-zinc-50 text-zinc-700 font-medium text-xs border border-zinc-200 shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
          >
            <Settings size={14} />
            <span>Configure Boost</span>
          </button>
        )}
      </div>

      {/* Alerts */}
      {successMessage && (
        <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
            <span className="font-medium">{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-emerald-700 hover:text-emerald-900 cursor-pointer">
            &times;
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertCircle size={15} className="text-rose-600 shrink-0" />
            <span className="font-medium">{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-rose-700 hover:text-rose-900 cursor-pointer">
            &times;
          </button>
        </div>
      )}

      {/* TOP SECTION: Rating Score + Distribution + QR Code Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Rating Score & Star Distribution */}
        <div className="lg:col-span-2 p-5 rounded-xl bg-white border border-zinc-200 shadow-xs flex flex-col justify-between space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 pb-5 border-b border-zinc-100">
            {/* Average Rating Big Card */}
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">{t('reviews.averageRating')}</span>
              <div className="flex items-baseline space-x-3">
                <span className="text-4xl sm:text-5xl font-bold text-zinc-900">
                  {loading ? '...' : Number(avgRating).toFixed(1)}
                </span>
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={18}
                      className={
                        star <= Math.round(avgRating)
                          ? 'fill-amber-500 text-amber-500'
                          : 'text-zinc-200'
                      }
                    />
                  ))}
                </div>
              </div>
              <p className="text-xs text-zinc-500">{t('reviews.totalReviews')}: {totalRevCount}</p>
            </div>

            {/* Quick URL Cards */}
            <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 space-y-2.5 max-w-sm w-full">
              {/* BizFlow Review Boost Landing Page */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider">
                    Customer Review URL (QR Code)
                  </span>
                  {qrCodeData?.reviewUrl && (
                    <a
                      href={qrCodeData.reviewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-600 hover:text-brand-700 text-xs font-semibold flex items-center gap-0.5"
                    >
                      <span>Open</span>
                      <ExternalLink size={12} />
                    </a>
                  )}
                </div>
                <div className="flex items-center space-x-1.5">
                  <input
                    type="text"
                    readOnly
                    value={qrCodeData?.reviewUrl || ''}
                    className="w-full text-[11px] font-mono bg-white px-2.5 py-1.5 rounded-lg border border-zinc-200 text-zinc-700 truncate"
                  />
                  <button
                    onClick={() => {
                      if (qrCodeData?.reviewUrl) {
                        navigator.clipboard.writeText(qrCodeData.reviewUrl);
                        setCopiedLink(true);
                        setTimeout(() => setCopiedLink(false), 2000);
                      }
                    }}
                    className="p-1.5 rounded-lg bg-white hover:bg-zinc-100 border border-zinc-200 text-zinc-700 cursor-pointer"
                    title="Copy Customer Review Page URL"
                  >
                    {copiedLink ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>

              {/* Saved Google Review Destination Link */}
              <div className="pt-1.5 border-t border-zinc-200 flex items-center justify-between text-[11px]">
                <div className="flex items-center space-x-1.5">
                  <span className="font-semibold text-zinc-600">Google Redirect:</span>
                  {settingsForm.publicReviewUrl ? (
                    <a
                      href={settingsForm.publicReviewUrl.startsWith('http') ? settingsForm.publicReviewUrl : `https://${settingsForm.publicReviewUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-700 hover:underline truncate max-w-[150px] font-mono"
                      title={settingsForm.publicReviewUrl}
                    >
                      {settingsForm.publicReviewUrl}
                    </a>
                  ) : (
                    <span className="text-amber-600 font-medium">Auto Google Search</span>
                  )}
                </div>

                {isOwner && (
                  <button
                    onClick={() => setIsSettingsModalOpen(true)}
                    className="text-brand-600 hover:text-brand-800 font-semibold cursor-pointer text-[10px]"
                  >
                    Change
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Rating Distribution Bars */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block mb-2">
              Rating Breakdown
            </span>
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = getRatingCount(stars);
              const percent = totalRevCount > 0 ? (count / totalRevCount) * 100 : 0;

              return (
                <div key={stars} className="flex items-center space-x-3 text-xs">
                  <div className="flex items-center space-x-1 w-12 font-medium text-zinc-700">
                    <span>{stars}</span>
                    <Star size={12} className="fill-amber-500 text-amber-500" />
                  </div>

                  <div className="flex-1 h-2 rounded-full bg-zinc-100 overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full transition-all duration-300"
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  <span className="w-10 text-right font-medium text-zinc-500 text-[11px]">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* QR Code Counter Stand Display */}
        <div className="p-5 rounded-xl bg-white border border-zinc-200 shadow-xs flex flex-col justify-between items-center text-center space-y-4">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-zinc-900">Counter QR Code</h3>
            <p className="text-xs text-zinc-500">Let customers scan at billing counter</p>
          </div>

          {/* QR Code Preview Box */}
          <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200 shadow-xs flex flex-col items-center space-y-2">
            {loading ? (
              <SkeletonBlock className="w-36 h-36 rounded-lg" />
            ) : qrCodeData?.qrCodeDataUrl ? (
              <img
                src={qrCodeData.qrCodeDataUrl}
                alt="Review QR Code"
                className="w-36 h-36 rounded-lg bg-white p-2 border border-zinc-200"
              />
            ) : (
              <div className="w-36 h-36 rounded-lg bg-white border border-zinc-200 flex items-center justify-center">
                <QrCode size={48} className="text-zinc-300" />
              </div>
            )}
            <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider">
              {business?.name || 'Review Us'}
            </span>
          </div>

          {/* Download / Print Actions */}
          <div className="grid grid-cols-2 gap-2 w-full pt-1">
            {qrCodeData?.qrCodeDataUrl && (
              <a
                href={qrCodeData.qrCodeDataUrl}
                download={`review-qr-${business?.name || 'bizflow'}.png`}
                className="py-2 px-3 rounded-lg bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-700 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
              >
                <Download size={14} />
                <span>Download</span>
              </a>
            )}

            <button
              onClick={() => window.print()}
              className="py-2 px-3 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-medium flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Printer size={14} />
              <span>Print Stand</span>
            </button>
          </div>
        </div>
      </div>

      {/* RECENT FEEDBACK & REVIEWS LIST */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-xs overflow-hidden space-y-4">
        {/* Table Header Controls */}
        <div className="p-4 sm:p-5 border-b border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-zinc-900">Customer Feedback &amp; Ratings</h3>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedRatingFilter}
              onChange={(e) => setSelectedRatingFilter(e.target.value)}
              className="px-3 py-1.5 bg-white border border-zinc-200 rounded-lg text-xs font-medium text-zinc-700 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20"
            >
              <option value="ALL">All Star Ratings</option>
              <option value="5">5 Stars Only</option>
              <option value="4">4 Stars Only</option>
              <option value="3">3 Stars Only</option>
              <option value="2">2 Stars Only</option>
              <option value="1">1 Star Only</option>
            </select>

            <select
              value={positiveOnlyFilter}
              onChange={(e) => setPositiveOnlyFilter(e.target.value)}
              className="px-3 py-1.5 bg-white border border-zinc-200 rounded-lg text-xs font-medium text-zinc-700 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20"
            >
              <option value="ALL">All Feedback</option>
              <option value="POSITIVE">High Ratings (4-5★)</option>
              <option value="PRIVATE">Private Concerns (&lt;4★)</option>
            </select>
          </div>
        </div>

        {/* Reviews List */}
        <div className="divide-y divide-zinc-100">
          {loading ? (
            <div className="p-5 space-y-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="flex items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <SkeletonBlock className="h-4 w-24" />
                      <SkeletonBlock className="h-4 w-32" />
                    </div>
                    <SkeletonBlock className="h-12 w-full rounded-lg" />
                  </div>
                  <SkeletonBlock className="h-8 w-20 rounded-lg" />
                </div>
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <div className="py-12 text-center text-zinc-500 space-y-1">
              <Star size={32} className="mx-auto text-zinc-300" />
              <p className="font-semibold text-zinc-700 text-xs">No customer reviews yet</p>
              <p className="text-xs text-zinc-400">Share your QR code to start collecting ratings.</p>
            </div>
          ) : (
            reviews.map((rev) => (
              <div key={rev.id} className="p-4 sm:p-5 hover:bg-zinc-50/70 transition-colors flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center space-x-2.5">
                    <div className="flex items-center space-x-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          size={14}
                          className={
                            s <= rev.rating
                              ? 'fill-amber-500 text-amber-500'
                              : 'text-zinc-200'
                          }
                        />
                      ))}
                    </div>

                    <span className="text-xs font-semibold text-zinc-900">
                      {rev.customerName || 'Anonymous Customer'}
                    </span>

                    <span className="text-[11px] text-zinc-400">
                      • {new Date(rev.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                    </span>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[9px] font-medium ${
                        rev.positive
                          ? 'bg-brand-50 text-brand-700 border border-brand-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {rev.positive ? '5-Star Boosted' : 'Private Feedback'}
                    </span>
                  </div>

                  {rev.feedbackText && (
                    <p className="text-xs text-zinc-700 leading-relaxed font-normal bg-zinc-50 p-3 rounded-lg border border-zinc-100">
                      "{rev.feedbackText}"
                    </p>
                  )}

                  {rev.customerContact && (
                    <span className="text-[10px] text-zinc-500 font-mono block">
                      Contact: {rev.customerContact}
                    </span>
                  )}
                </div>

                {isOwner && (
                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      onClick={() => setModeratingReview(rev)}
                      className="px-3 py-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-100 text-zinc-700 text-xs font-medium cursor-pointer"
                    >
                      Moderate
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="p-3.5 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500">
            <span>
              Showing page {page + 1} of {totalPages}
            </span>
            <div className="flex items-center space-x-1.5">
              <button
                disabled={page <= 0}
                onClick={() => fetchDashboardData(page - 1)}
                className="px-3 py-1 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 font-medium disabled:opacity-50 cursor-pointer"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages - 1}
                onClick={() => fetchDashboardData(page + 1)}
                className="px-3 py-1 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 font-medium disabled:opacity-50 cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Configure Settings Modal */}
      {isSettingsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-5 shadow-lg space-y-4 border border-zinc-200">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-700 flex items-center justify-center font-bold">
                  <Settings size={15} />
                </div>
                <h3 className="text-sm font-semibold text-zinc-900">Review Boost Settings</h3>
              </div>
              <button
                onClick={() => setIsSettingsModalOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-700">Custom Review URL Slug</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. apex-retail"
                  value={settingsForm.reviewSlug}
                  onChange={(e) => setSettingsForm({ ...settingsForm, reviewSlug: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-zinc-700">Google Review Page URL</label>
                  {settingsForm.publicReviewUrl && (
                    <a
                      href={settingsForm.publicReviewUrl.startsWith('http') ? settingsForm.publicReviewUrl : `https://${settingsForm.publicReviewUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-semibold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1"
                    >
                      <span>Test Link</span>
                      <ExternalLink size={11} />
                    </a>
                  )}
                </div>
                <input
                  type="text"
                  placeholder="https://g.page/r/.../review or maps.app.goo.gl/..."
                  value={settingsForm.publicReviewUrl || ''}
                  onChange={(e) => setSettingsForm({ ...settingsForm, publicReviewUrl: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
                <p className="text-[10px] text-zinc-400">
                  Direct Google Maps / Google Review link. If left blank, customers giving 4-5 stars are automatically directed to Google search for your business reviews.
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-700">Welcome Prompt Message</label>
                <input
                  type="text"
                  placeholder="How was your experience with us today?"
                  value={settingsForm.reviewPromptMessage || ''}
                  onChange={(e) => setSettingsForm({ ...settingsForm, reviewPromptMessage: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>

              <label className="flex items-center space-x-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={settingsForm.reviewEnabled}
                  onChange={(e) => setSettingsForm({ ...settingsForm, reviewEnabled: e.target.checked })}
                  className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
                />
                <span className="text-xs font-medium text-zinc-800">Enable Review Boost Landing Page</span>
              </label>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setIsSettingsModalOpen(false)}
                  className="px-4 py-2 border border-zinc-200 text-zinc-700 text-xs font-medium rounded-lg hover:bg-zinc-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={settingsSubmitting}
                  className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-medium rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {settingsSubmitting ? (
                    <ButtonSpinner text="Saving..." spinnerColor="text-white" />
                  ) : (
                    'Save Settings'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Moderation Modal */}
      {moderatingReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-5 shadow-lg space-y-4 border border-zinc-200">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <h3 className="text-sm font-semibold text-zinc-900">Moderate Customer Review</h3>
              <button
                onClick={() => setModeratingReview(null)}
                className="p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-100 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200 text-xs space-y-1">
              <div className="font-semibold text-zinc-900">{moderatingReview.customerName || 'Anonymous'}</div>
              <p className="text-zinc-600 italic">"{moderatingReview.feedbackText}"</p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-700">Internal Manager Notes</label>
              <input
                type="text"
                placeholder="e.g. Addressed customer request with discount coupon"
                value={moderationNotes}
                onChange={(e) => setModerationNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-zinc-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>

            <div className="flex justify-between pt-2">
              <button
                type="button"
                onClick={() => handleModerateReview(false)}
                className="px-3.5 py-2 border border-zinc-200 text-zinc-700 hover:bg-zinc-50 rounded-lg text-xs font-medium cursor-pointer"
              >
                Keep Private
              </button>
              <button
                type="button"
                onClick={() => handleModerateReview(true)}
                className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-medium shadow-xs cursor-pointer"
              >
                Make Public
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
