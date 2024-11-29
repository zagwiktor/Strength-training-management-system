'use client';
import { StyledBoxShadow } from "@/app/_components/styled-components";
import { Autocomplete, Box, Button, Collapse, FormControl, FormControlLabel, FormGroup, IconButton, InputLabel, List, ListItem, ListItemText, MenuItem, Radio, RadioGroup, Select, TextField } from "@mui/material";
import axios, { AxiosError, AxiosResponse } from "axios";
import { PlanCreatorExColumnBox, PlanCreatorExMainBox, YourExBox, NameForTrainingPlanBox, TrainingUnitBox, ExerciseBox, StyledHr } from "./_components/styled-components";
import { useEffect, useState } from "react";
import DeleteIcon from '@mui/icons-material/Delete';
import { TransitionGroup } from 'react-transition-group';
import { set, SubmitHandler, useForm } from "react-hook-form";
import NavBar from "../_components/navbar";
import { error } from "console";



const apiClient = axios.create({
    baseURL: 'http://localhost:3000/',
    withCredentials: true
});

interface RenderItemOptions {
    exercise: Exercise;
    handleRemoveItem: (item: Exercise) => void;
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
    const [categoryMode, setCategoryMode] = useState<'new' | 'existing'>('new'); 
    const [newCategory, setNewCategory] = useState<string | null>(null);
    const [existingCategory, setExistingCategory] = useState<number | null>(null);
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

    const onSubmitEx:SubmitHandler<ExerciseDataForm> = async (data: ExerciseDataForm) => {
        if (data.tempo) {
            if (typeof data.tempo === "string"){
                const tempoArray = data.tempo.split(',').map(value => parseInt(value.trim()));
                data.tempo = tempoArray;
            }  
        }

        console.log(existingCategory);
        console.log(newCategory);
        if (existingCategory) {
            data.categories = [existingCategory];
        }
        if (newCategory) {
            await apiClient.post('exercise-category/create', data)
            .then((response) => {
                console.log(response)
            })
            .catch((errors) => {
                
            })
        }


        // await apiClient.post('/exercise/create', data)
        // .then((response: AxiosResponse) => {
        //     console.log(response);
        // })
        // .catch((error: AxiosError) => {
        //     console.log(error);
        // });
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

    const handleCategoryModeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setCategoryMode(event.target.value as 'new' | 'existing');
        setNewCategory(null);
        setExistingCategory(null);
    };

    const validateTempo = (value: string | undefined) => {
        if (!value) {
            return true;  
        } else {
            const values = value.split(',').map(item => item.trim());
            if (values.length !== 4) {
                return 'Tempo must consist of 4 numbers.';
            }
            if (values.some(val => isNaN(Number(val)))) {
                return 'Each value in tempo must be a number.';
            }
        }
        return true; 
    };

    return (
        <>
        <NavBar/>
        <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', margin: "100px 0 100px 0"}}>
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
                        <PlanCreatorExColumnBox sx={{borderLeft: '4px solid lightgray', paddingLeft: "20px"}}>
                            <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column'}}>
                                <p>Exercise creator</p>
                                <form onSubmit={handleSubmit(onSubmitEx)}>
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
                                                label="Description (optional)"
                                                {...register('description', { minLength: {value: 2,  message: 'Description must be at least 2 characters long'}})}
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
                                                {...register('sets', {
                                                    required: 'Number of sets is required',
                                                    valueAsNumber: true,
                                                    validate: (value) => value === undefined || value >= 0 || 'Number of sets be a positive number',
                                                })}
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
                                                {...register('reps', {required: 'Number of sets is required',
                                                    valueAsNumber: true,
                                                    validate: (value) => value === undefined || value >= 0 || 'Number of reps be a positive number',
                                                })}
                                                error={!!errors.reps}
                                                helperText={errors.reps ? errors.reps.message : ''}
                                            />
                                            <TextField
                                                id="ex-form-load-input"
                                                label="Load (optional)"
                                                type="number"
                                                slotProps={{
                                                    inputLabel: {
                                                        shrink: true,
                                                    },
                                                }}
                                                {...register('load', {
                                                    valueAsNumber: true,
                                                })}
                                                error={!!errors.load}
                                                helperText={errors.load ? errors.load.message : ''}
                                            />
                                            <TextField
                                                label="Tempo (ePhase, ePause, cPhases, cPause)"
                                                {...register('tempo', {  
                                                  validate: (value) => validateTempo(value as string),
                                                })}
                                                error={!!errors.tempo}
                                                helperText={errors.tempo ? errors.tempo.message : ''}
                                                slotProps={{
                                                  inputLabel: {
                                                    shrink: true,
                                                  },
                                                }}
                                            />
                                            <RadioGroup
                                                value={categoryMode}
                                                onChange={handleCategoryModeChange}
                                                row
                                                aria-label="Category Selection Mode"
                                                name="category-mode"
                                                style={{ marginBottom: '16px' }}
                                            >
                                                <FormControlLabel value="new" control={<Radio />} label="Add New Category" />
                                                <FormControlLabel value="existing" control={<Radio />} label="Choose Existing Category" />
                                            </RadioGroup>
                                            {categoryMode === 'new' && (
                                                <TextField
                                                    label="New Category Name"
                                                    value={newCategory || ''}
                                                    onChange={(e) => setNewCategory(e.target.value)}
                                                    variant="outlined"
                                                    fullWidth
                                                    style={{ marginBottom: '16px' }}
                                                />
                                            )}
                                            {categoryMode === 'existing' && (
                                                <Autocomplete
                                                    options={yoursExercisesCategory || []}
                                                    getOptionLabel={(option) => option.name || ''}
                                                    onChange={(event, newValue) => {
                                                        if (newValue) {
                                                            setExistingCategory(newValue.id);
                                                        }
                                                    }}
                                                    renderInput={(params) => (
                                                        <TextField {...params} label="Select Existing Category" variant="outlined" />
                                                    )}
                                                    fullWidth
                                                    style={{ marginBottom: '16px' }}
                                                />
                                            )}
                                            <Button variant="outlined" type="submit" >Add Exercise</Button>
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