import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { formatCurrency } from '../../../utils/currency';
import {
  educationApi,
  EduCourse,
  EduBatch,
} from '../../../api/modules';
import {
  BookOpen,
  Plus,
  Users,
  Calendar,
  Clock,
  Trash2,
  Edit2,
  X,
  Search,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const EduCoursesBatchesPage: React.FC = () => {
  const { business } = useAuth();
  const currency = business?.currency || 'INR';

  const [courses, setCourses] = useState<EduCourse[]>([]);
  const [batches, setBatches] = useState<EduBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'COURSES' | 'BATCHES'>('COURSES');
  const [search, setSearch] = useState('');

  // Course Modal (Add / Edit)
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<EduCourse | null>(null);
  const [courseName, setCourseName] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [duration, setDuration] = useState('6 Months');
  const [totalFees, setTotalFees] = useState<number | ''>('');
  const [courseDesc, setCourseDesc] = useState('');

  // Batch Modal (Add / Edit)
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [editingBatch, setEditingBatch] = useState<EduBatch | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<number | ''>('');
  const [batchName, setBatchName] = useState('');
  const [schedule, setSchedule] = useState('Mon-Fri 09:00 AM - 11:00 AM');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [capacity, setCapacity] = useState(30);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [cData, bData] = await Promise.all([
        educationApi.getCourses(),
        educationApi.getBatches(),
      ]);
      setCourses(cData);
      setBatches(bData);
    } catch (err) {
      console.error('Failed to load courses and batches', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // Course handlers
  const handleOpenCourseModal = (c?: EduCourse) => {
    if (c) {
      setEditingCourse(c);
      setCourseName(c.name);
      setCourseCode(c.code || '');
      setDuration(c.duration || '6 Months');
      setTotalFees(c.totalFees ?? '');
      setCourseDesc(c.description || '');
    } else {
      setEditingCourse(null);
      setCourseName('');
      setCourseCode('');
      setDuration('6 Months');
      setTotalFees('');
      setCourseDesc('');
    }
    setShowCourseModal(true);
  };

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseName.trim()) return;

    try {
      if (editingCourse) {
        await educationApi.updateCourse(editingCourse.id, {
          name: courseName.trim(),
          code: courseCode.trim() || undefined,
          duration: duration.trim(),
          totalFees: Number(totalFees) || 0,
          description: courseDesc.trim() || undefined,
        });
      } else {
        await educationApi.createCourse({
          name: courseName.trim(),
          code: courseCode.trim() || undefined,
          duration: duration.trim(),
          totalFees: Number(totalFees) || 0,
          description: courseDesc.trim() || undefined,
        });
      }

      setShowCourseModal(false);
      fetchAll();
    } catch (err) {
      console.error('Failed to save course', err);
    }
  };

  const handleDeleteCourse = async (id: number) => {
    if (!window.confirm('Delete this course curriculum and its configurations?')) return;
    try {
      await educationApi.deleteCourse(id);
      fetchAll();
    } catch (err) {
      console.error('Failed to delete course', err);
    }
  };

  // Batch handlers
  const handleOpenBatchModal = (b?: EduBatch, defaultCourseId?: number) => {
    if (b) {
      setEditingBatch(b);
      setSelectedCourseId(b.courseId);
      setBatchName(b.batchName);
      setSchedule(b.schedule || 'Mon-Fri 09:00 AM - 11:00 AM');
      setStartDate(b.startDate || new Date().toISOString().split('T')[0]);
      setEndDate(b.endDate || '');
      setCapacity(b.capacity || 30);
    } else {
      setEditingBatch(null);
      setSelectedCourseId(defaultCourseId || (courses.length > 0 ? courses[0].id : ''));
      setBatchName('');
      setSchedule('Mon-Fri 09:00 AM - 11:00 AM');
      setStartDate(new Date().toISOString().split('T')[0]);
      setEndDate(
        new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      );
      setCapacity(30);
    }
    setShowBatchModal(true);
  };

  const handleSaveBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchName.trim() || !selectedCourseId) return;

    try {
      if (editingBatch) {
        await educationApi.updateBatch(editingBatch.id, {
          courseId: Number(selectedCourseId),
          batchName: batchName.trim(),
          schedule: schedule.trim(),
          startDate,
          endDate: endDate || undefined,
          capacity: Number(capacity),
        });
      } else {
        await educationApi.createBatch({
          courseId: Number(selectedCourseId),
          batchName: batchName.trim(),
          schedule: schedule.trim(),
          startDate,
          endDate: endDate || undefined,
          capacity: Number(capacity),
        });
      }

      setShowBatchModal(false);
      fetchAll();
    } catch (err) {
      console.error('Failed to save batch', err);
    }
  };

  const handleDeleteBatch = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this batch?')) return;
    try {
      await educationApi.deleteBatch(id);
      fetchAll();
    } catch (err) {
      console.error('Failed to delete batch', err);
    }
  };

  const filteredCourses = courses.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.code && c.code.toLowerCase().includes(search.toLowerCase()))
  );

  const filteredBatches = batches.filter((b) =>
    b.batchName.toLowerCase().includes(search.toLowerCase()) ||
    (b.courseName && b.courseName.toLowerCase().includes(search.toLowerCase())) ||
    (b.schedule && b.schedule.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Courses &amp; Batches
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-800 text-xs font-bold border border-indigo-200 flex items-center gap-1.5">
              <BookOpen size={13} className="text-indigo-600" />
              <span>Coaching Curriculum</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Create courses, standard tuition fee packages, and schedule student classroom batches.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => handleOpenCourseModal()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            <Plus size={14} />
            <span>Create Course</span>
          </button>

          <button
            onClick={() => handleOpenBatchModal()}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            <Plus size={15} />
            <span>Schedule New Batch</span>
          </button>
        </div>
      </div>

      {/* Tabs & Search Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('COURSES')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'COURSES'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Courses Catalog ({courses.length})
          </button>
          <button
            onClick={() => setActiveTab('BATCHES')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'BATCHES'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Batches &amp; Timetable ({batches.length})
          </button>
        </div>

        <div className="relative max-w-xs w-full">
          <Search size={14} className="absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder={activeTab === 'COURSES' ? 'Search courses...' : 'Search batches...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
      </div>

      {/* TAB 1: COURSES */}
      {activeTab === 'COURSES' && (
        <div>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-44 rounded-2xl bg-slate-100 animate-pulse" />
              ))}
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="clay-card p-12 text-center text-slate-400 space-y-2">
              <BookOpen size={32} className="mx-auto text-slate-300" />
              <p className="font-bold text-slate-800 text-sm">No courses found</p>
              <p className="text-xs text-slate-400">Click "Create Course" to add tuition or training course modules.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCourses.map((c) => {
                const courseBatches = batches.filter((b) => b.courseId === c.id);

                return (
                  <div key={c.id} className="clay-card p-5 space-y-3 flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                          {c.code || 'COURSE'}
                        </span>
                        <span className="text-xs text-slate-500 font-semibold">{c.duration}</span>
                      </div>

                      <div>
                        <h3 className="text-base font-bold text-slate-900 leading-snug">{c.name}</h3>
                        {c.description ? (
                          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mt-1">{c.description}</p>
                        ) : (
                          <p className="text-xs text-slate-400 italic mt-1">Standard Coaching Program</p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-500 font-medium">
                        <Calendar size={12} className="text-slate-400" />
                        <span>{courseBatches.length} active {courseBatches.length === 1 ? 'batch' : 'batches'}</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase font-bold">Standard Fee</span>
                        <span className="text-lg font-black text-slate-950">
                          {formatCurrency(c.totalFees, currency)}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenBatchModal(undefined, c.id)}
                          className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10px] font-bold border border-indigo-200 transition-colors"
                          title="Create Batch for this Course"
                        >
                          + Batch
                        </button>
                        <button
                          onClick={() => handleOpenCourseModal(c)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 cursor-pointer"
                          title="Edit Course"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => handleDeleteCourse(c.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                          title="Delete Course"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: BATCHES */}
      {activeTab === 'BATCHES' && (
        <div>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-44 rounded-2xl bg-slate-100 animate-pulse" />
              ))}
            </div>
          ) : filteredBatches.length === 0 ? (
            <div className="clay-card p-12 text-center text-slate-400 space-y-2">
              <Calendar size={32} className="mx-auto text-slate-300" />
              <p className="font-bold text-slate-800 text-sm">No batches found</p>
              <p className="text-xs text-slate-400">Click "Schedule New Batch" to allocate classrooms and student quotas.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredBatches.map((b) => {
                const enrolled = b.enrolledCount || 0;
                const cap = b.capacity || 30;
                const pct = Math.min(Math.round((enrolled / cap) * 100), 100);

                return (
                  <div key={b.id} className="clay-card p-5 space-y-3 flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          {b.courseName || 'Course'}
                        </span>
                        <span className="text-xs font-mono font-bold text-slate-600 flex items-center gap-1">
                          <Users size={12} className="text-slate-400" />
                          <span>{enrolled} / {cap} Seats</span>
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 leading-snug">{b.batchName}</h3>

                      <div className="text-xs text-slate-600 font-medium flex items-center gap-1.5">
                        <Clock size={12} className="text-indigo-600 shrink-0" />
                        <span className="truncate">{b.schedule}</span>
                      </div>

                      {/* Progress bar */}
                      <div className="space-y-1 pt-1">
                        <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
                          <span>Occupancy</span>
                          <span className="font-bold font-mono text-slate-700">{pct}%</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              pct >= 90
                                ? 'bg-rose-500'
                                : pct >= 60
                                ? 'bg-amber-500'
                                : 'bg-indigo-600'
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div className="text-[10px] text-slate-500 font-mono">
                        <div>Start: {b.startDate || 'Immediate'}</div>
                        {b.endDate && <div>End: {b.endDate}</div>}
                      </div>

                      <div className="flex items-center gap-1">
                        <Link
                          to="/dashboard/education/students"
                          className="px-2 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10px] font-bold border border-indigo-200 transition-colors"
                          title="View Students"
                        >
                          Students
                        </Link>
                        <button
                          onClick={() => handleOpenBatchModal(b)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 cursor-pointer"
                          title="Edit Batch"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => handleDeleteBatch(b.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                          title="Delete Batch"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* CREATE / EDIT COURSE MODAL */}
      {showCourseModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                {editingCourse ? 'Edit Course Curriculum' : 'Create Coaching Course'}
              </h3>
              <button
                onClick={() => setShowCourseModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveCourse} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Course Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Class 10th Math & Science Intensive"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Course Code</label>
                  <input
                    type="text"
                    placeholder="e.g. MTH-10"
                    value={courseCode}
                    onChange={(e) => setCourseCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Duration</label>
                  <input
                    type="text"
                    placeholder="e.g. 6 Months, 1 Year"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Total Course Fee ({currency}) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="e.g. 25000.00"
                  value={totalFees}
                  onChange={(e) => setTotalFees(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-black text-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Syllabus &amp; Overview (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="Curriculum overview, topics covered..."
                  value={courseDesc}
                  onChange={(e) => setCourseDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCourseModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer shadow-xs"
                >
                  {editingCourse ? 'Save Changes' : 'Create Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE / EDIT BATCH MODAL */}
      {showBatchModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                {editingBatch ? 'Edit Batch Timetable' : 'Schedule Batch Cohort'}
              </h3>
              <button
                onClick={() => setShowBatchModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveBatch} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Select Course *</label>
                <select
                  required
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                >
                  <option value="">-- Choose Course --</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({formatCurrency(c.totalFees, currency)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Batch Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Morning Batch A (2026)"
                  value={batchName}
                  onChange={(e) => setBatchName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Weekly Schedule / Timings</label>
                <input
                  type="text"
                  placeholder="e.g. Mon, Wed, Fri 04:00 PM - 06:00 PM"
                  value={schedule}
                  onChange={(e) => setSchedule(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Capacity</label>
                  <input
                    type="number"
                    min={1}
                    max={500}
                    value={capacity}
                    onChange={(e) => setCapacity(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowBatchModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer shadow-xs"
                >
                  {editingBatch ? 'Save Changes' : 'Schedule Batch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
