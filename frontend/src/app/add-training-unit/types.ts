

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
  
interface Exercise {
  id: number;
  name: string;
  description: string;
  sets: number;
  reps: number;
  tempo?: [eccentricPhase: number, ePause: number, concentricPhases: number, cPause: number]; 
  load: number;
  categories?: Category[]
}

interface Category {
  id: number;
  name: string;
  exercises?: Exercise[];
}