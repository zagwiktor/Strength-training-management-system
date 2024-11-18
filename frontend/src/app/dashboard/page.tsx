'use client'
import axios, { AxiosError, AxiosResponse } from "axios";
import NavBar from "../_components/navbar"
import React, { useEffect, useState } from "react";
import { Box, Collapse, FormControlLabel, Switch } from "@mui/material";
import FirstPlanCreator from "./_components/first-plan-creator";
import SetMainPlan from "./_components/set-main-plan";
import { ExerciseBox, IconArrowBox, StyledBoxShadow } from "./_components/styled-components";
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

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

interface SortedExercises {
    exercise: Exercise,
    order: number
}

interface TrainingPlan {
    id: number;
    name: string;
    description: string;
    dateCreated: string;  
    mainPlan: boolean;
    orderedExercises: { order: number, pkOfExercise: number }[]; 
    exercises: Exercise[];
}

interface TrainingPlanResponse {
    data: TrainingPlan;
}

const Dashboard = () => {
    const [mainTrainingPlan, setMainTrainingPlan] = useState<TrainingPlan>();
    const [trainingPlans, setTrainingPlans] = useState<TrainingPlan>();
    const [sortedExercises, setSortedExercises] = useState<SortedExercises[]>();
    const [expandedExercises, setExpandedExercises] = useState<{ [key: number]: boolean }>({});

    const getMainPlan = async () => {
        await apiClient.get('training-plan/getMainPlan').then((response: AxiosResponse<TrainingPlanResponse>) => {
            const trainingPlan = response.data.data;
            setMainTrainingPlan(trainingPlan);
            const sortedExercises = trainingPlan.orderedExercises
                .map(orderItem => {
                    const exercise = trainingPlan.exercises.find(ex => ex.id === orderItem.pkOfExercise);
                    return { exercise: exercise, order: orderItem.order };
                })
                .sort((a, b) => a.order - b.order);
            setSortedExercises(sortedExercises as SortedExercises[]);
        }).catch((errors: AxiosError) => {
            console.log(errors);
        });
    }
    const getPlans = async () => {
        apiClient.get('training-plan/get').then((response: AxiosResponse<TrainingPlanResponse>) => {
            setTrainingPlans(response.data.data)
        }).catch((errors: AxiosError) => {
            console.log(errors);
        })
    }

    const updatePlan = async (orderedExercises: { order: number, pkOfExercise: number }[]) => {
        apiClient.patch(`training-plan/update/${mainTrainingPlan?.id}`, {"orderedExercisesUpdated" : orderedExercises})
    }

    const handleUpExercise = (id: number) => {
        if (Array.isArray(sortedExercises)) {
            const index = sortedExercises.findIndex(ex => ex.exercise.id === id);
            if (index > 0) {
                const updatedExercises = [...sortedExercises];
                [updatedExercises[index], updatedExercises[index - 1]] = [updatedExercises[index - 1], updatedExercises[index]];
                updatedExercises[index].order = index;
                updatedExercises[index - 1].order = index - 1;
                setSortedExercises(updatedExercises);
                const data = updatedExercises.map((exercise) => {
                    return {order: exercise.order, pkOfExercise: exercise.exercise.id}
                });
                updatePlan(data)
            }
        }
    };

    const handleDownExercise = (id: number) => {
        if (Array.isArray(sortedExercises)) {
            const index = sortedExercises.findIndex(ex => ex.exercise.id === id);
            if (index >= 0 && index < sortedExercises.length - 1) {
                const updatedExercises = [...sortedExercises];
                [updatedExercises[index], updatedExercises[index + 1]] = [updatedExercises[index + 1], updatedExercises[index]];
                updatedExercises[index].order = index;
                updatedExercises[index + 1].order = index + 1;
                setSortedExercises(updatedExercises);
                const data = updatedExercises.map((exercise) => {
                    return {order: exercise.order, pkOfExercise: exercise.exercise.id}
                });
                updatePlan(data)
            }
        }
    };

    const handleToggle = (id: number) => {
        setExpandedExercises(prevState => ({
          ...prevState,
          [id]: !prevState[id], 
        }));
    };

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
                    <hr />
                    <h3>Exercises</h3>
                    {sortedExercises ? (
                        sortedExercises.map((exercise, index) => (
                            <ExerciseBox key={exercise.exercise.id}>
                                <Box>
                                    <Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <h4>
                                                {index + 1}: {exercise.exercise.name}
                                            </h4>
                                            <Box>
                                                <IconArrowBox onClick={() => handleUpExercise(exercise.exercise.id)}>
                                                    <ArrowDropUpIcon />
                                                </IconArrowBox>
                                                <IconArrowBox onClick={() => handleDownExercise(exercise.exercise.id)}>
                                                    <ArrowDropDownIcon/>
                                                </IconArrowBox>
                                            </Box>
                                        </Box>
                                        <Box>
                                            <FormControlLabel
                                            control={<Switch checked={!!expandedExercises[exercise.exercise.id]} onChange={() => handleToggle(exercise.exercise.id)} />}
                                            label="Show details"
                                            />
                                        </Box>
                                    </Box>
                                        <Collapse in={!!expandedExercises[exercise.exercise.id]}>
                                            <p>{exercise.exercise.description}</p>
                                            <p>Sets: {exercise.exercise.sets}</p>
                                            <p>Reps: {exercise.exercise.reps}</p>
                                            <p>Tempo: {exercise.exercise.tempo}</p>
                                        </Collapse>
                                </Box>
                            </ExerciseBox>
                        ))
                    ) : (
                        null
                    )}
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