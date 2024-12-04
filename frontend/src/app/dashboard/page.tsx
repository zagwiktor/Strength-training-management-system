'use client';
import axios, { AxiosError, AxiosResponse } from 'axios';
import NavBar from '../_components/navbar';
import React, { useEffect, useState } from 'react';
import { Autocomplete, Box, Collapse, FormControlLabel, Switch, TextField } from '@mui/material';
import { ExerciseBox, IconArrowBox, StyledBoxShadow, TrainingUnitBox, TrainingUnitBoxContainer } from './_components/styled-components';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { SortedExercises, SortedExercisesTrainingUnit, TrainingPlan, TrainingUnit } from './types'
import { StyledHr } from './_components/styled-components'
import { useRouter, useSearchParams } from 'next/navigation';

const apiClient = axios.create({
  baseURL: 'http://localhost:3000/',
  withCredentials: true,
});

const Dashboard = () => {
    const [mainTrainingPlan, setMainTrainingPlan] = useState<TrainingPlan>();
    const [trainingPlans, setTrainingPlans] = useState<TrainingPlan[]>();
    const [sortedExercisesInUnit, setSortedExercisesInUnit] = useState<SortedExercisesTrainingUnit[]>([]);
    const [expandedExercises, setExpandedExercises] = useState<Record<string, boolean>>({});
    const [selectedPlan, setSelectedPlan] = useState<TrainingPlan | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const [infoPlanCreated, setInfoPlanCreated] = useState<string | null>(null);
    const searchParams = useSearchParams();
    const createdPlan = searchParams.get('plan');

    const getMainPlan = async () => {
      await apiClient.get('training-plan/getMainPlan').then((response: AxiosResponse) => {
        const trainingPlan = response.data;    
        if (trainingPlan && Array.isArray(trainingPlan.trainingUnits)) {
            setMainTrainingPlan(trainingPlan);
            const sortedData = trainingPlan.trainingUnits.map((unit: TrainingUnit) => {
                const sortedExercises = unit.orderedExercises
                  .map(orderItem => {
                      const exercise = unit.exercises.find(ex => ex.id === orderItem.pkOfExercise);
                      return { exercise: exercise, order: orderItem.order };
                  })
                  .sort((a, b) => a.order - b.order);
                return { trainingUnitId: unit.id, SortedExercises: sortedExercises };
            });
            setSortedExercisesInUnit(sortedData);
        }
      });
    }

    const getPlans = async () => {
        await apiClient.get('training-plan/get').then((response: AxiosResponse) => {
            const plans = response.data;
            if(plans && Array.isArray(plans) && plans.length > 0){
              setTrainingPlans(plans);
            } else {
              router.push('training-plan-creator');
            }
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
      const fetchData = async () => {
          await getMainPlan();
          await getPlans();
          if (createdPlan) { 
            setInfoPlanCreated(createdPlan);
          }
          setIsLoading(false);

      };
      fetchData();
  }, []);
  
  if (isLoading) {
      return <div>Loading...</div>;  
  }
    const handleSetNewMainPlan = async (newValue: any) => {
        if(newValue){
            await updateMainPlan(newValue.id);
            setSelectedPlan(newValue);
            await getMainPlan();
        }
    } 

    const handleUpExercise = (trainingUnitId: number, exerciseId: number) => {
      setSortedExercisesInUnit((prev) => {
          return prev.map((unit) => {
              if (unit.trainingUnitId === trainingUnitId) {
                  const index = unit.SortedExercises.findIndex((ex) => ex.exercise.id === exerciseId);
                  if (index > 0) {
                      const updatedExercises = [...unit.SortedExercises];
                      [updatedExercises[index], updatedExercises[index - 1]] = [updatedExercises[index - 1], updatedExercises[index]];
                      updatedExercises[index].order = index;
                      updatedExercises[index - 1].order = index - 1;
                      updatePlanOrder(trainingUnitId, updatedExercises);
                      return { ...unit, SortedExercises: updatedExercises };
                  }
              }
              return unit;
          });
      });
    };

    const handleDownExercise = (trainingUnitId: number, exerciseId: number) => {
      setSortedExercisesInUnit((prev) => {
          return prev.map((unit) => {
              if (unit.trainingUnitId === trainingUnitId) {
                  const index = unit.SortedExercises.findIndex((ex) => ex.exercise.id === exerciseId);
                  if (index >= 0 && index < unit.SortedExercises.length - 1) {
                      const updatedExercises = [...unit.SortedExercises];
                      [updatedExercises[index], updatedExercises[index + 1]] = [updatedExercises[index + 1], updatedExercises[index]];
                      updatedExercises[index].order = index;
                      updatedExercises[index + 1].order = index + 1;
                      updatePlanOrder(trainingUnitId, updatedExercises);
                      console.log(updatedExercises)
                      return { ...unit, SortedExercises: updatedExercises };
                  }
              }
              return unit;
          });
      });
  };

  const updatePlanOrder = async (trainingUnitId: number, sortedExercises: SortedExercises[]) => {
    const data = sortedExercises.map((exercise) => ({
        order: exercise.order,
        pkOfExercise: exercise.exercise.id,
    }));
    const requestData = {"orderedExercisesUpdated": data};
    await apiClient.patch(`training-units/update/${trainingUnitId}`, requestData);
    console.log(`data: ${data}`)
  };

    const mainTrainingPlanSelector = (
        <Box sx={{margin: "70px 0 20px 0"}}>
            <h3>Choose active training plan</h3>
            <Autocomplete
                options={trainingPlans || []}
                getOptionLabel={(option) => option.name} 
                renderInput={(params) => (
                  <TextField {...params} label="Choose a training plan" variant="outlined" />
                )}
                value={selectedPlan} 
                onChange={(event, newValue) => handleSetNewMainPlan(newValue)}
                isOptionEqualToValue={(option, value) => option.id === value?.id}
            />
            {infoPlanCreated ? (
              <Box sx={{display: 'block' , textAlign: 'center'}}>
                <p style={{ fontSize: '12px', color: 'green'}}>{infoPlanCreated} has been created!</p>
              </Box>
            ) : (null)}
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
                          {mainTrainingPlan.trainingUnits.map((trainingUnit, unitIndex) => (
                            <TrainingUnitBox key={trainingUnit.id}>
                              <p>{`${unitIndex + 1}. ${trainingUnit.name}`}</p>
                              {trainingUnit.description && <p>{trainingUnit.description}</p>}
                              <StyledHr />
                              {sortedExercisesInUnit
                                .find(unit => unit.trainingUnitId === trainingUnit.id)
                                ?.SortedExercises.map((sortedExercise, exerciseIndex) => {
                                  const { exercise } = sortedExercise;
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
                                            {exerciseIndex > 0 ? (
                                              <IconArrowBox
                                              onClick={() => handleUpExercise(trainingUnit.id, exercise.id)}
                                              >
                                                <ArrowDropUpIcon />
                                              </IconArrowBox>
                                            ) : null}
                                            {exerciseIndex < sortedExercisesInUnit.length - 1 ? (
                                              <IconArrowBox
                                              onClick={() => handleDownExercise(trainingUnit.id, exercise.id)}
                                              >
                                                <ArrowDropDownIcon />
                                              </IconArrowBox>
                                            ) : null}            
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
                                          {exercise.description && <p>{exercise.description}</p>}
                                          <p>Sets: {exercise.sets}</p>
                                          <p>Reps: {exercise.reps}</p>
                                          {exercise.tempo && <p>Tempo: {exercise.tempo.join('-')}</p>}
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
              null
            )}
            </div>
        </>
    )
};

export default Dashboard;