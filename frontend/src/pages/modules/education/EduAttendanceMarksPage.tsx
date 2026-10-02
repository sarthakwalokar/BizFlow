import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  educationApi,
  EduBatch,
  EduStudent,
  EduExamResult,
} from '../../../api/modules';
import {
  CalendarCheck,
  Award,
  Users,
  CheckCircle2,
  Plus,
  Save,
  GraduationCap,
} from 'lucide-react';

export const EduAttendanceMarksPage: React.FC = () => {
  const { t } = useTranslation();
  const [batches, setBatches] = useState<EduBatch[]>([]);
  const [students, setStudents] = useState<EduStudent[]>([]);
  const [selectedBatchId, setSelectedBatchId] = useState<number | ''>('');
  const [activeTab, setActiveTab] = useState<'ATTENDANCE' | 'EXAMS'>('ATTENDANCE');

  // Attendance state
  const [attendanceDate, setAttendanceDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [attendanceMap, setAttendanceMap] = useState<{
    [studentId: number]: { status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED'; remarks: string };
  }>({});
  const [isSavingAttendance, setIsSavingAttendance] = useState(false);
  const [attendanceSavedSuccess, setAttendanceSavedSuccess] = useState(false);

  // Exam Results state
  const [examResults, setExamResults] = useState<EduExamResult[]>([]);
  const [showAddExamModal, setShowAddExamModal] = useState(false);
  const [examForm, setExamForm] = useState({
    studentId: '',
    examName: '',
    subject: '',
    examDate: new Date().toISOString().split('T')[0],
    maxMarks: 100,
    marksObtained: '',
    remarks: '',
  });

  // Load initial Batches & Students
  useEffect(() => {
    const initData = async () => {
      try {
        const [batchList, studentList] = await Promise.all([
          educationApi.getBatches(),
          educationApi.getStudents(),
        ]);
        setBatches(batchList);
        setStudents(studentList);
        if (batchList.length > 0) {
          setSelectedBatchId(batchList[0].id);
        }
      } catch (err) {
        console.error('Failed to load batches/students', err);
      }
    };
    initData();
  }, []);

  // Fetch Attendance & Exam Results whenever batch or tab or date changes
  useEffect(() => {
    if (!selectedBatchId) return;

    const fetchBatchData = async () => {
      try {
        if (activeTab === 'ATTENDANCE') {
          const records = await educationApi.getAttendance(Number(selectedBatchId), attendanceDate);

          // Build quick lookup map
          const map: { [studentId: number]: { status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED'; remarks: string } } = {};
          
          // Filter students assigned to this batch
          const batchStudents = students.filter(s => s.currentBatchId === Number(selectedBatchId));

          batchStudents.forEach(s => {
            const existing = records.find(r => r.studentId === s.id);
            map[s.id] = {
              status: existing ? (existing.status as any) : 'PRESENT',
              remarks: existing?.remarks || '',
            };
          });

          setAttendanceMap(map);
        } else {
          const results = await educationApi.getExamResults(Number(selectedBatchId));
          setExamResults(results);
        }
      } catch (err) {
        console.error('Failed to load batch attendance/exam data', err);
      }
    };

    fetchBatchData();
  }, [selectedBatchId, attendanceDate, activeTab, students]);

  // Handle Mark Attendance Submit
  const handleSaveAttendance = async () => {
    if (!selectedBatchId) return;
    try {
      setIsSavingAttendance(true);
      const batchStudents = students.filter(s => s.currentBatchId === Number(selectedBatchId));
      
      const payload = {
        batchId: Number(selectedBatchId),
        attendanceDate,
        attendances: batchStudents.map(s => ({
          studentId: s.id,
          status: attendanceMap[s.id]?.status || 'PRESENT',
          remarks: attendanceMap[s.id]?.remarks || '',
        })),
      };

      await educationApi.markAttendance(payload);
      setAttendanceSavedSuccess(true);
      setTimeout(() => setAttendanceSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save attendance', err);
    } finally {
      setIsSavingAttendance(false);
    }
  };

  const setAllStatus = (status: 'PRESENT' | 'ABSENT') => {
    const updated = { ...attendanceMap };
    Object.keys(updated).forEach(id => {
      updated[Number(id)] = {
        ...updated[Number(id)],
        status,
      };
    });
    setAttendanceMap(updated);
  };

  // Record Exam Result
  const handleSaveExamResult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatchId || !examForm.studentId || examForm.marksObtained === '') return;

    try {
      const max = Number(examForm.maxMarks) || 100;
      const obtained = Number(examForm.marksObtained);
      const percentage = (obtained / max) * 100;
      
      let grade = 'A';
      if (percentage >= 90) grade = 'A+';
      else if (percentage >= 80) grade = 'A';
      else if (percentage >= 70) grade = 'B';
      else if (percentage >= 60) grade = 'C';
      else if (percentage >= 50) grade = 'D';
      else grade = 'F';

      await educationApi.recordExamResult({
        batchId: Number(selectedBatchId),
        studentId: Number(examForm.studentId),
        examName: examForm.examName.trim(),
        subject: examForm.subject.trim(),
        examDate: examForm.examDate,
        maxMarks: max,
        marksObtained: obtained,
        grade,
        remarks: examForm.remarks.trim() || undefined,
      });

      setShowAddExamModal(false);
      setExamForm({
        studentId: '',
        examName: '',
        subject: '',
        examDate: new Date().toISOString().split('T')[0],
        maxMarks: 100,
        marksObtained: '',
        remarks: '',
      });

      // Reload exam results
      const results = await educationApi.getExamResults(Number(selectedBatchId));
      setExamResults(results);
    } catch (err) {
      console.error('Failed to save exam score', err);
    }
  };

  const currentBatch = batches.find(b => b.id === Number(selectedBatchId));
  const batchStudents = students.filter(s => s.currentBatchId === Number(selectedBatchId));

  // Attendance stats for selected date
  const totalInBatch = batchStudents.length;
  const presentCount = Object.values(attendanceMap).filter(a => a.status === 'PRESENT').length;
  const absentCount = Object.values(attendanceMap).filter(a => a.status === 'ABSENT').length;
  const attendanceRate = totalInBatch > 0 ? Math.round((presentCount / totalInBatch) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 rounded-xl text-emerald-400">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                {t('education.attendanceAndMarksTitle', 'Attendance & Performance')}
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                  {t('education.moduleTag', 'Education Module')}
                </span>
              </h1>
              <p className="text-sm text-slate-400">
                {t('education.attendanceSubtitle', 'Daily roll call, attendance tracking, test marks, and student progress.')}
              </p>
            </div>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 p-1 bg-slate-900/60 border border-slate-800 rounded-xl">
          <button
            onClick={() => setActiveTab('ATTENDANCE')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === 'ATTENDANCE'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <CalendarCheck className="w-4 h-4" />
            {t('education.dailyAttendance', 'Daily Attendance')}
          </button>
          <button
            onClick={() => setActiveTab('EXAMS')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === 'EXAMS'
                ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Award className="w-4 h-4" />
            {t('education.examsAndMarks', 'Exams & Marks')}
          </button>
        </div>
      </div>

      {/* Control Bar: Batch Selector & Date */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          {/* Batch Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t('education.selectBatch', 'Select Batch')}:</span>
            <select
              value={selectedBatchId}
              onChange={(e) => setSelectedBatchId(Number(e.target.value))}
              className="bg-slate-950/80 border border-slate-700/80 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
            >
              {batches.length === 0 ? (
                <option value="">{t('education.noBatchesCreated', 'No batches created')}</option>
              ) : (
                batches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.batchName} ({b.courseName || t('education.course', 'Course')})
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Date Picker (only for attendance) */}
          {activeTab === 'ATTENDANCE' && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t('education.dateLabel', 'Date')}:</span>
              <input
                type="date"
                value={attendanceDate}
                onChange={(e) => setAttendanceDate(e.target.value)}
                className="bg-slate-950/80 border border-slate-700/80 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {activeTab === 'ATTENDANCE' ? (
          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <button
              onClick={() => setAllStatus('PRESENT')}
              className="px-3 py-1.5 text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg hover:bg-emerald-500/20 transition-all"
            >
              {t('education.markAllPresent', 'Mark All Present')}
            </button>
            <button
              onClick={() => setAllStatus('ABSENT')}
              className="px-3 py-1.5 text-xs font-medium text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg hover:bg-rose-500/20 transition-all"
            >
              {t('education.markAllAbsent', 'Mark All Absent')}
            </button>
            <button
              onClick={handleSaveAttendance}
              disabled={isSavingAttendance || batchStudents.length === 0}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 text-slate-950 font-semibold rounded-xl hover:bg-emerald-400 transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSavingAttendance ? t('common.saving', 'Saving...') : t('education.saveAttendance', 'Save Attendance')}
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <button
              onClick={() => setShowAddExamModal(true)}
              disabled={!selectedBatchId || batchStudents.length === 0}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-500 text-white font-semibold rounded-xl hover:bg-indigo-400 transition-all disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              {t('education.recordTestScore', 'Record Test Score')}
            </button>
          </div>
        )}
      </div>

      {attendanceSavedSuccess && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          {t('education.attendanceSavedSuccess', 'Attendance for {{date}} saved successfully!', { date: attendanceDate })}
        </div>
      )}

      {/* TAB 1: ATTENDANCE */}
      {activeTab === 'ATTENDANCE' && (
        <div className="space-y-6">
          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl">
              <p className="text-xs text-slate-400 font-medium">{t('education.batchStudents', 'Batch Students')}</p>
              <p className="text-2xl font-bold text-white mt-1">{totalInBatch}</p>
            </div>
            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl">
              <p className="text-xs text-emerald-400 font-medium">{t('education.presentToday', 'Present Today')}</p>
              <p className="text-2xl font-bold text-emerald-400 mt-1">{presentCount}</p>
            </div>
            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl">
              <p className="text-xs text-rose-400 font-medium">{t('education.absent', 'Absent')}</p>
              <p className="text-2xl font-bold text-rose-400 mt-1">{absentCount}</p>
            </div>
            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl">
              <p className="text-xs text-indigo-400 font-medium">{t('education.attendanceRate', 'Attendance Rate')}</p>
              <p className="text-2xl font-bold text-indigo-400 mt-1">{attendanceRate}%</p>
            </div>
          </div>

          {/* Student Roll Call List */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden">
            {batchStudents.length === 0 ? (
              <div className="text-center py-16 px-4">
                <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <h3 className="text-base font-semibold text-white">{t('education.noStudentsInBatch', 'No students enrolled in this batch')}</h3>
                <p className="text-sm text-slate-400 mt-1">
                  {t('education.assignStudentsPrompt', 'Assign students to this batch in the Courses & Batches or Students section to mark attendance.')}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950/40 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      <th className="py-3 px-4">{t('education.rollId', 'Roll / ID')}</th>
                      <th className="py-3 px-4">{t('education.studentName', 'Student Name')}</th>
                      <th className="py-3 px-4">{t('education.contact', 'Contact')}</th>
                      <th className="py-3 px-4 text-center">{t('common.status', 'Status')}</th>
                      <th className="py-3 px-4">{t('education.remarksNote', 'Remarks / Note')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-sm">
                    {batchStudents.map((s) => {
                      const currentStatus = attendanceMap[s.id]?.status || 'PRESENT';
                      const currentRemarks = attendanceMap[s.id]?.remarks || '';

                      return (
                        <tr key={s.id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="py-3.5 px-4 font-mono text-xs text-emerald-400">
                            {s.studentIdNumber || `#${s.id}`}
                          </td>
                          <td className="py-3.5 px-4 font-medium text-white">
                            {s.fullName}
                          </td>
                          <td className="py-3.5 px-4 text-slate-400 text-xs">
                            {s.phone}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center justify-center gap-1.5">
                              {(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'] as const).map((statusVal) => {
                                const isSelected = currentStatus === statusVal;
                                let colorClass = 'border-slate-700 text-slate-400 hover:border-slate-600';
                                if (isSelected) {
                                  if (statusVal === 'PRESENT') colorClass = 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400 font-semibold';
                                  if (statusVal === 'ABSENT') colorClass = 'bg-rose-500/20 border-rose-500/50 text-rose-400 font-semibold';
                                  if (statusVal === 'LATE') colorClass = 'bg-amber-500/20 border-amber-500/50 text-amber-400 font-semibold';
                                  if (statusVal === 'EXCUSED') colorClass = 'bg-blue-500/20 border-blue-500/50 text-blue-400 font-semibold';
                                }

                                return (
                                  <button
                                    key={statusVal}
                                    type="button"
                                    onClick={() =>
                                      setAttendanceMap({
                                        ...attendanceMap,
                                        [s.id]: { ...attendanceMap[s.id], status: statusVal },
                                      })
                                    }
                                    className={`px-2.5 py-1 text-xs rounded-lg border transition-all ${colorClass}`}
                                  >
                                    {statusVal === 'PRESENT' ? t('education.present', 'Present') : statusVal === 'ABSENT' ? t('education.absent', 'Absent') : statusVal === 'LATE' ? t('education.late', 'Late') : t('education.excused', 'Excused')}
                                  </button>
                                );
                              })}
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <input
                              type="text"
                              placeholder={t('education.optionalRemark', 'Optional remark...')}
                              value={currentRemarks}
                              onChange={(e) =>
                                setAttendanceMap({
                                  ...attendanceMap,
                                  [s.id]: { ...attendanceMap[s.id], remarks: e.target.value },
                                })
                              }
                              className="bg-slate-950/60 border border-slate-800 text-xs text-white rounded-lg px-2.5 py-1.5 w-full focus:outline-none focus:border-slate-600"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: EXAMS & PERFORMANCE */}
      {activeTab === 'EXAMS' && (
        <div className="space-y-6">
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-white">{t('education.examResultsTitle', 'Exam & Test Results')}</h2>
                <p className="text-xs text-slate-400">
                  {t('education.scoresRecordedForBatch', 'Scores recorded for {{name}}', { name: currentBatch?.batchName || t('education.thisBatch', 'this batch') })}
                </p>
              </div>
            </div>

            {examResults.length === 0 ? (
              <div className="text-center py-16 px-4">
                <Award className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <h3 className="text-base font-semibold text-white">{t('education.noScoresRecorded', 'No test scores recorded yet')}</h3>
                <p className="text-sm text-slate-400 mt-1">
                  {t('education.recordScorePrompt', 'Click "Record Test Score" above to add exam marks, grades, and feedback.')}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950/40 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      <th className="py-3 px-4">{t('education.dateLabel', 'Date')}</th>
                      <th className="py-3 px-4">{t('education.examTest', 'Exam / Test')}</th>
                      <th className="py-3 px-4">{t('education.subject', 'Subject')}</th>
                      <th className="py-3 px-4">{t('education.student', 'Student')}</th>
                      <th className="py-3 px-4">{t('education.score', 'Score')}</th>
                      <th className="py-3 px-4">{t('education.percentage', 'Percentage')}</th>
                      <th className="py-3 px-4">{t('education.grade', 'Grade')}</th>
                      <th className="py-3 px-4">{t('education.remarks', 'Remarks')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-sm">
                    {examResults.map((r) => {
                      const percentage = Math.round((r.marksObtained / r.maxMarks) * 100);
                      return (
                        <tr key={r.id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="py-3.5 px-4 text-xs text-slate-400 font-mono">
                            {r.examDate}
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-white">
                            {r.examName}
                          </td>
                          <td className="py-3.5 px-4 text-slate-300 text-xs">
                            {r.subject}
                          </td>
                          <td className="py-3.5 px-4 text-white font-medium">
                            {r.studentName}
                          </td>
                          <td className="py-3.5 px-4 font-mono font-semibold text-indigo-400">
                            {r.marksObtained} / {r.maxMarks}
                          </td>
                          <td className="py-3.5 px-4 font-medium text-slate-300">
                            {percentage}%
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                                r.grade?.startsWith('A')
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  : r.grade?.startsWith('B')
                                  ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                  : r.grade?.startsWith('C')
                                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              }`}
                            >
                              {r.grade || 'N/A'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-xs text-slate-400 italic">
                            {r.remarks || '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Record Test Score Modal */}
      {showAddExamModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
            <h2 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-400" />
              {t('education.recordExamScoreTitle', 'Record Exam / Test Score')}
            </h2>
            <p className="text-xs text-slate-400 mb-5">
              {t('education.enterStudentScoreForBatch', 'Enter student performance marks for batch: {{name}}', { name: currentBatch?.batchName })}
            </p>

            <form onSubmit={handleSaveExamResult} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">{t('education.studentReq', 'Student *')}</label>
                <select
                  required
                  value={examForm.studentId}
                  onChange={(e) => setExamForm({ ...examForm, studentId: e.target.value })}
                  className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="">{t('education.selectStudent', 'Select student')}</option>
                  {batchStudents.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.fullName} ({s.studentIdNumber || s.phone})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">{t('education.examNameReq', 'Exam / Test Name *')}</label>
                  <input
                    type="text"
                    required
                    placeholder={t('placeholders.examNameExample', 'e.g. Unit Test 1')}
                    value={examForm.examName}
                    onChange={(e) => setExamForm({ ...examForm, examName: e.target.value })}
                    className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">{t('education.subjectReq', 'Subject *')}</label>
                  <input
                    type="text"
                    required
                    placeholder={t('placeholders.subjectExample', 'e.g. Mathematics')}
                    value={examForm.subject}
                    onChange={(e) => setExamForm({ ...examForm, subject: e.target.value })}
                    className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">{t('education.maxMarksReq', 'Max Marks *')}</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={examForm.maxMarks}
                    onChange={(e) => setExamForm({ ...examForm, maxMarks: Number(e.target.value) })}
                    className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">{t('education.marksObtainedReq', 'Marks Obtained *')}</label>
                  <input
                    type="number"
                    required
                    min="0"
                    max={examForm.maxMarks}
                    value={examForm.marksObtained}
                    onChange={(e) => setExamForm({ ...examForm, marksObtained: e.target.value })}
                    className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">{t('education.dateReq', 'Date *')}</label>
                  <input
                    type="date"
                    required
                    value={examForm.examDate}
                    onChange={(e) => setExamForm({ ...examForm, examDate: e.target.value })}
                    className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">{t('education.remarksFeedback', 'Remarks / Feedback')}</label>
                <input
                  type="text"
                  placeholder={t('placeholders.remarksExample', 'e.g. Excellent conceptual grasp in calculus')}
                  value={examForm.remarks}
                  onChange={(e) => setExamForm({ ...examForm, remarks: e.target.value })}
                  className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddExamModal(false)}
                  className="px-4 py-2 text-sm text-slate-300 hover:text-white rounded-xl hover:bg-slate-800 transition-all"
                >
                  {t('common.cancel', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-semibold text-white bg-indigo-500 hover:bg-indigo-400 rounded-xl transition-all"
                >
                  {t('education.saveResult', 'Save Result')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
