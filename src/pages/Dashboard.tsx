import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";
import ResumePage from "./Resume";
import { useNavigate } from "react-router-dom";
import { Briefcase, Target, Mic2, FileCheck, TrendingUp, ChevronRight } from "lucide-react";

type Overview = {
  totalJobs: number;
  jobsByStatus: Record<string, number>;
  averageATSScore: number;
  averageInterviewScore: number;
  answersPracticed: number;
};

export default function Dashboard() {
  const navigate = useNavigate();
 
  const [data, setData] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const ViewReport=()=>{
    navigate("/reports");
  }

  useEffect(() => {
    const loadData = async () => {
      try {
        const session = await import("../lib/supabase").then(m => m.supabase.auth.getSession());
        const token = session.data.session?.access_token;
        if (!token) return;
        const result = await apiFetch("/reports/overview", token);
        setData(result);
      } catch {
        setError("Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorMessage message={error} />;
  if (!data) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans">
      <div className="max-w-[1400px] mx-auto px-6 py-12 space-y-10">
        
        
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900">
              Overview
            </h1>
            <p className="text-slate-500 mt-1 text-lg">
              Welcome back,
            </p>
          </div>
          <button onClick={ViewReport} className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm">
            View Reports <ChevronRight size={16} />
          </button>
        </header>

        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            label="Total Jobs" 
            value={data.totalJobs} 
            icon={<Briefcase className="text-blue-600" size={20} />} 
            trend="+12% from last month"
          />
          <StatCard 
            label="Avg. ATS Score" 
            value={`${data.averageATSScore}%`} 
            icon={<FileCheck className="text-emerald-600" size={20} />} 
            trend="Top 5% of candidates"
          />
          <StatCard 
            label="Interview Score" 
            value={`${data.averageInterviewScore}/100`} 
            icon={<Mic2 className="text-indigo-600" size={20} />} 
            trend="Improving weekly"
          />
          <StatCard 
            label="Practiced" 
            value={data.answersPracticed} 
            icon={<Target className="text-orange-600" size={20} />} 
            trend="Ready for interview"
          />
        </div>

       
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-2xl p-8 border border-slate-200/60 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <TrendingUp size={20} className="text-indigo-500" />
                Performance Overview
              </h2>
              <div className="flex gap-4 text-xs font-medium text-slate-400">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-slate-900" /> ATS</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-indigo-500" /> Interview</span>
              </div>
            </div>
            <LineChart ats={data.averageATSScore} interview={data.averageInterviewScore} />
          </div>

          <div className="bg-white rounded-2xl p-8 border border-slate-200/60 shadow-sm transition-all hover:shadow-md">
            <h2 className="text-lg font-bold mb-8">Jobs by Status</h2>
            <DonutChart data={data.jobsByStatus} />
            <div className="mt-8 space-y-3">
              {Object.entries(data.jobsByStatus).map(([status, count], i) => (
                <div key={status} className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 capitalize">{status}</span>
                  <span className="font-semibold text-slate-700">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        
        <div className="pt-10 border-t border-slate-200">
          <ResumePage />
        </div>
      </div>
    </div>
  );
}



function StatCard({ label, value, icon, trend }: { label: string; value: any; icon: React.ReactNode; trend: string }) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm hover:border-indigo-200 transition-all group">
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 bg-slate-50 rounded-xl group-hover:bg-indigo-50 transition-colors">
          {icon}
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-1 rounded">Active</span>
      </div>
      <p className="text-slate-500 text-sm font-medium">{label}</p>
      <p className="text-3xl font-bold text-slate-900 mt-1 tracking-tight">{value}</p>
      <p className="text-xs text-slate-400 mt-4 flex items-center gap-1">
        {trend}
      </p>
    </div>
  );
}

function LineChart({ ats, interview }: { ats: number; interview: number }) {
  const atsY = 120 - (ats * 0.8);
  const interviewY = 120 - (interview * 0.8);

  return (
    <div className="relative w-full h-64 flex items-end">
      <svg viewBox="0 0 400 160" className="w-full h-full drop-shadow-sm" preserveAspectRatio="none">
        <defs>
          <linearGradient id="colorAts" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#0F172A" stopOpacity={0.1}/>
            <stop offset="95%" stopColor="#0F172A" stopOpacity={0}/>
          </linearGradient>
        </defs>
        {[0, 40, 80, 120].map(y => (
          <line key={y} x1="0" x2="400" y1={y} y2={y} stroke="#F1F5F9" strokeWidth="1" />
        ))}
        <polyline
          fill="none"
          stroke="#0F172A"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={`0,${atsY} 100,${atsY - 15} 200,${atsY + 5} 300,${atsY - 20} 400,${atsY - 10}`}
        />
        <polyline
          fill="none"
          stroke="#6366F1"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={`0,${interviewY} 100,${interviewY + 10} 200,${interviewY - 5} 300,${interviewY + 15} 400,${interviewY}`}
        />
      </svg>
    </div>
  );
}

function DonutChart({ data }: { data: Record<string, number> }) {
  const total = Object.values(data).reduce((a, b) => a + b, 0);
  let offset = 0;
  const colors = ["#0F172A", "#6366F1", "#94A3B8", "#F1F5F9"];

  return (
    <div className="relative flex justify-center items-center">
      <svg viewBox="0 0 120 120" className="w-48 h-48 transform -rotate-90">
        <circle cx="60" cy="60" r="50" fill="none" stroke="#F8FAFC" strokeWidth="12" />
        {Object.entries(data).map(([_, value], i) => {
          const dash = (value / total) * 314;
          const strokeDasharray = `${dash} 314`;
          const el = (
            <circle
              key={i}
              cx="60"
              cy="60"
              r="50"
              fill="none"
              stroke={colors[i % colors.length]}
              strokeWidth="12"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={-offset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          );
          offset += dash;
          return el;
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold">{total}</span>
        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Jobs</span>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="p-10 max-w-[1400px] mx-auto animate-pulse space-y-8">
      <div className="h-10 w-48 bg-slate-200 rounded-lg" />
      <div className="grid grid-cols-4 gap-6">
        {[1,2,3,4].map(i => <div key={i} className="h-32 bg-slate-100 rounded-2xl" />)}
      </div>
      <div className="h-64 bg-slate-100 rounded-2xl" />
    </div>
  );
}

function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-red-50 text-red-600 px-6 py-4 rounded-xl border border-red-100 font-medium">
        {message}
      </div>
    </div>
  );
}