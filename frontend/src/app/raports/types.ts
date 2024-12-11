export interface Raport {
    id: number;
    dateCreated: string; 
    weight: number; 
    chestCircuit: number; 
    bicepsCircuit: number; 
    thighCircuit: number; 
    waistCircuit: number; 
    calfCircuit: number; 
    loads?: Record<string, number>; 
};

export interface RaportFormData {
    id?: number | null;
    dateCreated?: string | null; 
    weight?: number | null; 
    chestCircuit?: number | null; 
    bicepsCircuit?: number | null; 
    thighCircuit?: number | null; 
    waistCircuit?: number | null; 
    calfCircuit?: number | null; 
};

export interface TrainingUnit {
    id: number;
    name: string;
    description?: string;
    orderedExercises: { order: number; pkOfExercise: number }[];
    exercises: Exercise[];
  }
  
export interface TrainingPlan {
  id: number;
  name: string;
  description?: string;
  dateCreated: string;
  mainPlan: boolean;
  trainingUnits: TrainingUnit[];
}
  
export interface Exercise {
  id: number;
  name: string;
  description: string;
  sets: number;
  reps: number;
  tempo?: [eccentricPhase: number, ePause: number, concentricPhases: number, cPause: number]; 
  load: number;
  categories?: Category[]
}

export interface Category {
  id: number;
  name: string;
  exercises?: Exercise[];
}