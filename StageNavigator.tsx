import React from 'react';
import { AppStage } from '../types';
import { ChevronRight, CheckCircle, Circle } from 'lucide-react';

interface Props {
  currentStage: AppStage;
}

const STAGES = [
  { id: AppStage.PROBLEM_DEFINITION, label: 'Problem' },
  { id: AppStage.MODEL_CONSTRUCTION, label: 'Modeling' },
  { id: AppStage.DATA_GENERATION, label: 'Simulation' },
  { id: AppStage.ESTIMATION_ANALYSIS, label: 'Analysis' },
  { id: AppStage.COUNTERFACTUAL, label: 'Counterfactual' },
];

export const StageNavigator: React.FC<Props> = ({ currentStage }) => {
  const currentIndex = STAGES.findIndex(s => s.id === currentStage);

  return (
    <div className="w-full bg-white border-b border-slate-200 py-4 px-6 mb-6 overflow-x-auto">
      <div className="flex items-center justify-between min-w-[600px] max-w-5xl mx-auto">
        {STAGES.map((stage, index) => {
          const isActive = index === currentIndex;
          const isCompleted = index < currentIndex;

          return (
            <div key={stage.id} className="flex items-center flex-1 last:flex-none">
              <div className={`flex items-center ${isActive ? 'text-indigo-600 font-bold' : isCompleted ? 'text-green-600' : 'text-slate-400'}`}>
                {isCompleted ? (
                  <CheckCircle className="w-6 h-6 mr-2" />
                ) : (
                  <Circle className={`w-6 h-6 mr-2 ${isActive ? 'fill-indigo-50' : ''}`} />
                )}
                <span className="text-sm whitespace-nowrap">{stage.label}</span>
              </div>
              {index < STAGES.length - 1 && (
                <div className={`h-[2px] w-full mx-4 ${isCompleted ? 'bg-green-500' : 'bg-slate-200'}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
