'use client'
import axios, { AxiosError, AxiosResponse } from 'axios';
import { TrainingPlan } from './types';
import NavBar from '../_components/navbar';
import { Autocomplete, Box, Button, FormControl, FormControlLabel, FormGroup, IconButton, Radio, RadioGroup, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import { StyledBoxShadow } from '../_components/styled-components';
import { useRouter } from 'next/navigation';
import { ExerciseBox, NameForTrainingUnitBox, TrainingUnitBox, UnitCreatorExColumnBox, UnitCreatorExMainBox, StyledHr, YourExBox} from './_components/styled-components';
import DeleteIcon from '@mui/icons-material/Delete';
import { SubmitHandler, useForm } from 'react-hook-form';

const apiClient = axios.create({
    baseURL: 'http://localhost:3000/',
    withCredentials: true,
});

const AddTrainingUnit = () => {
    const [mainTrainingPlan, setMainTrainingPlan] = useState<TrainingPlan | null>(null);
    const [yourExercises, setYourExercises] = useState<Exercise[]>();
    const [allExercises, setAllExercises] = useState<Exercise[]>();
    const [selectedYourExercise, setSelectedYourExercise] = useState<Exercise | null>(null);
    const [selectedYourExCategory, setSelectedYourExCategory] = useState<Category | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [newUnitName, setNewUnitName] = useState<string>('');
    const [trainingUnit, setTrainingUnit] = useState<TrainingUnit | null>(null);
    const [yoursExercisesCategory, setYourExercisesCategory] = useState<Category[]>();
    const [isExCreatorVisible, setIsExCreatorVisible] = useState<boolean>(false);
    const [infoYourEx, setInfoYourEx] = useState<string | null>(null);
    const [infoCreator, setInfoCreator] = useState<string[]>([]);
    const [infoCreatorUnit, setInfoCreatorUnit] = useState<string[]>([]);
    const [categoryMode, setCategoryMode] = useState<'new' | 'existing'>('new'); 
    const [newCategory, setNewCategory] = useState<string | null>(null);
    const [existingCategory, setExistingCategory] = useState<number | null>(null);
    const router = useRouter();
    const {
        register: registerExercise,
        handleSubmit: handleSubmitExercise,
        formState: { errors: errorsExercise },
        reset: resetExercise,
    } = useForm<ExerciseDataForm>();
    
    const addTrainingUnitToPlan = async () => {
        try {
            const exercisesIds = trainingUnit?.exercises.map((exercise) => exercise.id);
            const data = {
                name: trainingUnit?.name,
                exercises: exercisesIds,
            };
            const response = await apiClient.post('training-units/create', data);
            const newUnit = response.data;
            if (newUnit && newUnit.id && mainTrainingPlan) {
                const restOfTrainingUnits = mainTrainingPlan.trainingUnits.map((trainingUnitPlan) => trainingUnitPlan.id);
                const dataPlan = {
                    trainingUnitsIds: [...restOfTrainingUnits, newUnit.id],
                };
                await apiClient.patch(`training-plan/update/${mainTrainingPlan.id}`, dataPlan);
            } else {
                throw new Error(`Failed to create training unit: ${trainingUnit?.name}`);
            }
            router.push('dashboard')
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message || "Unknown error occurred";
            setInfoCreatorUnit((prev) => [...prev, errorMessage]);
            console.error('Error occurred:', errorMessage);
        }
    };

    const getMainPlan = async () => {
        await apiClient.get('training-plan/getMainPlan')
        .then((response: AxiosResponse) => {
            setMainTrainingPlan(response.data);
        })
        .catch((error: AxiosError) => {
            console.log(error) 
        })
    }

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

    const onSubmitEx: SubmitHandler<ExerciseDataForm> = async (data: ExerciseDataForm) => {
        try {
            setInfoCreator([]);
            setInfoYourEx(null);
            if (data.tempo && typeof data.tempo === "string") {
                const tempoArray = data.tempo.split(',').map(value => parseInt(value.trim()));
                data.tempo = tempoArray;
            }
            if (data.description === "") {
                data.description = undefined;
            }
            if (existingCategory) {
                data.categories = [existingCategory];
            }
            if (newCategory) {
                await apiClient.post('exercise-category/create', { name: newCategory })
                    .then(async response => {
                        data.categories = [response.data.id]; 
                        await getCategories();
                        setIsLoading(false);
                    })
                    .catch(() => {
                        setInfoCreator(["An error occurred while adding the category"]);
                    });
            }
            if (!(Array.isArray(data.categories) && data.categories.length > 0)) {
                data.categories = [];
            }
            await apiClient.post('/exercise/create', data)
                .then(async response => {
                    console.log(response);
                    await getYoursExercises();
                    await getCategories();
                    setIsLoading(false);
                    setInfoYourEx(`${data.name} has been added`);
                    resetExercise({
                        name: "",
                        description: "",
                        sets: undefined,
                        reps: undefined,
                        load: undefined,
                        tempo: "",
                        categories: []
                    });
                    setNewCategory(null);
                    setExistingCategory(null);
                })
                .catch(error => {
                    setInfoCreator((prev) => [...prev, error.response.data.message || "Unknown error occurred"]);
                });
        } catch (error) {
            console.error("An error occurred during submission:", error);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            await getMainPlan();
            await getYoursExercises();
            await getCategories();
            setIsLoading(false);
        };
        fetchData();
    }, []);

    if (isLoading) {
        return <div>Loading...</div>;  
    }

    const handleAddTrainingUnit = () => {
        if (newUnitName.trim()) {
          setTrainingUnit({ name: newUnitName.trim(), exercises: [] });
          setNewUnitName(''); 
        }
    };

    const handleChangeName = () => {
        if (newUnitName.trim() && trainingUnit && trainingUnit.exercises) {
            const trainingUnitUpdate = trainingUnit;
            setTrainingUnit({name: newUnitName.trim(), exercises: trainingUnitUpdate.exercises});
            setNewUnitName(''); 
        }
    };

    const handleDeleteExercise = (index: number) => {
        if (trainingUnit?.exercises) {
            setTrainingUnit((prev) => {
                if (!prev) return { name: '', exercises: [] }; 
                const updatedExercises = prev.exercises.filter((_, indexEx) => index !== indexEx);
                return { ...prev, exercises: updatedExercises }; 
            });
        }
    };

    const handleCategoryModeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setCategoryMode(event.target.value as 'new' | 'existing');
        setNewCategory(null);
        setExistingCategory(null);
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
        setSelectedYourExCategory(category);
    }

    const handleAddExerciseToUnit = () => {
        if (selectedYourExercise && trainingUnit) {
            const updatedTrainingUnit = {name: trainingUnit.name, exercises: [...trainingUnit.exercises, selectedYourExercise]}
            setTrainingUnit(updatedTrainingUnit);
        }
    }

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
            <p>To create a training unit, you first need to type in name and include exercises</p>
            <StyledBoxShadow>
                {mainTrainingPlan && mainTrainingPlan.id ? (
                    <Box>
                        <UnitCreatorExMainBox>
                            <UnitCreatorExColumnBox sx={{padding: '0 15px 0 0'}}>
                                <Box>
                                    <p>Training unit that will be added to the training plan</p>
                                    <NameForTrainingUnitBox>
                                        <TextField
                                          label="Training Unit Name"
                                          variant="outlined"
                                          value={newUnitName}
                                          onChange={(e) => setNewUnitName(e.target.value)}
                                          sx={{ flex: 1 }}
                                        />
                                        {trainingUnit ? (
                                            <Button variant="outlined" onClick={handleChangeName} sx={{ height: 'maxHeight' }}>
                                                Change name
                                            </Button>
                                        ) : (
                                            <Button variant="outlined" onClick={handleAddTrainingUnit} sx={{ height: 'maxHeight' }}>
                                                Add
                                            </Button>
                                        )}
                                    </NameForTrainingUnitBox>
                                </Box>
                                {trainingUnit ? (
                                    <TrainingUnitBox>
                                            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                                <h3>{trainingUnit.name}</h3>
                                                <IconButton
                                                onClick={() => setTrainingUnit(null)}
                                                aria-label="delete"
                                                title="Delete Training Unit"
                                                >
                                                <DeleteIcon />
                                                </IconButton>
                                            </Box>
                                            <StyledHr />
                                            {trainingUnit.exercises.length > 0 ? (
                                                trainingUnit.exercises.map((exercise, index) => (
                                                    <ExerciseBox key={index}>
                                                        {`${index + 1}. ${exercise.name}`}
                                                        <IconButton
                                                            onClick={() => handleDeleteExercise(index)}
                                                            aria-label="delete"
                                                            title="Delete Exercise"
                                                        >
                                                            <DeleteIcon />
                                                        </IconButton>
                                                    </ExerciseBox>
                                                ))
                                            ) : (
                                                <p>No exercises added yet.</p>
                                            )}  
                                    </TrainingUnitBox>
                                ) : <p>Training unit name has not been set.</p>}
                                {trainingUnit  ? (
                                    (Array.isArray(trainingUnit.exercises) && trainingUnit.exercises.length > 0 ? (
                                        <Button sx={{marginTop: "15px"}} variant="outlined" onClick={() => addTrainingUnitToPlan()} color="primary">
                                            ADD TRAINING UNIT
                                        </Button>
                                    ) : (
                                        <p>You must add at least one exercise to training unit in order to proceed further.</p>
                                    ))
                                ) : (
                                    null
                                )}
                                <Button sx={{marginTop: "15px"}} variant="outlined" onClick={() => router.push('dashboard')} color="primary">
                                    Back to dashboard
                                </Button>
                            </UnitCreatorExColumnBox>
                            {trainingUnit ? (
                                <UnitCreatorExColumnBox sx={{borderLeft: '4px solid lightgray', padding: '0 15px 0 15px'}}>
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
                                        {infoYourEx ? (
                                            <Box sx={{display: 'block' , textAlign: 'center'}}>
                                                <p style={{ fontSize: '12px', color: 'green'}}>{infoYourEx}</p>
                                            </Box>
                                        ) : null}
                                        {selectedYourExercise ? (
                                            <Box sx={{paddingBottom: "15px"}}>
                                                <Button variant='outlined' onClick={handleAddExerciseToUnit}>Add to the training unit</Button>
                                            </Box>
                                        ) : (
                                            <Box>
                                                <p>Select an exercise to include it in your training unit.</p>
                                            </Box>
                                        )}
                                        {!isExCreatorVisible ? (
                                            <Box>
                                                <Button variant='outlined' onClick={() => setIsExCreatorVisible(!isExCreatorVisible)}>OPEN EXERCISE CREATOR</Button>
                                            </Box>
                                        ) : null}
                                    </YourExBox>
                                </UnitCreatorExColumnBox>
                            ) : (null) }
                            {isExCreatorVisible && trainingUnit ? (
                                <UnitCreatorExColumnBox sx={{borderLeft: '4px solid lightgray', paddingLeft: "20px"}}>
                                    <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column'}}>
                                        <p>Exercise creator</p>
                                        <form onSubmit={handleSubmitExercise(onSubmitEx)}>
                                            <FormControl>
                                                <FormGroup sx={{ gap: '16px' }}>
                                                    <TextField
                                                        id="ex-form-name-input"
                                                        label="Name *"
                                                        {...registerExercise('name', { required: 'Name is required' })}
                                                        error={!!errorsExercise.name}
                                                        helperText={errorsExercise.name ? errorsExercise.name.message : ''}
                                                    />
                                                    <TextField
                                                        id="ex-form-description-input"
                                                        label="Description (optional)"
                                                        {...registerExercise('description', { minLength: {value: 2,  message: 'Description must be at least 2 characters long'}})}
                                                        error={!!errorsExercise.description}
                                                        helperText={errorsExercise.description ? errorsExercise.description.message : ''}
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
                                                        {...registerExercise('sets', {
                                                            required: 'Number of sets is required',
                                                            valueAsNumber: true,
                                                            validate: (value) => value === undefined || value >= 0 || 'Number of sets be a positive number',
                                                        })}
                                                        error={!!errorsExercise.sets}
                                                        helperText={errorsExercise.sets ? errorsExercise.sets.message : ''}
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
                                                        {...registerExercise('reps', {required: 'Number of sets is required',
                                                            valueAsNumber: true,
                                                            validate: (value) => value === undefined || value >= 0 || 'Number of reps be a positive number',
                                                        })}
                                                        error={!!errorsExercise.reps}
                                                        helperText={errorsExercise.reps ? errorsExercise.reps.message : ''}
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
                                                        {...registerExercise('load', {
                                                            valueAsNumber: true,
                                                        })}
                                                        error={!!errorsExercise.load}
                                                        helperText={errorsExercise.load ? errorsExercise.load.message : ''}
                                                    />
                                                    <TextField
                                                        label="Tempo (ePhase, ePause, cPhases, cPause)"
                                                        {...registerExercise('tempo', {  
                                                          validate: (value) => validateTempo(value as string),
                                                        })}
                                                        error={!!errorsExercise.tempo}
                                                        helperText={errorsExercise.tempo ? errorsExercise.tempo.message : ''}
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
                                                        />
                                                    )}
                                                    <Box sx={{display: 'block', justifyContent: 'center'}}>
                                                        {infoCreator && infoCreator.length > 0 ? (
                                                            infoCreator.map((item, index) => (
                                                                <Box key={index} sx={{display: 'flex' , justifyContent: 'center'}}>
                                                                    <p style={{ fontSize: '12px', color: 'red'}}>{item}</p>
                                                                </Box>
                                                        ))) : null}
                                                    </Box>
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
                                </UnitCreatorExColumnBox>
                            ) : (null)}
                        </UnitCreatorExMainBox>
                    </Box>
                ) : (
                    <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column'}}>
                        <p>An error occurred while loading the training plan to which the training unit was to be added.</p>
                        <Button variant="outlined" onClick={() => router.push('dashboard')} color="primary">
                            Back
                        </Button>
                    </Box>
                )}
            </StyledBoxShadow>
        </Box>
        </>
    )
}

export default AddTrainingUnit;