'use client';
import { StyledBoxShadow } from "@/app/_components/styled-components";
import { Autocomplete, Box, Button, Checkbox, FormControl, FormControlLabel, FormGroup, IconButton, InputLabel, MenuItem, Radio, RadioGroup, Select, TextField } from "@mui/material";
import axios, { AxiosError, AxiosResponse } from "axios";
import { PlanCreatorExColumnBox, PlanCreatorExMainBox, YourExBox, NameForTrainingPlanBox, TrainingUnitBox, ExerciseBox, StyledHr } from "./_components/styled-components";
import { useEffect, useState } from "react";
import DeleteIcon from '@mui/icons-material/Delete';
import { SubmitHandler, useForm } from "react-hook-form";
import NavBar from "../_components/navbar";
import { useRouter } from "next/navigation";

const apiClient = axios.create({
    baseURL: 'http://localhost:3000/',
    withCredentials: true
});

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
    const [infoCreator, setInfoCreator] = useState<string[]>([]);
    const [infoCreatorPlan, setInfoCreatorPlan] = useState<string[]>([]);
    const [infoYourEx, setInfoYourEx] = useState<string | null>(null);
    const [existingCategory, setExistingCategory] = useState<number | null>(null);
    const router = useRouter();

    const {
        register: registerPlan,
        handleSubmit: handleSubmitPlan,
        formState: { errors: errorsPlan },
        reset: resetPlan,
      } = useForm<TrainingPlanForm>();
    
      const {
        register: registerExercise,
        handleSubmit: handleSubmitExercise,
        formState: { errors: errorsExercise },
        reset: resetExercise,
      } = useForm<ExerciseDataForm>();

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

    const postTrainingUnits = async (trainingUnit: TrainingUnit): Promise<number | null> => {
        const trainingUnitExercises = trainingUnit.exercises.map((exercise) => exercise.id);
        const dataToSend = {
            name: trainingUnit.name,
            exercises: trainingUnitExercises,
        };
        try {
            const response: AxiosResponse = await apiClient.post('training-units/create', dataToSend);
            return response.data.id;
        } catch (error: unknown) {
            if (error instanceof AxiosError) {
                console.error('Error posting training unit:', error.message);
            } else {
                console.error('Unknown error:', error);
            }
            return null; 
        }
    };

    const onSubmitPlan: SubmitHandler<TrainingPlanForm> = async (data) => {
        setInfoCreatorPlan([]);
        try {
            const trainingUnitsIds = await Promise.all(
                trainingUnits.map(async (trainingUnit) => {
                    const result = await postTrainingUnits(trainingUnit);
                    if (result === null) {
                        throw new Error(`Failed to create training unit: ${trainingUnit.name}`);
                    }
                    return result;
                })
            );
            const dataToSend = { ...data, trainingUnitsIds: trainingUnitsIds };
            const response = await apiClient.post('training-plan/create', dataToSend);
            resetPlan({
                name: '',
                description: '',
                mainPlan: false,
            });
            router.push(`/dashboard?plan=${dataToSend.name}`);
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message || "Unknown error occurred";
            setInfoCreatorPlan((prev) => [...prev, errorMessage]);
            console.error('Error occurred:', errorMessage);
        }
    };

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

    const nextStageIsVisible = (): boolean => {
        if (trainingUnits.length > 0) {
            return trainingUnits.every((unit) => {
                return (Array.isArray(unit.exercises) && unit.exercises.length > 0);
            })
        } else {
            return false
        }
    }

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
                        <p>You must add at least one exercise to each training unit to proceed further.</p>
                        {nextStageIsVisible() ? (
                            <TrainingUnitBox>
                                <p>Training Plan Details</p>
                                <form onSubmit={handleSubmitPlan(onSubmitPlan)}>
                                    <FormControl>
                                        <FormGroup sx={{ gap: '16px' }}>
                                            <TextField
                                              id="plan-form-name-input"
                                              label="Name *"
                                              {...registerPlan('name', { required: 'Name is required' })}
                                              error={!!errorsPlan.name}
                                              helperText={errorsPlan.name ? errorsPlan.name.message : ''}
                                            />
                                            <TextField
                                              id="plan-form-description-input"
                                              label="Description (optional)"
                                              {...registerPlan('description', { minLength: { value: 3, message: 'Description must be at least 3 characters long' } })}
                                              error={!!errorsPlan.description}
                                              helperText={errorsPlan.description ? errorsPlan.description.message : ''}
                                            />
                                            <Box sx={{display: "flex", justifyContent: "center", alignItems: "center"}}>
                                              <FormControlLabel
                                                control={
                                                  <Checkbox
                                                    {...registerPlan('mainPlan')}
                                                  />
                                                }
                                                label="Set as Main Plan"
                                              />
                                            </Box>
                                            <Box sx={{display: 'block', justifyContent: 'center'}}>
                                                {infoCreatorPlan && infoCreatorPlan.length > 0 && (
                                                    infoCreatorPlan.map((item, index) => (
                                                        <Box key={index} sx={{ display: 'flex', justifyContent: 'center' }}>
                                                            <p style={{ fontSize: '12px', color: 'red' }}>{item}</p>
                                                        </Box>
                                                    ))
                                                )}
                                            </Box>
                                            <Button variant="outlined" type="submit">
                                              Add Plan
                                            </Button>
                                        </FormGroup>
                                    </FormControl>
                                </form>
                            </TrainingUnitBox>
                        ) : (null)}
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
                                    {infoYourEx ? (
                                        <Box sx={{display: 'block' , textAlign: 'center'}}>
                                            <p style={{ fontSize: '12px', color: 'green'}}>{infoYourEx}</p>
                                        </Box>
                                    ) : null}
                                    {selectedYourExercise && selectedYourTrainingUnit !== '' ? (
                                        <Box sx={{paddingBottom: "15px"}}>
                                            <Button variant='outlined' onClick={handleAddExerciseToUnit}>Add to the plan</Button>
                                        </Box>
                                    ) : (
                                        <Box>
                                            <p>Select exercise and training unit in order to add exercise.</p>
                                        </Box>
                                    )}
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
                        </PlanCreatorExColumnBox>
                    ) : (null)}
                </PlanCreatorExMainBox>
            </StyledBoxShadow>
        </Box>
        </>
    )
}

export default TrainingPlanCreator;