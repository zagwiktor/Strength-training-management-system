'use client';
import axios, { AxiosError, AxiosResponse } from 'axios';
import NavBar from '../_components/navbar';
import React, { use, useEffect, useState } from 'react';
import { Autocomplete, Box, Button, Collapse, FormControlLabel, IconButton, Switch, TextField, FormGroup, FormControl, DialogContent, DialogActions, DialogTitle, Dialog} from '@mui/material';
import { ExerciseBox, IconArrowBox, StyledBoxShadow, TrainingUnitBox, TrainingUnitBoxContainer, EditPlanDetailBox} from './_components/styled-components';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { SortedExercises, SortedExercisesTrainingUnit, TrainingPlan, TrainingPlanEditForm, TrainingUnit } from './types'
import { StyledHr } from './_components/styled-components'
import { useRouter, useSearchParams } from 'next/navigation';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import { set, SubmitHandler, useForm } from 'react-hook-form';

const apiClient = axios.create({
  baseURL: 'http://localhost:3000/',
  withCredentials: true,
});

const Dashboard = () => {
  const [mainTrainingPlan, setMainTrainingPlan] = useState<TrainingPlan | null>();
  const [trainingPlans, setTrainingPlans] = useState<TrainingPlan[]>();
  const [sortedExercisesInUnit, setSortedExercisesInUnit] = useState<SortedExercisesTrainingUnit[]>([]);
  const [expandedExercises, setExpandedExercises] = useState<Record<string, boolean>>({});
  const [selectedPlan, setSelectedPlan] = useState<TrainingPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [infoEditPlanDetails, setInfoEditPlanDetails] = useState<string | null>(null);
  const [openDialogPlan, setOpenDialogPlan] = useState(false);
  const [openDialogUnit, setOpenDialogUnit] = useState(false);
  const [unitToDelete, setUnitToDelete] = useState<number | null>(null);
  const [editPlanDetailsVisible, setEditPlanDetailsVisible] = useState<boolean>(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [infoPlanCreated, setInfoPlanCreated] = useState<string | null>(searchParams.get('plan'));
  const {
    register: registerPlanData,
    handleSubmit: handleSubmitPlan,
    formState: { errors: errorsPlan },
    reset: resetPlan,
  } = useForm<TrainingPlanEditForm>();

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

  const handleDeleteClickPlan = () => {
    setOpenDialogPlan(true);
  };

  const clearPlanQueryParam = () => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.delete('plan');
    router.replace(`${window.location.pathname}?${newSearchParams.toString()}`);
  };
  const handleDeleteConfirmPlan = async () => {
    if (mainTrainingPlan) {
        try {
            await apiClient.delete(`/training-plan/delete/${mainTrainingPlan.id}`);
            setMainTrainingPlan(null)
            clearPlanQueryParam()
            setInfoPlanCreated(null);
            await getPlans();
        } catch (error) {
            console.log(error);
        }
    }
    setOpenDialogPlan(false);
  };

  const handleDialogClosePlan = () => {
    setOpenDialogPlan(false);
  };
  const handleEditPlan = (id: number) => {
    router.push(`/edit-training-unit/${id}`);
  };
  const handleDeleteUnit = (id: number) => {
    setUnitToDelete(id);
    setOpenDialogUnit(true);
  };
  const handleDialogCloseUnit = () => {
    setOpenDialogUnit(false);
    setUnitToDelete(null);
  };
  const handleDeleteConfirmUnit = async () => {
    if (unitToDelete === null) return;
    try {
      await apiClient.delete(`training-units/delete/${unitToDelete}`);
      await getMainPlan();
      setOpenDialogUnit(false);
      setUnitToDelete(null);
    } catch (error) {
        console.error('Error deleting training unit:', error);
    }
  };

  const onSubmitPlanEdit: SubmitHandler<TrainingPlanEditForm> = async (data: TrainingPlanEditForm) => {
    console.log(data);
    if (mainTrainingPlan) {
      await apiClient.patch(`/training-plan/update/${mainTrainingPlan.id}`, data)
      .then((response: AxiosResponse) => {
        setEditPlanDetailsVisible(false);
        getMainPlan();
        getPlans();
      })
      .catch((error: AxiosError) => {
        setInfoEditPlanDetails("An error occurred while updating the training plan details.");
      })
    }
    
  }

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
                  <Box sx={{display: "flex", justifyContent: "space-between"}}>
                    <Box sx={{display: "flex", gap: "20px"}}>
                      <h2>{mainTrainingPlan.name}</h2>
                        <IconButton
                          onClick={handleDeleteClickPlan}
                          aria-label="delete"
                          title="Delete Training Plan"
                        >
                          <DeleteIcon sx={{fontSize: "30px"}}/>
                        </IconButton>
                        <IconButton
                          onClick={() => setEditPlanDetailsVisible((prev) => !prev)}
                          aria-label="edit"
                          title="Edit Training Plan"
                        >
                            <EditIcon sx={{fontSize: "30px"}}/>
                        </IconButton>
                        <IconButton
                          onClick={() => router.push('/raports')}
                          aria-label="edit"
                          title="See raports"
                        >
                            <AnalyticsIcon sx={{fontSize: "30px"}}/>
                        </IconButton>
                    </Box>
                    <Box sx={{display: "flex", justifyContent: "center"}}>
                      <IconButton
                        onClick={() => router.push('training-plan-creator')}
                        aria-label="add"
                        title="Add new Training Plan"
                      >
                        <AddIcon sx={{fontSize: "40px"}}/>
                      </IconButton>
                    </Box>
                    <Dialog open={openDialogPlan} onClose={handleDialogClosePlan}>
                        <DialogTitle>Confirm Deletion</DialogTitle>
                        <DialogContent>
                            <p>Are you sure you want to delete the training plan "{mainTrainingPlan.name}"?</p>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleDialogClosePlan} color="primary">
                                Cancel
                            </Button>
                            <Button onClick={handleDeleteConfirmPlan} color="secondary">
                                Delete
                            </Button>
                        </DialogActions>
                    </Dialog>
                  </Box>
                  {mainTrainingPlan.description ? (
                    <p>Description: {mainTrainingPlan.description}</p>
                  ) : (null)}
                  {editPlanDetailsVisible ? (
                    <EditPlanDetailBox>
                      <p>Training Plan Editor</p>
                      <form onSubmit={handleSubmitPlan(onSubmitPlanEdit)}>
                          <FormControl>
                              <FormGroup sx={{ gap: '16px' }}>
                                  <TextField
                                      id="plan-form-name-input"
                                      label="Name *"
                                      {...registerPlanData('name', {
                                          required: 'Name is required',
                                          minLength: { value: 2, message: 'Name must be at least 2 characters long' },
                                          maxLength: { value: 20, message: 'Name must not exceed 20 characters' },
                                      })}
                                      error={!!errorsPlan.name}
                                      helperText={errorsPlan.name ? errorsPlan.name.message : ''}
                                  />
                                  <TextField
                                      id="plan-form-description-input"
                                      label="Description (optional)"
                                      {...registerPlanData('description', {
                                          minLength: { value: 2, message: 'Description must be at least 2 characters long' },
                                      })}
                                      error={!!errorsPlan.description}
                                      helperText={errorsPlan.description ? errorsPlan.description.message : ''}
                                  />
                                  {infoEditPlanDetails ? (
                                    <Box sx={{display: 'block' , textAlign: 'center'}}>
                                      <p style={{ fontSize: '12px', color: 'red'}}>{infoEditPlanDetails}</p>
                                    </Box>
                                  ) : (null)}
                                  <Button variant="outlined" type="submit">
                                      Save Plan
                                  </Button>
                                  <Button variant="outlined" onClick={() => setEditPlanDetailsVisible(false)}>
                                      Close Editor
                                  </Button>
                              </FormGroup>
                          </FormControl>
                      </form>
                    </EditPlanDetailBox>
                  ) : (null)}
                  
                  <hr />
                  <Box sx={{display: "flex", justifyContent: "space-between"}}>
                    <h3>Exercises</h3>
                    <IconButton
                        onClick={() => router.push(`add-training-unit`)}
                        aria-label="add"
                        title="Add Training Unit"
                      >
                        <AddIcon sx={{fontSize: "30px"}}/>
                    </IconButton>
                  </Box>
                  
                  {mainTrainingPlan.trainingUnits &&
                  Array.isArray(mainTrainingPlan.trainingUnits) &&
                  mainTrainingPlan.trainingUnits.length > 0 ? (
                    <TrainingUnitBoxContainer>
                      {mainTrainingPlan.trainingUnits.map((trainingUnit, unitIndex) => (
                        <TrainingUnitBox key={trainingUnit.id}>
                          <Box sx={{display: "flex"}}>
                            <p>{`${unitIndex + 1}. ${trainingUnit.name}`}</p>
                            <IconButton
                              onClick={() => handleDeleteUnit(trainingUnit.id)}
                              aria-label="delete"
                              title="Delete Training Unit"
                            >
                              <DeleteIcon/>
                            </IconButton>
                            <IconButton
                              onClick={() => handleEditPlan(trainingUnit.id)}
                              aria-label="edit"
                              title="Edit Training Unit"
                            >
                              <EditIcon />
                            </IconButton>
                            <Dialog open={openDialogUnit} onClose={handleDialogCloseUnit}>
                              <DialogTitle>Confirm Deletion</DialogTitle>
                              <DialogContent>
                                  <p>Are you sure you want to delete the training unit?</p>
                              </DialogContent>
                              <DialogActions>
                                  <Button onClick={handleDialogCloseUnit} color="primary">
                                      Cancel
                                  </Button>
                                  <Button onClick={handleDeleteConfirmUnit} color="secondary">
                                      Delete
                                  </Button>
                              </DialogActions>
                            </Dialog>
                          </Box>
                          {trainingUnit.description && <p>{trainingUnit.description}</p>}
                          <StyledHr />
                          {sortedExercisesInUnit
                            .find(unit => unit.trainingUnitId === trainingUnit.id)
                            ?.SortedExercises.map((sortedExercise, exerciseIndex) => {
                              const { exercise } = sortedExercise;
                              if (!exercise) return null;
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
                                        {exerciseIndex < (sortedExercisesInUnit.find(unit => unit.trainingUnitId === trainingUnit.id)?.SortedExercises?.length ?? 0) - 1 && (
                                          <IconArrowBox
                                          onClick={() => handleDownExercise(trainingUnit.id, exercise.id)}
                                          >
                                            <ArrowDropDownIcon />
                                          </IconArrowBox>
                                        )}         
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
                                      <p><strong>Sets:</strong> {exercise.sets}</p>
                                      <p><strong>Reps:</strong> {exercise.reps}</p>
                                      {exercise.tempo && <p><strong>Tempo:</strong>  {exercise.tempo.join('-')}</p>}
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