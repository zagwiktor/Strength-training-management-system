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

interface ExercisesResponse {
    data: Exercise[];
}

interface Category {
    id: number;
    name: string;
    exercises?: Exercise[];
}

interface CategoriesResponse {
    data: Category[];
}

interface TrainingUnit {
    name: string;
    description?: string;
    exercises: Exercise[] | [];
}

interface ExerciseDataForm {
    name: string;   
    description?: string;   
    sets: number;   
    reps: number;   
    tempo?: string; 
    load?: number;  
    categories: number[];
}