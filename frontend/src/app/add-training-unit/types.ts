

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
  