"use client";

import { useState } from "react";

interface PlanResult {
  requirements?: {
    core_features?: string[];
    target_audience?: string;
    mvp_scope?: string[];
  };
  architecture?: {
    frontend_stack?: string;
    backend_stack?: string;
    database_recommendation?: string;
    high_level_architecture?: string;
  };
  timeline?: Array<{
    phase: string;
    estimated_days: number;
    deliverables: string[];
  }>;
}

export default function Home() {
  const [idea, setIdea] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PlanResult | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idea.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("http://127.0.0.1:8000/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea }),
      });
      
      if (!response.ok) throw new Error("Failed execution sequence.");
      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      alert("Error talking to the agent orchestration layer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#121212] text-[#FFFFFF] p-8 font-sans selection:bg-[#E02424] selection:text-white">
      <div className="max-w-7xl mx-auto pt-10 lg:pt-16 pb-16">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
          
          {/* LEFT COLUMN WRAPPER */}
          <div className="lg:col-span-5 relative">
            
            {/* INNER STICKY CONTAINER */}
            <div className="sticky top-10 flex flex-col">
              
              {/* Header Section */}
              <header className="border-b border-neutral-800 pb-6 mb-8">
                <h1 className="text-[3.5rem] font-black tracking-tight leading-[1.05]">
                  Multi-Agent <span className="text-[#E02424]">Project</span><br />
                  <span className="text-[#E02424]">Planner</span>
                </h1>
                <p className="text-neutral-400 mt-4 text-lg">Orvantia AI Engineering Technical Challenge Workspace</p>
              </header>

              {/* Form Section */}
              <form onSubmit={handleSubmit} className="flex flex-col bg-[#1c1c1c] p-6 rounded-2xl border border-neutral-800 shadow-xl">
                <div className="flex flex-col">
                  <label className="block text-sm font-bold text-neutral-300 mb-3 uppercase tracking-wider">
                    Input Prompt
                  </label>
                  <textarea
                    className="w-full bg-[#121212] border border-neutral-700 rounded-xl p-4 text-[15px] focus:outline-none focus:border-[#E02424] focus:ring-1 focus:ring-[#E02424] text-neutral-200 transition-all resize-none h-[320px]"
                    placeholder="e.g., A web-based SaaS platform for high school teachers that automatically generates customized lesson plans..."
                    value={idea}
                    onChange={(e) => setIdea(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-6 bg-[#E02424] hover:bg-red-700 disabled:bg-neutral-800 disabled:text-neutral-500 transition-colors py-4 rounded-xl font-bold text-[17px] shadow-lg shadow-red-900/20"
                >
                  {loading ? "Orchestrating Agents..." : "Execute Planning Protocol"}
                </button>
              </form>
            </div>
          </div>

          {/* RIGHT COLUMN: Output Displays */}
          <div className="lg:col-span-7 flex flex-col">
            
            {/* Empty State */}
            {!result && !loading && (
              <div className="h-full min-h-[400px] w-full flex items-center justify-center border border-dashed border-neutral-700 bg-[#1c1c1c]/30 rounded-2xl text-neutral-500 font-medium text-lg">
                Awaiting input prompt...
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="h-full min-h-[400px] w-full flex items-center justify-center border border-neutral-800 bg-[#1c1c1c]/40 rounded-2xl animate-pulse">
                <div className="flex items-center space-x-3 text-[#E02424] bg-[#121212] py-4 px-6 rounded-xl border border-neutral-800/50 shadow-sm">
                  <div className="w-2.5 h-2.5 bg-[#E02424] rounded-full animate-bounce" />
                  <div className="w-2.5 h-2.5 bg-[#E02424] rounded-full animate-bounce delay-75" />
                  <div className="w-2.5 h-2.5 bg-[#E02424] rounded-full animate-bounce delay-150" />
                  <span className="font-medium text-[15px] tracking-wide ml-3 text-neutral-300">Agents collaborating in backend...</span>
                </div>
              </div>
            )}

            {/* Results State */}
            {result && !loading && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                
                {/* 1. Product Management Output */}
                {result.requirements && (
                  <section className="bg-[#1c1c1c] p-8 rounded-2xl border border-neutral-800 shadow-xl">
                    <h2 className="text-xl font-bold text-[#E02424] mb-6 flex items-center gap-2">
                      <span className="bg-[#E02424]/10 p-2 rounded-lg"></span> Product Scope
                    </h2>
                    <div className="space-y-5">
                      <div>
                        <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-1">Target Audience</h3>
                        <p className="text-[15px] text-neutral-200 leading-relaxed">{result.requirements.target_audience}</p>
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2">Core Features</h3>
                        <ul className="space-y-2">
                          {result.requirements.core_features?.map((f, i) => (
                            <li key={i} className="flex items-start text-[15px] text-neutral-200">
                              <span className="text-[#E02424] mr-3 mt-0.5">▹</span> {f}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </section>
                )}

                {/* 2. Implementation Timeline Output (MOVED UP) */}
                {result.timeline && (
                  <section className="bg-[#1c1c1c] p-8 rounded-2xl border border-neutral-800 shadow-xl">
                    <h2 className="text-xl font-bold text-[#E02424] mb-6 flex items-center gap-2">
                      <span className="bg-[#E02424]/10 p-2 rounded-lg"></span> Execution Roadmap
                    </h2>
                    <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-neutral-800 before:to-transparent">
                      {result.timeline.map((m, i) => (
                        <div key={i} className="relative flex items-center justify-between md:justify-normal md:even:flex-row-reverse group is-active">
                          <div className="flex items-center justify-center w-5 h-5 rounded-full border-4 border-[#121212] bg-[#E02424] text-slate-500 shadow shrink-0 md:order-1 md:group-even:-translate-x-1/2 md:group-odd:translate-x-1/2" />
                          <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] bg-[#121212] p-5 rounded-xl border border-neutral-800 hover:border-neutral-600 transition-colors">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-bold text-white text-[15px]">{m.phase}</h4>
                              <span className="bg-[#E02424]/10 text-[#E02424] text-xs font-bold px-2 py-1 rounded-md">
                                {m.estimated_days} Days
                              </span>
                            </div>
                            <ul className="space-y-1.5 mt-3">
                              {m.deliverables.map((d, idx) => (
                                <li key={idx} className="text-sm text-neutral-400 flex items-start">
                                  <span className="text-neutral-600 mr-2">-</span> {d}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* 3. Architectural Strategy Output (MOVED DOWN) */}
                {result.architecture && (
                  <section className="bg-[#1c1c1c] p-8 rounded-2xl border border-neutral-800 shadow-xl">
                    <h2 className="text-xl font-bold text-[#E02424] mb-6 flex items-center gap-2">
                      <span className="bg-[#E02424]/10 p-2 rounded-lg"></span> System Architecture
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="bg-[#121212] p-4 rounded-xl border border-neutral-800">
                        <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Frontend</span>
                        <p className="text-sm font-semibold text-neutral-100 mt-1">{result.architecture.frontend_stack}</p>
                      </div>
                      <div className="bg-[#121212] p-4 rounded-xl border border-neutral-800">
                        <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Backend</span>
                        <p className="text-sm font-semibold text-neutral-100 mt-1">{result.architecture.backend_stack}</p>
                      </div>
                      <div className="bg-[#121212] p-4 rounded-xl border border-neutral-800">
                        <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Database</span>
                        <p className="text-sm font-semibold text-neutral-100 mt-1">{result.architecture.database_recommendation}</p>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2">Data Flow</h3>
                      <p className="text-[15px] text-neutral-300 leading-relaxed">{result.architecture.high_level_architecture}</p>
                    </div>
                  </section>
                )}

              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}