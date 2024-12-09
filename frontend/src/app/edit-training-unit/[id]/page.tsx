'use client'
import NavBar from "@/app/_components/navbar";
import { StyledBoxShadow } from '../../_components/styled-components';
import { Autocomplete, Box, Button, Dialog, DialogActions, DialogContent, IconButton, TextField, DialogTitle, FormGroup, FormControl, FormControlLabel, Radio, RadioGroup } from "@mui/material";
import axios, { AxiosError, AxiosResponse } from "axios";
import { useParams, useRouter } from "next/navigation";
import DeleteIcon from '@mui/icons-material/Delete';
import { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { ExerciseBox, NameForTrainingUnitBox, StyledHr, TrainingUnitBox, UnitCreatorExColumnBox, UnitCreatorExMainBox, YourExBox } from "@/app/add-training-unit/_components/styled-components";

const apiClient = axios.create({
    baseURL: 'http://localhost:3000/',
    withCredentials: true
});

const EditTrainingPlan = () => {
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
    const [infoEditorUnit, setInfoEditorUnit] = useState<string | null>(null);
    const [categoryMode, setCategoryMode] = useState<'new' | 'existing'>('new'); 
    const [newCategory, setNewCategory] = useState<string | null>(null);
    const [existingCategory, setExistingCategory] = useState<number | null>(null);
    const [openDialogUnit, setOpenDialogUnit] = useState(false);
    const router = useRouter();
    const {
        register: registerExercise,
        handleSubmit: handleSubmitExercise,
        formState: { errors: errorsExercise },
        reset: resetExercise,
    } = useForm<ExerciseDataForm>();
    const id = useParams().id
    const getTrainingUnit = async () => {
        await apiClient.get(`training-units/get/${id}`)
        .then((response: AxiosResponse) => {
            setTrainingUnit(response.data)
        })
        .catch((error: AxiosError) => {
            console.log(error);
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

    const handleDeleteUnit = () => {
        setOpenDialogUnit(true);
    };
  
    const handleDialogCloseUnit = () => {
        setOpenDialogUnit(false);
    };
  
    const handleCategoryModeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setCategoryMode(event.target.value as 'new' | 'existing');
        setNewCategory(null);
        setExistingCategory(null);
    };

    const handleDeleteConfirmUnit = async (id: string | string[] | undefined) => {
        try {
          await apiClient.delete(`training-units/delete/${id}`);
          setOpenDialogUnit(false);
          router.push('/dashboard')
        } catch (error) {
            console.error('Error deleting training unit:', error);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            await getTrainingUnit();
            await getYoursExercises();
            await getCategories();
            setIsLoading(false);
        }
        fetchData();
    }, [])

    if (isLoading) {
        return <div>Loading...</div>;  
    }

    const handleChangeName = () => {
        if (newUnitName.trim() && trainingUnit && trainingUnit.exercises) {
            const trainingUnitUpdate = trainingUnit;
            setTrainingUnit({name: newUnitName.trim(), exercises: trainingUnitUpdate.exercises});
            setNewUnitName(''); 
        }
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

    const deleteExFromUnit = (id: number) => {
        setTrainingUnit((prev) => {
            if (!prev || prev.exercises.length <= 1) {
                return prev;
            }
            const updatedExercises = prev.exercises.filter((exercise) => exercise.id !== id);
            return { ...prev, exercises: updatedExercises };
        });
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

    const handleEditTrainingUnit = async () => {

        const exercisesUpdated = trainingUnit?.exercises.map((ex) => {
            return ex.id 
        })
        const data = {'name': trainingUnit?.name, 'exercises': exercisesUpdated}
        console.log(data)
        await apiClient.patch(`training-units/update/${id}`, data)
        .then((res) => {
            router.push('/dashboard');
        })
        .catch((error) => {
            console.log(error);
        })
    }

    return (
        <>
        <NavBar/>
        <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', margin: "100px 0 100px 0"}}>
            <StyledBoxShadow>
                {trainingUnit && trainingUnit.exercises ? (
                    <Box>
                        <UnitCreatorExMainBox>
                            <UnitCreatorExColumnBox sx={{padding: '0 15px 0 0'}}>
                                <NameForTrainingUnitBox>
                                    <TextField
                                        label="Training Unit Name"
                                        variant="outlined"
                                        value={newUnitName}
                                        onChange={(e) => setNewUnitName(e.target.value)}
                                        sx={{ flex: 1 }}
                                    />
                                    <Button variant="outlined" onClick={handleChangeName} sx={{ height: 'maxHeight' }}>
                                        Change name
                                    </Button>
                                </NameForTrainingUnitBox>
                                <TrainingUnitBox>
                                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                        <h3>{trainingUnit.name}</h3>
                                        <IconButton
                                        onClick={handleDeleteUnit}
                                        aria-label="delete"
                                        title="Delete Training Unit"
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </Box>
                                    <Dialog open={openDialogUnit} onClose={handleDialogCloseUnit}>
                                        <DialogTitle>Confirm Deletion</DialogTitle>
                                        <DialogContent>
                                            <p>Are you sure you want to delete the training unit "{trainingUnit.name}"?</p>
                                        </DialogContent>
                                        <DialogActions>
                                            <Button onClick={handleDialogCloseUnit} color="primary">
                                              Cancel
                                            </Button>
                                            <Button onClick={() => handleDeleteConfirmUnit(id)} color="secondary">
                                              Delete
                                            </Button>
                                        </DialogActions>
                                    </Dialog>
                                    <StyledHr />
                                    {trainingUnit.exercises.length > 0 ? (
                                        trainingUnit.exercises.map((exercise, index) => (
                                            <ExerciseBox key={index}>
                                                {`${index + 1}. ${exercise.name}`}
                                                <IconButton
                                                    onClick={() => deleteExFromUnit(exercise.id)}
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
                                <Box sx={{display: "flex", gap: "10px", marginTop: "15px"}}>
                                    <Button variant="outlined" color="primary" onClick={handleEditTrainingUnit}>
                                        Edit
                                    </Button>
                                    <Button variant="outlined" onClick={() => router.push('/dashboard')} color="primary">
                                        Back to dashboard
                                    </Button>
                                </Box>
                            </UnitCreatorExColumnBox>
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
                            {isExCreatorVisible && trainingUnit ? (
                                <UnitCreatorExColumnBox sx={{borderLeft: '4px solid lightgray', padding: '0 15px 0 15px'}}>
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
                        <p>An error occurred while loading the training unit which was to be added.</p>
                        <Button variant="outlined" onClick={() => router.push('/dashboard')} color="primary">
                            Back
                        </Button>
                    </Box>
                )}
            </StyledBoxShadow>
        </Box>
        </>
    )
}

export default EditTrainingPlan;