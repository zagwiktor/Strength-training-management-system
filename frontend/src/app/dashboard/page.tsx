'use client'
import axios, { AxiosError, AxiosResponse } from "axios";
import NavBar from "../_components/navbar"
import { useEffect, useState } from "react";
import { Box } from "@mui/material";
import FirstPlanCreator from "./_components/first-plan-creator";
import SetMainPlan from "./_components/set-main-plan";
import { StyledBoxShadow } from "../_components/styled-components";

const apiClient = axios.create({
    baseURL: 'http://localhost:3000/',
    withCredentials: true
});

interface Exercise {
    id: number;
    name: string;
    description: string;
    sets: number;
    reps: number;
    tempo: [number, number, number, number]; 
    load: number;
}

interface TrainingPlan {
    id: number;
    name: string;
    description: string;
    dateCreated: string;  
    mainPlan: boolean;
    exercises: Exercise[]; 
}

interface TrainingPlanResponse {
    data: TrainingPlan;
}

const Dashboard = () => {
    const [mainTrainingPlan, setMainTrainingPlan] = useState<TrainingPlan>();
    const [trainingPlans, setTrainingPlans] = useState<TrainingPlan>();
    const elementToDisplay = null;
    const getMainPlan = async () => {
        await apiClient.get('training-plan/getMainPlan').then((response: AxiosResponse<TrainingPlanResponse>) => {
            setMainTrainingPlan(response.data.data);
        }).catch((errors: AxiosError) => {
            console.log(errors);
        })
    }
    const getPlans = async () => {
        apiClient.get('training-plan/get').then((response: AxiosResponse<TrainingPlanResponse>) => {
            setTrainingPlans(response.data.data)
            console.log(response.data.data)
        }).catch((errors: AxiosError) => {
            console.log(errors);
        })
    }

    useEffect(() => {
        getMainPlan();
        getPlans();
    }, [])
    return (
        <>
            <NavBar/>
            <div className="container-center">
            {mainTrainingPlan && mainTrainingPlan?.id ? (
                <StyledBoxShadow>
                    <h2>{mainTrainingPlan.name}</h2>
                    <hr/>
                    <h3>Exercises</h3>
                    <p>dane z ćwiczenia</p>
                </StyledBoxShadow>
            ) : trainingPlans ? (
                <SetMainPlan />
            ) : (
                <FirstPlanCreator />
            )}
            </div>
        </>
    )
};

export default Dashboard;