import React, { useState, useEffect } from 'react';
import {
  educationApi,
  EduStudent,
  EduBatch,
} from '../../../api/modules';
import {
  GraduationCap,
  Plus,
  Search,
  X,
  BookOpen,
  Filter,
  Edit2,
  Trash2,
  CircleDollarSign,
  Phone,
  Mail,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const EduStudentsPage: React.FC = () => {
  const [students, setStudents] = useState<EduStudent[]>([]);
  const [batches, setBatches] = useState<EduBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedBatchId, setSelectedBatchId] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Add Student Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [fullName, setFullName] = useState('');
  const [studentIdNum, setStudentIdNum] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [address, setAddress] = useState('');
  const [admissionDate, setAdmissionDate] = useState(new Date().toISOString().split('T')[0]);
  const [currentBatchId, setCurrentBatchId] = useState<number | ''>('');

  // Edit Student Modal State
  const [editingStudent, setEditingStudent] = useState<EduStudent | null>(null);
  const [editFullName, setEditFullName] = useState('');
  const [editStudentIdNum, setEditStudentIdNum] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editParentName, setEditParentName] = useState('');
  const [editParentPhone, setEditParentPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editAdmissionDate, setEditAdmissionDate] = useState('');
  const [editStatus, setEditStatus] = useState('ACTIVE');
  const [editBatchId, setEditBatchId] = useState<number | ''>('');

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const data = await educationApi.getStudents(search);
      setStudents(data);
    } catch (err) {
      console.error('Failed to load students', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBatches = async () => {
    try {
      const data = await educationApi.getBatches();
      setBatches(data);
    } catch (err) {
      console.error('Failed to load batches', err);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [search]);

  useEffect(() => {
    fetchBatches();
  }, []);

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !studentIdNum.trim()) return;

    try {
      await educationApi.createStudent({
        fullName: fullName.trim(),
        studentIdNumber: studentIdNum.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        parentName: parentName.trim() || undefined,
        parentPhone: parentPhone.trim() || undefined,
        address: address.trim() || undefined,
        admissionDate,
        currentBatchId: currentBatchId !== '' ? Number(currentBatchId) : undefined,
      });

      setShowAddModal(false);
      resetForm();
      fetchStudents();
    } catch (err) {
      console.error('Failed to register student', err);
    }
  };

  const handleOpenEditModal = (stu: EduStudent) => {
    setEditingStudent(stu);
    setEditFullName(stu.fullName);
    setEditStudentIdNum(stu.studentIdNumber);
    setEditEmail(stu.email || '');
    setEditPhone(stu.phone || '');
    setEditParentName(stu.parentName || '');
    setEditParentPhone(stu.parentPhone || '');
    setEditAddress(stu.address || '');
    setEditAdmissionDate(stu.admissionDate || new Date().toISOString().split('T')[0]);
    setEditStatus(stu.status || 'ACTIVE');
    setEditBatchId(stu.currentBatchId ?? '');
  };

  const handleUpdateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent || !editFullName.trim() || !editStudentIdNum.trim()) return;

    try {
      await educationApi.updateStudent(editingStudent.id, {
        fullName: editFullName.trim(),
        studentIdNumber: editStudentIdNum.trim(),
        email: editEmail.trim() || undefined,
        phone: editPhone.trim() || undefined,
        parentName: editParentName.trim() || undefined,
        parentPhone: editParentPhone.trim() || undefined,
        address: editAddress.trim() || undefined,
        admissionDate: editAdmissionDate,
        status: editStatus as 'ACTIVE' | 'INACTIVE' | 'COMPLETED' | 'DROPPED',
        currentBatchId: editBatchId !== '' ? Number(editBatchId) : undefined,
      });

      setEditingStudent(null);
      fetchStudents();
    } catch (err) {
      console.error('Failed to update student', err);
    }
  };

  const handleDeleteStudent = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this student record?')) return;
    try {
      await educationApi.deleteStudent(id);
      fetchStudents();
    } catch (err) {
      console.error('Failed to delete student', err);
    }
  };

  const resetForm = () => {
    setFullName('');
    setStudentIdNum('STU-' + Math.floor(1000 + Math.random() * 9000));
    setEmail('');
    setPhone('');
    setParentName('');
    setParentPhone('');
    setAddress('');
    setAdmissionDate(new Date().toISOString().split('T')[0]);
    setCurrentBatchId('');
  };

  const filteredStudents = students.filter((s) => {
    const matchesBatch = selectedBatchId === 'ALL' || s.currentBatchId === Number(selectedBatchId);
    const matchesStatus = selectedStatus === 'ALL' || s.status?.toUpperCase() === selectedStatus;
    return matchesBatch && matchesStatus;
  });

  const activeCount = students.filter((s) => s.status === 'ACTIVE').length;
  const inactiveCount = students.filter((s) => s.status !== 'ACTIVE').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Students &amp; Admissions Directory
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-800 text-xs font-bold border border-indigo-200 flex items-center gap-1.5">
              <GraduationCap size={13} className="text-indigo-600" />
              <span>Coaching Students</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Student profiles, contact information, guardian contacts, batch association, and active status.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/dashboard/education/courses"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            <BookOpen size={14} className="text-indigo-600" />
            <span>Courses &amp; Batches</span>
          </Link>

          <button
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            <Plus size={15} />
            <span>Admit New Student</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="clay-card p-4 space-y-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Registered</span>
          <div className="text-2xl font-black text-slate-900">{students.length}</div>
          <p className="text-[10px] text-slate-400">All enrolled students</p>
        </div>

        <div className="clay-card p-4 space-y-1">
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Active Students</span>
          <div className="text-2xl font-black text-emerald-600">{activeCount}</div>
          <p className="text-[10px] text-emerald-700">Currently studying</p>
        </div>

        <div className="clay-card p-4 space-y-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Inactive / Completed</span>
          <div className="text-2xl font-black text-slate-700">{inactiveCount}</div>
          <p className="text-[10px] text-slate-400">Passed out or inactive</p>
        </div>

        <div className="clay-card p-4 space-y-1">
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Batches</span>
          <div className="text-2xl font-black text-indigo-600">{batches.length}</div>
          <p className="text-[10px] text-indigo-700">Active classroom cohorts</p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative max-w-md w-full">
          <Search size={14} className="absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by student name, roll number, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200">
            {['ALL', 'ACTIVE', 'INACTIVE', 'COMPLETED'].map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedStatus === st
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Batch Filter Dropdown */}
          <div className="flex items-center gap-1.5">
            <Filter size={13} className="text-slate-400" />
            <select
              value={selectedBatchId}
              onChange={(e) => setSelectedBatchId(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800"
            >
              <option value="ALL">All Batches</option>
              {batches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.batchName} ({b.courseName || 'Course'})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="clay-card p-5 space-y-4">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-16 rounded-xl bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="py-12 text-center text-slate-400 space-y-2">
            <GraduationCap size={32} className="mx-auto text-slate-300" />
            <p className="font-bold text-slate-800 text-sm">No students found</p>
            <p className="text-xs text-slate-400">
              {search || selectedBatchId !== 'ALL' || selectedStatus !== 'ALL'
                ? 'Try adjusting your search or filters.'
                : 'Click "Admit New Student" to enroll your first student.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="text-slate-400 text-[10px] uppercase font-bold tracking-wider border-b border-slate-100">
                  <th className="pb-3">Student Name &amp; ID</th>
                  <th className="pb-3">Contact Details</th>
                  <th className="pb-3">Parent / Guardian</th>
                  <th className="pb-3">Assigned Batch</th>
                  <th className="pb-3">Admission Date</th>
                  <th className="pb-3 text-center">Status</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((stu) => (
                  <tr key={stu.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Student Name & ID */}
                    <td className="py-3 font-bold text-slate-900">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 font-black flex items-center justify-center text-xs shrink-0">
                          {stu.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span>{stu.fullName}</span>
                          <span className="block text-[10px] text-slate-400 font-mono font-normal">
                            ID: {stu.studentIdNumber}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Contact details */}
                    <td className="py-3 text-slate-700">
                      <div className="font-semibold flex items-center gap-1">
                        <Phone size={11} className="text-slate-400" />
                        <span>{stu.phone}</span>
                      </div>
                      {stu.email && (
                        <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Mail size={10} />
                          <span>{stu.email}</span>
                        </span>
                      )}
                    </td>

                    {/* Parent contact */}
                    <td className="py-3 text-slate-700">
                      {stu.parentName ? (
                        <div>
                          <span className="font-semibold block">{stu.parentName}</span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {stu.parentPhone || '—'}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">—</span>
                      )}
                    </td>

                    {/* Assigned Batch */}
                    <td className="py-3">
                      {stu.currentBatchName ? (
                        <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-[10px] border border-indigo-200 inline-block">
                          {stu.currentBatchName}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">Unassigned</span>
                      )}
                    </td>

                    {/* Admission Date */}
                    <td className="py-3 text-slate-600 font-mono text-[11px]">
                      {stu.admissionDate}
                    </td>

                    {/* Status */}
                    <td className="py-3 text-center">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          stu.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : stu.status === 'COMPLETED'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : stu.status === 'DROPPED'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {stu.status || 'ACTIVE'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to="/dashboard/education/fees"
                          className="px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[10px] font-bold border border-emerald-200 transition-colors flex items-center gap-1"
                          title="Manage Fees"
                        >
                          <CircleDollarSign size={12} />
                          <span>Fees</span>
                        </Link>

                        <button
                          onClick={() => handleOpenEditModal(stu)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 cursor-pointer transition-colors"
                          title="Edit Student"
                        >
                          <Edit2 size={13} />
                        </button>

                        <button
                          onClick={() => handleDeleteStudent(stu.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer transition-colors"
                          title="Delete Student"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ADMIT STUDENT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Student Admission Form</h3>
                <p className="text-[11px] text-slate-400">Enroll student and optionally assign to a batch.</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateStudent} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Student Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Aryan Deshmukh"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Student Roll / ID No. *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. STU-2026-01"
                    value={studentIdNum}
                    onChange={(e) => setStudentIdNum(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Student Phone (Optional)</label>
                  <input
                    type="tel"
                    placeholder="e.g. 9876543210 (Optional)"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Email Address</label>
                  <input
                    type="email"
                    placeholder="e.g. student@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Parent / Guardian Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Prakash Deshmukh"
                    value={parentName}
                    onChange={(e) => setParentName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Parent Phone</label>
                  <input
                    type="tel"
                    placeholder="e.g. 9822334455"
                    value={parentPhone}
                    onChange={(e) => setParentPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Assign to Batch</label>
                  <select
                    value={currentBatchId}
                    onChange={(e) => setCurrentBatchId(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                  >
                    <option value="">-- Select Batch (Auto-enrolls) --</option>
                    {batches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.batchName} ({b.courseName || 'Course'})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Admission Date</label>
                  <input
                    type="date"
                    value={admissionDate}
                    onChange={(e) => setAdmissionDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Residential Address</label>
                <textarea
                  rows={2}
                  placeholder="Street, City, State, PIN..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer shadow-xs"
                >
                  Complete Admission
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT STUDENT MODAL */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Edit Student Details</h3>
                <p className="text-[11px] text-slate-400">Update contact details, batch allocation, or status.</p>
              </div>
              <button
                onClick={() => setEditingStudent(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdateStudent} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Student Full Name *</label>
                  <input
                    type="text"
                    required
                    value={editFullName}
                    onChange={(e) => setEditFullName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Student Roll / ID No. *</label>
                  <input
                    type="text"
                    required
                    value={editStudentIdNum}
                    onChange={(e) => setEditStudentIdNum(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Student Phone (Optional)</label>
                  <input
                    type="tel"
                    placeholder="e.g. 9876543210 (Optional)"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Email Address</label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Parent / Guardian Name</label>
                  <input
                    type="text"
                    value={editParentName}
                    onChange={(e) => setEditParentName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Parent Phone</label>
                  <input
                    type="tel"
                    value={editParentPhone}
                    onChange={(e) => setEditParentPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Assigned Batch</label>
                  <select
                    value={editBatchId}
                    onChange={(e) => setEditBatchId(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                  >
                    <option value="">-- None --</option>
                    {batches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.batchName} ({b.courseName || 'Course'})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="DROPPED">DROPPED</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Admission Date</label>
                  <input
                    type="date"
                    value={editAdmissionDate}
                    onChange={(e) => setEditAdmissionDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Address</label>
                <textarea
                  rows={2}
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer shadow-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
