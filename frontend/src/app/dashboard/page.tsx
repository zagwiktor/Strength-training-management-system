'use client';
import axios, { AxiosError, AxiosResponse } from 'axios';
import NavBar from '../_components/navbar';
import React, { useEffect, useState } from 'react';
import { Autocomplete, Box, Collapse, FormControlLabel, Switch, TextField } from '@mui/material';
import FirstPlanCreator from './_components/first-plan-creator';
import { ExerciseBox, IconArrowBox, StyledBoxShadow, TrainingUnitBox, TrainingUnitBoxContainer } from './_components/styled-components';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { SortedExercises, TrainingPlan } from './types'
import { StyledHr } from './_components/styled-components'

const apiClient = axios.create({
  baseURL: 'http://localhost:3000/',
  withCredentials: true,
});



const Dashboard = () => {
    const [mainTrainingPlan, setMainTrainingPlan] = useState<TrainingPlan>();
    const [trainingPlans, setTrainingPlans] = useState<TrainingPlan>();
    const [sortedExercises, setSortedExercises] = useState<SortedExercises[]>();
    const [expandedExercises, setExpandedExercises] = useState<Record<string, boolean>>({});
    const [selectedPlan, setSelectedPlan] = useState<TrainingPlan | null>(null);

    const getMainPlan = async () => {
        await apiClient.get('training-plan/getMainPlan').then((response: AxiosResponse) => {
            const trainingPlan = response.data;   
            console.log(trainingPlan)       
            setMainTrainingPlan(trainingPlan);
        }).catch((errors: AxiosError) => {
            console.log(errors);
        });
    }

    const getPlans = async () => {
        await apiClient.get('training-plan/get').then((response: AxiosResponse) => {
            setTrainingPlans(response.data);
        }).catch((errors: AxiosError) => {
            console.log(errors);
        })
    }

    const updateMainPlan = async (id: number) => {
        await apiClient.patch(`training-plan/update/${id}`, {"mainPlan" : true});
    }

    const handleToggle = (trainingUnitId: number, exerciseId: number) => {
        const key = `${trainingUnitId}-${exerciseId}`;
        setExpandedExercises((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    useEffect(() => {
        getMainPlan();
        getPlans();
    }, [])

    const handleSetNewMainPlan = async (newValue: any) => {
        if(newValue){
            await updateMainPlan(newValue.id);
            setSelectedPlan(newValue);
            await getMainPlan();
        }
    } 

    const mainTrainingPlanSelector = (
        <Box sx={{marginBottom: "20px"}}>
            <h3>Choose active training plan</h3>
            <Autocomplete
                options={trainingPlans}
                getOptionLabel={(option) => option.name} 
                renderInput={(params) => (
                  <TextField {...params} label="Choose a training plan" variant="outlined" />
                )}
                value={selectedPlan} 
                onChange={(event, newValue) => handleSetNewMainPlan(newValue)}
                isOptionEqualToValue={(option, value) => option.id === value?.id}
            />
        </Box>
    );

    return (
        <>
            <NavBar/>
            <div className="container-center">
            {mainTrainingPlan && Array.isArray(trainingPlans) && mainTrainingPlan?.id ? (
                <>
                    {mainTrainingPlanSelector}
                    <StyledBoxShadow>
                      <h2>{mainTrainingPlan.name}</h2>
                      <hr />
                      <h3>Exercises</h3>
                      {mainTrainingPlan.trainingUnits &&
                      Array.isArray(mainTrainingPlan.trainingUnits) &&
                      mainTrainingPlan.trainingUnits.length > 0 ? (
                        <TrainingUnitBoxContainer>
                          {mainTrainingPlan.trainingUnits.map((trainingUnit, index) => (
                            <TrainingUnitBox key={trainingUnit.id}>
                              <p>{`${index + 1}. ${trainingUnit.name}`}</p>
                              {trainingUnit.description ? <p>{trainingUnit.description}</p> : null}
                              <StyledHr />
                              {trainingUnit.exercises?.map((exercise) => {
                                const key = `${trainingUnit.id}-${exercise.id}`;
                                return (
                                  <ExerciseBox key={key}>
                                    <Box>
                                      <Box
                                        sx={{
                                          display: 'flex',
                                          justifyContent: 'space-between',
                                          alignItems: 'center',
                                        }}
                                      >
                                        <h4>{exercise.name}</h4>
                                        <Box>
                                          <IconArrowBox onClick={() => handleUpExercise(exercise.id)}>
                                            <ArrowDropUpIcon />
                                          </IconArrowBox>
                                          <IconArrowBox onClick={() => handleDownExercise(exercise.id)}>
                                            <ArrowDropDownIcon />
                                          </IconArrowBox>
                                        </Box>
                                      </Box>
                                      <Box>
                                        <FormControlLabel
                                          control={
                                            <Switch
                                              checked={!!expandedExercises[key]}
                                              onChange={() => handleToggle(trainingUnit.id, exercise.id)}
                                            />
                                          }
                                          label="Show details"
                                        />
                                      </Box>
                                      <Collapse in={!!expandedExercises[key]}>
                                        {exercise.description ? <p>{exercise.description}</p> : null}
                                        <p>Sets: {exercise.sets}</p>
                                        <p>Reps: {exercise.reps}</p>
                                        {exercise.tempo ? <p>Tempo: {exercise.tempo.join('-')}</p> : null}
                                      </Collapse>
                                    </Box>
                                  </ExerciseBox>
                                );
                              })}
                            </TrainingUnitBox>
                          ))}
                        </TrainingUnitBoxContainer>
                      ) : (
                        <TrainingUnitBox>
                          <p>You haven't added any training unit yet.</p>
                        </TrainingUnitBox>
                      )}
                    </StyledBoxShadow>
                </>
            ) : trainingPlans && Array.isArray(trainingPlans) && trainingPlans.length > 0 ? (
                <StyledBoxShadow>
                    {mainTrainingPlanSelector}
                </StyledBoxShadow>
            ) : (
                <FirstPlanCreator />
            )}
            </div>
        </>
    )
};

export default Dashboard;