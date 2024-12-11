export interface User {
    id: number;
    name: string;
    surname: string;
    email: string;
    weight: number;
    height: number;
    gender: 'Male' | 'Female'; 
}

export interface UserUpdateForm {
    name?: string | null;
    surname?: string | null;
    email?: string | null;
    password?: string | null | undefined;
    password2?: string | null | undefined;
    weight?: number | null;
    height?: number | null;
    gender?: 'Male' | 'Female'; 
}