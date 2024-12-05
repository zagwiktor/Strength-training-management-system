export interface Exercise {
    id: number;
    name: string;
    description?: string;
    sets: number;
    reps: number;
    tempo?: [number, number, number, number];
    load?: number;
    categories?: Category[];
  }
  
export interface Category {
  id: number;
  name: string;
}

export interface SortedExercises {
  exercise: Exercise;
  order: number;
}
export interface SortedExercisesTrainingUnit {
  trainingUnitId: number,
  SortedExercises: SortedExercises[]
}

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

export interface TrainingPlanEditForm {
  name: string,
  description?: string;
}
  

  