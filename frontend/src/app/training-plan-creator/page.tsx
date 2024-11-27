'use client';
import { StyledBoxShadow } from "@/app/_components/styled-components";
import { Autocomplete, Box, Button, Collapse, FormControl, FormGroup, IconButton, InputLabel, List, ListItem, ListItemText, MenuItem, Select, TextField } from "@mui/material";
import axios, { AxiosError, AxiosResponse } from "axios";
import { PlanCreatorExColumnBox, PlanCreatorExMainBox, YourExBox, NameForTrainingPlanBox, TrainingUnitBox, ExerciseBox, StyledHr } from "./_components/styled-components";
import { useEffect, useState } from "react";
import DeleteIcon from '@mui/icons-material/Delete';
import { TransitionGroup } from 'react-transition-group';
import { set, SubmitHandler, useForm } from "react-hook-form";
import NavBar from "../_components/navbar";



const apiClient = axios.create({
    baseURL: 'http://localhost:3000/',
    withCredentials: true
});

interface RenderItemOptions {
    exercise: Exercise;
    handleRemoveItem: (item: Exercise) => void;
}
  
function renderItem({ exercise, handleRemoveItem }: RenderItemOptions) {
    return (
      <ListItem
        secondaryAction={
          <IconButton
            edge="end"
            aria-label="delete"
            title="Delete"
            onClick={() => handleRemoveItem(exercise)}
          >
            <DeleteIcon />
          </IconButton>
        }
      >
        
      </ListItem>
    );
}

const TrainingPlanCreator = () => {
    const [yourExercises, setYourExercises] = useState<Exercise[]>();
    const [allExercises, setAllExercises] = useState<Exercise[]>();
    const [yoursExercisesCategory, setYourExercisesCategory] = useState<Category[]>();
    const [selectedYourExercise, setSelectedYourExercise] = useState<Exercise | null>(null);
    const [selectedYourTrainingUnit, setSelectedYourTrainingUnit] = useState<string>('');
    const [selectedYourExCategory, setSelectedYourExCategory] = useState<Category | null>(null);
    const [trainingUnits, setTrainingUnits] = useState<TrainingUnit[]>([]);
    const [newUnitName, setNewUnitName] = useState<string>('');
    const [isExCreatorVisible, setIsExCreatorVisible] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState(true);
    const { register, handleSubmit, formState: { errors } } = useForm<ExerciseDataForm>();

    const getYoursExercises = async () => {
        await apiClient.get('exercise/get').then((response: AxiosResponse) => {
            setYourExercises(response.data);
            setAllExercises(response.data);
        }).catch((errors: AxiosError) => {
            console.log(errors);
        })
    }

    const getCategories = async () => {
        await apiClient.get('exercise-category/get').then((response: AxiosResponse) => {
            setYourExercisesCategory(response.data);
        }).catch((errors: AxiosError) => {
            console.log(errors);
        })
    }

    const onSubmit:SubmitHandler<ExerciseDataForm> = async (data: ExerciseDataForm) => {
        await apiClient.post('/', data).then((response: AxiosResponse) => {
            console.log(response)
        }).catch((error: AxiosError) => {
            console.log(error)
        })
    }

    useEffect(() => {
        const fetchData = async () => {
            await getYoursExercises();
            await getCategories();
            setIsLoading(false);
        };
        fetchData();
    }, []);
    
    if (isLoading) {
        return <div>Loading...</div>;  
    }

    const handleAddExerciseToUnit = () => {
        if (selectedYourExercise && selectedYourTrainingUnit !== '') {
            const updatedTrainingUnit = trainingUnits.map((trainingUnit) => {
                if(trainingUnit.name === selectedYourTrainingUnit) {
                    return {
                        ...trainingUnit,
                        exercises: [...trainingUnit.exercises, selectedYourExercise], 
                    };
                }
                return trainingUnit
            });
            setTrainingUnits(updatedTrainingUnit);
        }
    }

    // const handleRemoveExercise = (exercise: Exercise) => {
    //     setExerciseToPlan(prev => prev.filter((e) => e.id !== exercise.id));
    // };

    const handleSetCategory = (category: Category | null) => {
        if (category) {
            if (allExercises && Array.isArray(allExercises) && allExercises.length > 0) {
                const filteredExercises = allExercises.filter(exercise =>
                    Array.isArray(exercise.categories) && 
                    exercise.categories.some(cat => cat.name === category.name)
                );
                setYourExercises(filteredExercises);
            }
        } else {
            setYourExercises(allExercises);
        }
        setSelectedYourExCategory(category)
    }

    const handleAddTrainingUnit = () => {
        if (newUnitName.trim() && !trainingUnits.some(unit => unit.name === newUnitName.trim())) {
          setTrainingUnits((prev) => [
            ...prev,
            { name: newUnitName, exercises: [] }, 
          ]);
          setNewUnitName(''); 
        }
      };

    const handleDeleteExFromUnit = (unitIndex: number, exerciseIndex: number) => {
        setTrainingUnits((prevTrainingUnits) => {
            const updatedTrainingUnits = [...prevTrainingUnits];
            const updatedExercises = updatedTrainingUnits[unitIndex].exercises.filter(
                (_, index) => index !== exerciseIndex
            );
            updatedTrainingUnits[unitIndex] = {
                ...updatedTrainingUnits[unitIndex],
                exercises: updatedExercises,
            };
            return updatedTrainingUnits;
        });
    }

    const handleDeleteTrainingUnit = (unitIndex: number) => {
        setTrainingUnits((prev) => prev.filter((_, index) => index !== unitIndex));
    }

    const validateTempo = (value: string | undefined) => {
        if (!value) {
            return 'Tempo is required';  
        }
        const values = value.split(',').map(item => item.trim());
        if (values.length !== 4) {
          return 'Tempo must consist of 4 numbers.';
        }
        if (values.some(val => isNaN(Number(val)))) {
          return 'Each value in tempo must be a number.';
        }
        return true; 
    };

    return (
        <>
        <NavBar/>
        <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column'}}>
            <p>To create a training plan, you first need to add training units and include exercise to them</p>
            <StyledBoxShadow> 
                <PlanCreatorExMainBox>
                    <PlanCreatorExColumnBox sx={{padding: '0 15px 0 0'}}>
                        <Box>
                            <p>Training units that will be added to the training plan</p>
                            <NameForTrainingPlanBox>
                            <TextField
                              label="Training Unit Name"
                              variant="outlined"
                              value={newUnitName}
                              onChange={(e) => setNewUnitName(e.target.value)}
                              sx={{ flex: 1 }}
                            />
                            <Button variant="outlined" onClick={handleAddTrainingUnit} sx={{ height: 'maxHeight' }}>
                              Add
                            </Button>
                        </NameForTrainingPlanBox>
                        </Box>
                        {trainingUnits && trainingUnits.length > 0 ? (
                            trainingUnits.map((unit, unitIndex) => (
                                <TrainingUnitBox key={unitIndex}>
                                    <Box>
                                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                            <h3>{`${unitIndex + 1}. ${unit.name}`}</h3>
                                            <IconButton
                                                onClick={() => handleDeleteTrainingUnit(unitIndex)}
                                                aria-label="delete"
                                                title="Delete Training Unit"
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </Box>
                                    </Box>
                                    <StyledHr/>
                                    {unit.exercises && Array.isArray(unit.exercises) && unit.exercises.length > 0 ? (
                                        unit.exercises.map((exercise, exerciseIndex) => (
                                            <ExerciseBox key={exerciseIndex}>
                                                {`${exerciseIndex + 1}. ${exercise.name}`}
                                                <IconButton
                                                onClick={() => handleDeleteExFromUnit(unitIndex, exerciseIndex)}
                                                aria-label="delete"
                                                title="Delete Training Unit"
                                                >
                                                <DeleteIcon />
                                                </IconButton>
                                            </ExerciseBox> 
                                        ))
                                    ) : (
                                        <p>No exercises added to this unit.</p>
                                    )}
                                </TrainingUnitBox>
                            ))
                        ) : (
                            <p>No training units added yet.</p>
                        )}
                    </PlanCreatorExColumnBox>
                        {trainingUnits && trainingUnits.length > 0 ? (
                            <PlanCreatorExColumnBox sx={{borderLeft: '4px solid lightgray', padding: '0 15px 0 15px'}}>
                                <YourExBox>
                                    <p>Your exercises</p>
                                    <Autocomplete
                                        sx={{minWidth: "270px", paddingBottom: "15px"}}
                                        options={yoursExercisesCategory || []}
                                        getOptionLabel={(option) => option.name} 
                                        renderInput={(params) => (
                                            <TextField {...params} label="Choose category of exercises" variant="outlined" />
                                        )}
                                        value={selectedYourExCategory}
                                        onChange={(event, newValue) => handleSetCategory(newValue)}
                                        isOptionEqualToValue={(option, value) => option.id === value?.id}
                                    />
                                    <Autocomplete
                                        sx={{minWidth: "270px", paddingBottom: "15px"}}
                                        options={yourExercises || []}
                                        getOptionLabel={(option) => option.name} 
                                        renderInput={(params) => (
                                            <TextField {...params} label="Choose exercise" variant="outlined" />
                                        )}
                                        value={selectedYourExercise}
                                        onChange={(event, newValue) => setSelectedYourExercise(newValue)}
                                        isOptionEqualToValue={(option, value) => option.id === value?.id}
                                    />
                                    <FormControl sx={{ minWidth: 270, paddingBottom: "15px" }}>
                                        <InputLabel>Choose Training Unit</InputLabel>
                                        <Select
                                            value={selectedYourTrainingUnit}
                                            onChange={(e) => setSelectedYourTrainingUnit(e.target.value)}
                                            label="Choose Training Unit"
                                        >
                                            {trainingUnits && trainingUnits.length > 0 ? (
                                                trainingUnits.map((unit, unitIndex) => (
                                                    <MenuItem key={unitIndex} value={unit.name}>
                                                        {unit.name}
                                                    </MenuItem>
                                                ))
                                            ) : (
                                                <MenuItem disabled>No training units added yet</MenuItem>
                                            )}
                                        </Select>
                                    </FormControl>
                                    {selectedYourExercise && selectedYourTrainingUnit !== '' ? (
                                        <Box sx={{paddingBottom: "15px"}}>
                                            <Button variant='outlined' onClick={handleAddExerciseToUnit}>Add to the plan</Button>
                                        </Box>
                                    ) : (<p>Select exercise and training unit in order to add exercise.</p>)}
                                    {!isExCreatorVisible ? (
                                        <Box>
                                            <Button variant='outlined' onClick={() => setIsExCreatorVisible(!isExCreatorVisible)}>OPEN EXERCISE CREATOR</Button>
                                        </Box>
                                    ) : null}
                                </YourExBox>
                            </PlanCreatorExColumnBox>
                        ) : (null) }
                    {isExCreatorVisible ? (
                        <PlanCreatorExColumnBox sx={{borderLeft: '4px solid lightgray'}}>
                            <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column'}}>
                                <p>Exercise creator</p>
                                <form onSubmit={handleSubmit(onSubmit)}>
                                    <FormControl>
                                        <FormGroup sx={{ gap: '16px' }}>
                                            <TextField
                                                id="ex-form-name-input"
                                                label="Name *"
                                                {...register('name', { required: 'Name is required' })}
                                                error={!!errors.name}
                                                helperText={errors.name ? errors.name.message : ''}
                                            />
                                            <TextField
                                                id="ex-form-description-input"
                                                label="Description"
                                                {...register('description', { maxLength: {value: 2,  message: 'Description must be at least 2 characters long'}})}
                                                error={!!errors.description}
                                                helperText={errors.description ? errors.description.message : ''}
                                            />
                                            <TextField
                                                id="ex-form-sets-input"
                                                label="Number of sets *"
                                                type="number"
                                                slotProps={{
                                                    inputLabel: {
                                                      shrink: true,
                                                    },
                                                }}
                                                {...register('sets', {required: 'Number of sets is required'})}
                                                error={!!errors.sets}
                                                helperText={errors.sets ? errors.sets.message : ''}
                                            />  
                                            <TextField
                                                id="ex-form-reps-input"
                                                label="Number of reps *"
                                                type="number"
                                                slotProps={{
                                                    inputLabel: {
                                                      shrink: true,
                                                    },
                                                }}
                                                {...register('reps', {required: 'Number of sets is required'})}
                                                error={!!errors.reps}
                                                helperText={errors.reps ? errors.reps.message : ''}
                                            />
                                            <TextField
                                                label="Tempo (ePhase, ePause, cPhases, cPause)"
                                                {...register('tempo', {  
                                                  validate: (value) => validateTempo(value),
                                                })}
                                                error={!!errors.tempo}
                                                helperText={errors.tempo ? errors.tempo.message : ''}
                                                slotProps={{
                                                  inputLabel: {
                                                    shrink: true,
                                                  },
                                                }}
                                            />
                                        </FormGroup>
                                    </FormControl>
                                </form>
                                {isExCreatorVisible ? (
                                        <Box sx={{margin: "15px 0 0 0"}}>
                                            <Button variant='outlined' onClick={() => setIsExCreatorVisible(!isExCreatorVisible)}>CLOSE EXERCISE CREATOR</Button>
                                        </Box>
                                ) : null}
                            </Box>
                        </PlanCreatorExColumnBox>
                    ) : (null)}
                </PlanCreatorExMainBox>
            </StyledBoxShadow>
        </Box>
        </>
    )
}

export default TrainingPlanCreator;