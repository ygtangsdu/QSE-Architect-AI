import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { 
  AppStage, 
  SimulationResult 
} from './types';
import { 
  generateModelLogic, 
  generateSyntheticData, 
  runCounterfactual,
  analyzeEquilibrium 
} from './services/geminiService';
import { StageNavigator } from './components/StageNavigator';
import { DataVisualizer } from './components/DataVisualizer';
import { 
  BrainCircuit, 
  ArrowRight, 
  Sparkles, 
  Calculator, 
  RefreshCcw, 
  Terminal,
  Play,
  FileText,
  Eye,
  Code
} from 'lucide-react';

const App: React.FC = () => {
  // State
  const [stage, setStage] = useState<AppStage>(AppStage.PROBLEM_DEFINITION);
  const [problemInput, setProblemInput] = useState<string>("Analyze the impact of a productivity shock in the largest city on population distribution.");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [modelLogic, setModelLogic] = useState<string>("");
  const [baselineData, setBaselineData] = useState<SimulationResult | null>(null);
  const [analysisReport, setAnalysisReport] = useState<string>("");
  const [counterfactualInput, setCounterfactualInput] = useState<string>("Increase productivity in City A by 20%");
  const [counterfactualData, setCounterfactualData] = useState<SimulationResult | null>(null);
  
  // UI State
  const [viewMode, setViewMode] = useState<'formatted' | 'latex'>('formatted');
  
  // Handlers
  const handleProblemSubmit = async () => {
    if (!problemInput.trim()) return;
    setIsProcessing(true);
    try {
      const logic = await generateModelLogic(problemInput);
      setModelLogic(logic);
      setStage(AppStage.MODEL_CONSTRUCTION);
    } catch (error) {
      alert("Error generating model. Please check API key or try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGenerateData = async () => {
    setIsProcessing(true);
    try {
      const data = await generateSyntheticData(modelLogic);
      setBaselineData(data);
      setStage(AppStage.DATA_GENERATION);
    } catch (error) {
      alert("Error simulating data.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleProceedToAnalysis = async () => {
    if (!baselineData) return;
    setIsProcessing(true);
    try {
        if (!analysisReport) {
            const report = await analyzeEquilibrium(modelLogic, baselineData);
            setAnalysisReport(report);
        }
        setStage(AppStage.ESTIMATION_ANALYSIS);
    } catch (error) {
        alert("Error generating analysis report.");
    } finally {
        setIsProcessing(false);
    }
  };

  const handleProceedToCounterfactual = () => {
      setStage(AppStage.COUNTERFACTUAL);
  }

  const handleRunCounterfactual = async () => {
    if (!baselineData || !counterfactualInput.trim()) return;
    setIsProcessing(true);
    try {
      const cfData = await runCounterfactual(baselineData, counterfactualInput);
      setCounterfactualData(cfData);
    } catch (error) {
      alert("Error running counterfactual.");
    } finally {
      setIsProcessing(false);
    }
  };

  // UI Components helpers
  const renderLoading = (text: string) => (
    <div className="flex flex-col items-center justify-center p-12 text-slate-500 animate-pulse">
      <BrainCircuit className="w-12 h-12 mb-4 text-indigo-500 animate-bounce" />
      <p className="text-lg font-medium">{text}</p>
      <p className="text-sm mt-2">Gemini 3 Pro is thinking deeply...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Calculator className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">QSE Architect AI</h1>
          </div>
          <div className="text-xs text-slate-500 font-medium px-3 py-1 bg-slate-100 rounded-full border border-slate-200">
            Powered by Gemini 3 Pro
          </div>
        </div>
      </header>

      {/* Navigator */}
      <StageNavigator currentStage={stage} />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* 1. Problem Definition */}
        {stage === AppStage.PROBLEM_DEFINITION && (
          <div className="max-w-2xl mx-auto mt-12">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Define Your Research Question</h2>
              <p className="text-slate-600 mb-6">Describe the spatial economic problem you want to model. The AI will structure the equilibrium conditions for you.</p>
              
              <textarea
                value={problemInput}
                onChange={(e) => setProblemInput(e.target.value)}
                className="w-full h-40 p-4 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none text-slate-700 text-lg"
                placeholder="E.g., How does a transport subsidy in rural areas affect urban agglomeration?"
              />
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleProblemSubmit}
                  disabled={isProcessing}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <>Thinking...</>
                  ) : (
                    <>
                      Build Model <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
              {isProcessing && renderLoading("Deriving equations and market clearing conditions...")}
            </div>
          </div>
        )}

        {/* 2. Model Construction (View Logic) */}
        {stage === AppStage.MODEL_CONSTRUCTION && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
             <div className="lg:col-span-2 space-y-6">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 flex flex-col min-h-[500px]">
                  <div className="flex items-center justify-between mb-6">
                     <h2 className="text-2xl font-bold text-slate-900">Model Specification</h2>
                     <div className="flex bg-slate-100 p-1 rounded-lg">
                        <button 
                           onClick={() => setViewMode('formatted')}
                           className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'formatted' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                           <Eye className="w-4 h-4" /> Formatted
                        </button>
                        <button 
                           onClick={() => setViewMode('latex')}
                           className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'latex' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                           <Code className="w-4 h-4" /> LaTeX Source
                        </button>
                     </div>
                  </div>
                  
                  {viewMode === 'formatted' ? (
                     <div className="prose prose-slate max-w-none prose-headings:text-slate-800 prose-p:text-slate-600 prose-pre:bg-slate-800 prose-pre:text-white">
                        <ReactMarkdown 
                           remarkPlugins={[remarkMath]} 
                           rehypePlugins={[rehypeKatex]}
                        >
                           {modelLogic}
                        </ReactMarkdown>
                     </div>
                  ) : (
                     <div className="relative flex-1">
                        <div className="whitespace-pre-wrap font-mono text-sm bg-slate-900 text-slate-200 p-6 rounded-lg border border-slate-700 overflow-x-auto h-full max-h-[600px] overflow-y-auto">
                           {modelLogic}
                        </div>
                     </div>
                  )}
                </div>
             </div>
             
             <div className="space-y-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                   <h3 className="text-lg font-semibold text-slate-900 mb-4">Next Steps</h3>
                   <p className="text-slate-600 text-sm mb-6">
                     The AI has theoretically defined the preferences, technology, and spatial equilibrium conditions. 
                     We can now calibrate this model with synthetic data to visualize the equilibrium.
                   </p>
                   <button
                    onClick={handleGenerateData}
                    disabled={isProcessing}
                    className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
                   >
                     {isProcessing ? "Simulating..." : "Generate Synthetic Data"}
                     {!isProcessing && <Sparkles className="w-4 h-4" />}
                   </button>
                   {isProcessing && renderLoading("Solving for equilibrium wages and rents...")}
                </div>
             </div>
          </div>
        )}

        {/* 3. Data & Estimation Analysis */}
        {(stage === AppStage.DATA_GENERATION || stage === AppStage.ESTIMATION_ANALYSIS) && baselineData && (
          <div className="mt-8 space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900">Baseline Equilibrium</h2>
               {stage === AppStage.DATA_GENERATION && !isProcessing && (
                   <button 
                    onClick={handleProceedToAnalysis}
                    className="flex items-center gap-2 text-indigo-600 font-semibold hover:text-indigo-800"
                   >
                     Proceed to Analysis <ArrowRight className="w-5 h-5"/>
                   </button>
               )}
            </div>

            {isProcessing && stage === AppStage.DATA_GENERATION && renderLoading("Generating economic analysis report...")}

            <DataVisualizer data={baselineData.locations} title="Spatial Distribution of Economic Activity" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Total Welfare</h4>
                    <p className="text-3xl font-bold text-slate-900">
                        {baselineData.totalWelfare ? baselineData.totalWelfare.toLocaleString() : "N/A"}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">Aggregated utility index</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Housing Share (α)</h4>
                    <p className="text-3xl font-bold text-slate-900">
                        {baselineData.parameters?.alpha || "0.30"}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">Calibrated parameter</p>
                </div>
                 <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Elasticity (σ)</h4>
                    <p className="text-3xl font-bold text-slate-900">
                        {baselineData.parameters?.sigma || "4.0"}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">Substitution elasticity</p>
                </div>
            </div>

            {stage === AppStage.ESTIMATION_ANALYSIS && (
               <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
                  <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                      <FileText className="w-6 h-6 text-indigo-600" />
                      Structural Analysis & Model Fit
                  </h3>
                  <div className="prose prose-slate max-w-none">
                     <ReactMarkdown 
                           remarkPlugins={[remarkMath]} 
                           rehypePlugins={[rehypeKatex]}
                        >
                           {analysisReport}
                        </ReactMarkdown>
                  </div>
                  <div className="flex justify-end pt-8 mt-8 border-t border-slate-100">
                    <button
                        onClick={handleProceedToCounterfactual}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-semibold shadow-md transition-all hover:scale-105 flex items-center gap-2"
                    >
                        Run Counterfactual Analysis <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
               </div>
            )}
          </div>
        )}

        {/* 4. Counterfactual Analysis */}
        {stage === AppStage.COUNTERFACTUAL && baselineData && (
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Sidebar Controls */}
            <div className="lg:col-span-4 space-y-6">
               <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 sticky top-24">
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                     <Terminal className="w-5 h-5 text-slate-500"/>
                     Scenario Configuration
                  </h3>
                  <div className="mb-4">
                      <label className="block text-sm font-medium text-slate-700 mb-2">Describe Shock</label>
                      <textarea 
                        className="w-full p-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none h-32 resize-none"
                        value={counterfactualInput}
                        onChange={(e) => setCounterfactualInput(e.target.value)}
                      />
                  </div>
                  <button 
                    onClick={handleRunCounterfactual}
                    disabled={isProcessing}
                    className="w-full bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isProcessing ? "Computing Equilibrium..." : "Run Simulation"}
                    {!isProcessing && <Play className="w-4 h-4" fill="currentColor" />}
                  </button>

                  <div className="mt-6 pt-6 border-t border-slate-100">
                    <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">Model Parameters</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="bg-slate-50 p-2 rounded">
                            <span className="block text-slate-500 text-xs">Housing Share</span>
                            <span className="font-mono">{baselineData.parameters?.alpha}</span>
                        </div>
                        <div className="bg-slate-50 p-2 rounded">
                            <span className="block text-slate-500 text-xs">Elasticity</span>
                            <span className="font-mono">{baselineData.parameters?.sigma}</span>
                        </div>
                    </div>
                  </div>
               </div>
            </div>

            {/* Results */}
            <div className="lg:col-span-8 space-y-6">
               {isProcessing ? (
                   renderLoading("Re-optimizing agents locations and clearing markets...")
               ) : counterfactualData ? (
                   <>
                      <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl text-emerald-800 text-sm">
                         <strong>Analysis:</strong> {counterfactualData.description}
                      </div>
                      <DataVisualizer 
                        data={baselineData.locations} 
                        comparisonData={counterfactualData.locations}
                        title="Comparative Statics: Baseline vs Counterfactual"
                      />
                      
                      <div className="grid grid-cols-2 gap-4">
                         <div className="bg-white p-4 rounded-xl border border-slate-200">
                            <div className="text-slate-500 text-sm mb-1">Baseline Welfare</div>
                            <div className="text-xl font-bold">{baselineData.totalWelfare?.toLocaleString()}</div>
                         </div>
                         <div className="bg-white p-4 rounded-xl border border-slate-200">
                            <div className="text-slate-500 text-sm mb-1">Counterfactual Welfare</div>
                            <div className={`text-xl font-bold ${(counterfactualData.totalWelfare || 0) > (baselineData.totalWelfare || 0) ? 'text-green-600' : 'text-red-600'}`}>
                                {counterfactualData.totalWelfare?.toLocaleString()}
                            </div>
                         </div>
                      </div>
                   </>
               ) : (
                   <div className="h-full flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl min-h-[400px]">
                       <RefreshCcw className="w-10 h-10 mb-4 opacity-50"/>
                       <p>Run a simulation to see results</p>
                   </div>
               )}
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default App;