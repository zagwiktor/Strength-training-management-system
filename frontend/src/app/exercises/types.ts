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