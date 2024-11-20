import { StyledBoxShadow } from "@/app/_components/styled-components";
import { Autocomplete, Box, Button, Collapse, IconButton, List, ListItem, ListItemText, TextField } from "@mui/material";
import axios, { AxiosError, AxiosResponse } from "axios";
import { FirstPlanExColumnBox, FirstPlanExMainBox } from "./styled-components";
import { useEffect, useState } from "react";
import DeleteIcon from '@mui/icons-material/Delete';
import { TransitionGroup } from 'react-transition-group';

interface Exercise {
    id: number;
    name: string;
    description: string;
    sets: number;
    reps: number;
    tempo: [number, number, number, number]; 
    load: number;
    categories?: Category[]
}

interface ExercisesResponse {
    data: Exercise[];
}

interface Category {
    id: number;
    name: string;
    exercises?: Exercise[]
}

interface CategoriesResponse {
    data: Category[]
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

    return (
        <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column'}}>
            <p>To create a training plan, you first need to add exercises</p>
            <StyledBoxShadow>
                <FirstPlanExMainBox>
                    <FirstPlanExColumnBox>
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
                    <FirstPlanExColumnBox sx={{borderLeft: '4px solid lightgray', paddingLeft: '15px'}}>
                        <p>Your's exercises</p>
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
                    </FirstPlanExColumnBox>
                </FirstPlanExMainBox>
            </StyledBoxShadow>
        </Box>
    )
}

export default FirstPlanCreator;