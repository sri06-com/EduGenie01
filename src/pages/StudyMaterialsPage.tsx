import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Search,
  Filter,
  FileText,
  Video,
  FileCode,
  Download,
  ExternalLink,
  Bot,
  HelpCircle,
  Eye,
  X,
  Sparkles,
  Tag,
  CheckCircle,
} from 'lucide-react';
import { api } from '../services/api.js';
import { useLanguage } from '../context/LanguageContext.js';

interface StudyMaterialsPageProps {
  initialSubject?: string;
  initialSelectedId?: string;
  onNavigateToQuiz?: (quizId?: string) => void;
  onNavigateToAI?: (topic: string) => void;
}

export const StudyMaterialsPage: React.FC<StudyMaterialsPageProps> = ({
  initialSubject,
  initialSelectedId,
  onNavigateToQuiz,
  onNavigateToAI,
}) => {
  const { t } = useLanguage();

  const [materials, setMaterials] = useState<any[]>([]);
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedSubject, setSelectedSubject] = useState<string>(initialSubject || 'All');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewMaterial, setPreviewMaterial] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const categories = ['All', 'Notes', 'PDF', 'Video', 'PYQ', 'Reference'];
  const subjectsList = [
    'All',
    'Java Programming',
    'Python for Data Science',
    'Engineering Mathematics',
    'Database Management Systems',
    'Data Structures & Algorithms',
    'Professional English & Communication',
  ];

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const res = await api.materials.getAll({
        subject: selectedSubject !== 'All' ? selectedSubject : undefined,
        type: selectedType !== 'All' ? selectedType : undefined,
        search: searchQuery.trim() || undefined,
      });
      setMaterials(res.materials || []);

      if (initialSelectedId && !previewMaterial) {
        const target = res.materials?.find((m: any) => m._id === initialSelectedId);
        if (target) setPreviewMaterial(target);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, [selectedType, selectedSubject, searchQuery]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Video':
        return <Video className="w-4 h-4 text-rose-500" />;
      case 'PDF':
        return <FileCode className="w-4 h-4 text-red-500" />;
      case 'PYQ':
        return <HelpCircle className="w-4 h-4 text-purple-500" />;
      case 'Reference':
        return <BookOpen className="w-4 h-4 text-amber-500" />;
      default:
        return <FileText className="w-4 h-4 text-indigo-500" />;
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/25">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
              Academic Study Materials & Repository
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Verified syllabus notes, solved PYQs, PDFs, and reference guides
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search topic or keyword..."
            className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Filters: Category & Subject */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedType(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                selectedType === cat
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-800 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Subject Filter Dropdown */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="text-xs py-1.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {subjectsList.map((s) => (
              <option key={s} value={s}>
                {s === 'All' ? 'All Subjects' : s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Materials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {materials.map((m) => (
          <div
            key={m._id}
            className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700 transition flex flex-col justify-between group"
          >
            <div>
              {/* Type and subject header */}
              <div className="flex items-center justify-between mb-3">
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold">
                  {getTypeIcon(m.type)}
                  <span>{m.type}</span>
                </span>
                <span className="text-[10px] font-medium text-slate-400">
                  {m.durationOrPages}
                </span>
              </div>

              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition mb-1">
                {m.title}
              </h3>

              <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 block mb-2">
                {m.subject} • {m.topic}
              </span>

              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 mb-4 leading-relaxed">
                {m.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 mb-4">
                {m.tags?.map((t: string) => (
                  <span
                    key={t}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-slate-50 dark:bg-slate-800 text-slate-500"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
              <button
                onClick={() => setPreviewMaterial(m)}
                className="flex-1 py-2 px-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-semibold text-xs hover:bg-indigo-100 transition flex items-center justify-center gap-1.5"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Read Material</span>
              </button>

              <button
                onClick={() => onNavigateToAI?.(m.topic)}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                title="Ask Genie AI about this"
              >
                <Bot className="w-4 h-4 text-purple-600" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {materials.length === 0 && !loading && (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 text-slate-400 space-y-3">
          <BookOpen className="w-10 h-10 mx-auto text-slate-300" />
          <p className="text-sm font-semibold">No materials match the selected filters</p>
        </div>
      )}

      {/* Material Preview Modal */}
      {previewMaterial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 p-6 overflow-hidden max-h-[90vh] flex flex-col justify-between">
            {/* Modal Header */}
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600">
                    {getTypeIcon(previewMaterial.type)}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    {previewMaterial.type} Material
                  </span>
                </div>
                <button
                  onClick={() => setPreviewMaterial(null)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mb-1">
                {previewMaterial.title}
              </h3>
              <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold mb-4">
                {previewMaterial.subject} • {previewMaterial.topic} • {previewMaterial.durationOrPages}
              </p>
            </div>

            {/* Modal Body / Reader preview */}
            <div className="flex-1 overflow-y-auto space-y-4 py-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 leading-relaxed">
                <h4 className="font-bold text-slate-900 dark:text-white mb-1">Overview & Context:</h4>
                <p>{previewMaterial.description}</p>
              </div>

              <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 leading-relaxed">
                <h4 className="font-bold text-indigo-900 dark:text-indigo-300 mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span>Key Syllabus Concepts Covered:</span>
                </h4>
                <ul className="space-y-1.5 list-disc list-inside">
                  <li>Detailed structural decomposition with formal definitions.</li>
                  <li>Common university exam questions and solved numericals.</li>
                  <li>Comparative analysis and real-world practical applications.</li>
                  <li>Verified by senior university faculty and academic board.</li>
                </ul>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
              <button
                onClick={() => {
                  const topic = previewMaterial.topic;
                  setPreviewMaterial(null);
                  onNavigateToAI?.(topic);
                }}
                className="px-4 py-2.5 rounded-xl bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 font-semibold text-xs flex items-center gap-1.5 hover:bg-purple-100 transition"
              >
                <Bot className="w-4 h-4" />
                <span>Ask Genie Questions</span>
              </button>

              <button
                onClick={() => {
                  setPreviewMaterial(null);
                  onNavigateToQuiz?.();
                }}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-500/25 transition flex items-center gap-1.5"
              >
                <HelpCircle className="w-4 h-4" />
                <span>Practice Topic Quiz</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
