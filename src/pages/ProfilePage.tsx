import React, { useState } from 'react';
import {
  User as UserIcon,
  Mail,
  GraduationCap,
  Calendar,
  Flame,
  Award,
  Edit3,
  Check,
  X,
  Camera,
  BookOpen,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { useLanguage } from '../context/LanguageContext.js';

export const ProfilePage: React.FC = () => {
  const { user, badges, updateProfile } = useAuth();
  const { t } = useLanguage();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [educationLevel, setEducationLevel] = useState(user?.educationLevel || 'College / University');
  const [course, setCourse] = useState(user?.course || 'B.Tech / B.E Computer Science');
  const [department, setDepartment] = useState(user?.department || 'Computer Science');
  const [semester, setSemester] = useState(user?.semester || 'Semester 4');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(
    user?.selectedSubjects || ['Java Programming', 'Database Management Systems']
  );
  const [profileImage, setProfileImage] = useState(
    user?.profileImage || `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.name || 'student'}`
  );
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  const sampleAvatars = [
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
  ];

  const allSubjects = [
    'Java Programming',
    'Python for Data Science',
    'Engineering Mathematics',
    'Database Management Systems',
    'Data Structures & Algorithms',
    'Professional English & Communication',
  ];

  const toggleSubject = (s: string) => {
    if (selectedSubjects.includes(s)) {
      if (selectedSubjects.length > 1) {
        setSelectedSubjects(selectedSubjects.filter((item) => item !== s));
      }
    } else {
      setSelectedSubjects([...selectedSubjects, s]);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile({
        name,
        educationLevel,
        course,
        department,
        semester,
        profileImage,
        selectedSubjects,
      });
      setIsEditing(false);
      setStatusNotice('Profile updated successfully! ✨');
      setTimeout(() => setStatusNotice(null), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
      {/* Student Profile Card */}
      <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            <div className="relative">
              <img
                src={user?.profileImage || profileImage}
                alt={user?.name}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover ring-4 ring-indigo-500/20 shadow-md"
              />
              <div className="absolute -bottom-2 -right-2 p-1.5 rounded-xl bg-amber-500 text-white shadow-md text-xs font-bold flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 fill-white" />
                <span>{user?.streak || 7}d</span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                  {user?.name}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-bold">
                  Level {user?.level || 4} Scholar
                </span>
              </div>

              <p className="text-xs text-slate-500 flex items-center justify-center sm:justify-start gap-1.5">
                <Mail className="w-3.5 h-3.5" />
                <span>{user?.email}</span>
              </p>

              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 pt-1">
                {user?.course} • {user?.semester}
              </p>
              <p className="text-[11px] text-slate-400">
                Department of {user?.department} ({user?.educationLevel})
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 font-semibold text-xs transition flex items-center gap-1.5"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </button>
        </div>

        {statusNotice && (
          <div className="mt-4 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold text-center">
            {statusNotice}
          </div>
        )}

        {/* Academic Stats Strip */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 text-center">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">XP Points</span>
            <span className="text-lg font-extrabold text-indigo-600 dark:text-indigo-400">
              {user?.xp || 1250}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Streak</span>
            <span className="text-lg font-extrabold text-amber-500">
              {user?.streak || 7} Days
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Badges</span>
            <span className="text-lg font-extrabold text-purple-600">
              {badges.filter((b) => b.isUnlocked).length} Unlocked
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Mastery</span>
            <span className="text-lg font-extrabold text-emerald-600">
              72%
            </span>
          </div>
        </div>
      </div>

      {/* Enrolled Subjects List */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-indigo-500" />
          <span>Active Enrolled Subjects ({user?.selectedSubjects?.length || 0})</span>
        </h3>
        <div className="flex flex-wrap gap-2">
          {(user?.selectedSubjects || []).map((sub) => (
            <span
              key={sub}
              className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold"
            >
              {sub}
            </span>
          ))}
        </div>
      </div>

      {/* Earned Badges Grid */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-500" />
          <span>Unlocked Badges</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {badges
            .filter((b) => b.isUnlocked)
            .map((b) => (
              <div
                key={b.id}
                className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-slate-800/60 border border-indigo-100/60 dark:border-slate-700/60 text-center flex flex-col items-center justify-between"
              >
                <div className="text-3xl mb-1">{b.icon}</div>
                <h4 className="font-bold text-xs text-slate-900 dark:text-white mb-0.5">
                  {b.badgeName}
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  {b.description}
                </p>
              </div>
            ))}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 p-6 overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Edit Academic Profile
              </h3>
              <button
                onClick={() => setIsEditing(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 max-h-[75vh] overflow-y-auto px-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Choose Avatar Picture
                </label>
                <div className="flex items-center gap-3">
                  {sampleAvatars.map((url, i) => (
                    <img
                      key={i}
                      src={url}
                      alt="avatar option"
                      onClick={() => setProfileImage(url)}
                      className={`w-12 h-12 rounded-xl object-cover cursor-pointer border-2 transition ${
                        profileImage === url ? 'border-indigo-600 scale-105' : 'border-transparent opacity-70'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Course / Degree
                  </label>
                  <input
                    type="text"
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Education Level
                  </label>
                  <select
                    value={educationLevel}
                    onChange={(e) => setEducationLevel(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                  >
                    <option value="College / University">College / University</option>
                    <option value="High School (11th & 12th)">High School (11th & 12th)</option>
                    <option value="Secondary School">Secondary School</option>
                    <option value="Competitive Exam Learner">Competitive Exam Learner</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Semester
                  </label>
                  <select
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                  >
                    <option value="Semester 1">Semester 1</option>
                    <option value="Semester 2">Semester 2</option>
                    <option value="Semester 3">Semester 3</option>
                    <option value="Semester 4">Semester 4</option>
                    <option value="Semester 5">Semester 5</option>
                    <option value="Semester 6">Semester 6</option>
                    <option value="Semester 7">Semester 7</option>
                    <option value="Semester 8">Semester 8</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Enrolled Subjects
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {allSubjects.map((s) => {
                    const active = selectedSubjects.includes(s);
                    return (
                      <button
                        type="button"
                        key={s}
                        onClick={() => toggleSubject(s)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                          active
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
