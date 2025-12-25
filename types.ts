// Define the stages of the QSE workflow
export enum AppStage {
  PROBLEM_DEFINITION = 'PROBLEM_DEFINITION',
  MODEL_CONSTRUCTION = 'MODEL_CONSTRUCTION',
  DATA_GENERATION = 'DATA_GENERATION',
  ESTIMATION_ANALYSIS = 'ESTIMATION_ANALYSIS',
  COUNTERFACTUAL = 'COUNTERFACTUAL'
}

// Structure for a spatial location in the model
export interface LocationData {
  id: string;
  name: string;
  population: number; // L
  wages: number;      // w
  rents: number;      // r
  amenity: number;    // u or B
  productivity: number; // A
}

// The full dataset response from the AI
export interface SimulationResult {
  description: string;
  locations: LocationData[];
  parameters: {
    [key: string]: number; // e.g., alpha (housing share), sigma (elasticity), etc.
  };
  totalWelfare?: number;
}

export interface Message {
  role: 'user' | 'model' | 'system';
  content: string;
  isThinking?: boolean;
}
