import { StyledBoxShadow } from "@/app/_components/styled-components";
import { Autocomplete, Box, Button, Collapse, FormControl, FormGroup, IconButton, List, ListItem, ListItemText, TextField } from "@mui/material";
import axios, { AxiosError, AxiosResponse } from "axios";
import { FirstPlanExColumnBox, FirstPlanExMainBox, YourExBox } from "./styled-components";
import { useEffect, useState } from "react";
import DeleteIcon from '@mui/icons-material/Delete';
import { TransitionGroup } from 'react-transition-group';
import { SubmitHandler, useForm } from "react-hook-form";

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

interface ExerciseDataForm {
    name: string;   
    description?: string;   
    sets: number;   
    reps: number;   
    tempo?: string; 
    load?: number;  
    categories: number[];
}

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
        <ListItemText primary={exercise.name} />
      </ListItem>
    );
}

const FirstPlanCreator = () => {
    const [yourExercises, setYourExercises] = useState<Exercise[]>();
    const [allExercises, setAllExercises] = useState<Exercise[]>();
    const [yoursExercisesCategory, setYourExercisesCategory] = useState<Category[]>();
    const [selectedYourExercise, setSelectedYourExercise] = useState<Exercise | null>(null);
    const [selectedYourExCategory, setSelectedYourExCategory] = useState<Category | null>(null);
    const [exerciseToPlan, setExerciseToPlan] = useState<Exercise[]>([]);
    const { register, handleSubmit, formState: { errors } } = useForm<ExerciseDataForm>();

    const getYoursExercises = async () => {
        await apiClient.get('exercise/get').then((response: AxiosResponse<ExercisesResponse>) => {
            setYourExercises(response.data.data);
            setAllExercises(response.data.data);
        }).catch((errors: AxiosError) => {
            console.log(errors);
        })
    }

    const getCategories = async () => {
        await apiClient.get('exercise-category/get').then((response: AxiosResponse<CategoriesResponse>) => {
            setYourExercisesCategory(response.data.data);
        }).catch((errors: AxiosError) => {
            console.log(errors);
        })
    }

    const onSubmit:SubmitHandler<ExerciseDataForm> = async (data: ExerciseDataForm) => {
        await apiClient.post('/login', data).then((response: AxiosResponse) => {
            console.log(response)
        }).catch((error: AxiosError) => {
            console.log(error)
        })
    }

    useEffect(() => {
        getYoursExercises();
        getCategories();
    }, [])

    const handleAddExerciseToPlan = () => {
        if (selectedYourExercise) {
            setExerciseToPlan(prev => [...prev, selectedYourExercise]);
        }
    }

    const handleRemoveExercise = (exercise: Exercise) => {
        setExerciseToPlan(prev => prev.filter((e) => e.id !== exercise.id));
    };

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
        <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column'}}>
            <p>To create a training plan, you first need to add exercises</p>
            <StyledBoxShadow> 
                <FirstPlanExMainBox>
                    <FirstPlanExColumnBox sx={{padding: '0 15px 0 0'}}>
                        <p>Exercises that will be added to the training plan</p>
                        <Box>
                            <List sx={{ mt: 1 }}>
                                <TransitionGroup>
                                    {exerciseToPlan && exerciseToPlan.length > 0 ? (
                                        exerciseToPlan.map((exercise) => (
                                            <Collapse key={exercise.id}>
                                                {renderItem({ exercise, handleRemoveItem: handleRemoveExercise })}
                                            </Collapse>
                                        ))
                                    ) : null}
                                </TransitionGroup>
                            </List>
                        </Box>
                    </FirstPlanExColumnBox>
                    <FirstPlanExColumnBox sx={{borderLeft: '4px solid lightgray', padding: '0 15px 0 15px'}}>
                        <YourExBox>
                            <p>Your exercises</p>
                            <Autocomplete
                                sx={{minWidth: "270px", paddingBottom: "15px"}}
                                options={yoursExercisesCategory}
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
                                options={yourExercises}
                                getOptionLabel={(option) => option.name} 
                                renderInput={(params) => (
                                    <TextField {...params} label="Choose exercise" variant="outlined" />
                                )}
                                value={selectedYourExercise}
                                onChange={(event, newValue) => setSelectedYourExercise(newValue)}
                                isOptionEqualToValue={(option, value) => option.id === value?.id}
                            />
                            {selectedYourExercise ? (
                                <Box sx={{paddingBottom: "15px"}}>
                                    <Button variant='outlined' onClick={handleAddExerciseToPlan}>Add to the plan</Button>
                                </Box>
                            ) : (null)}
                            <Box>
                                <Button variant='outlined'>Create Exercise</Button>
                            </Box>
                        </YourExBox>
                        
                    </FirstPlanExColumnBox>
                    <FirstPlanExColumnBox sx={{borderLeft: '4px solid lightgray'}}>
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
                        </Box>
                    </FirstPlanExColumnBox>
                </FirstPlanExMainBox>
            </StyledBoxShadow>
        </Box>
    )
}

export default FirstPlanCreator;