'use client'
import { useEffect, useState } from "react";
import NavBar from "../_components/navbar";
import { StyledBoxShadow } from "../dashboard/_components/styled-components";
import { ExColumnBox, ExDetailsBox, ExMainBox, YourExBox, StyledHr} from "./_components/styled-components";
import axios, { AxiosError, AxiosResponse } from "axios";
import { Autocomplete, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, FormControlLabel, FormGroup, IconButton, Radio, RadioGroup, TextField } from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { SubmitHandler, useForm } from "react-hook-form";

const apiClient = axios.create({
    baseURL: 'http://localhost:3000/',
    withCredentials: true,
});

const Exercises = () => {
    const [yourExercises, setYourExercises] = useState<Exercise[]>();
    const [allExercises, setAllExercises] = useState<Exercise[]>();
    const [selectedYourExercise, setSelectedYourExercise] = useState<Exercise | null>(null);
    const [selectedYourExCategory, setSelectedYourExCategory] = useState<Category | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [yoursExercisesCategory, setYourExercisesCategory] = useState<Category[]>();
    const [infoYourEx, setInfoYourEx] = useState<string | null>(null);
    const [infoCreator, setInfoCreator] = useState<string[]>([]);
    const [categoryMode, setCategoryMode] = useState<'new' | 'existing'>('new'); 
    const [mode, setMode] = useState<"creator" | "editor" | null>(null);
    const [newCategory, setNewCategory] = useState<string | null>(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [existingCategory, setExistingCategory] = useState<number | null>(null);
    const {
        register: registerExercise,
        handleSubmit: handleSubmitExercise,
        formState: { errors: errorsExercise },
        reset: resetExercise,
    } = useForm<ExerciseDataForm>();

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
            if (mode === "creator") {
                await apiClient.post('/exercise/create', data)
                    .then(async response => {
                        await getYoursExercises();
                        await getCategories();
                        setSelectedYourExercise(response.data);
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
                        setInfoCreator((prev) => [...prev, error.response?.data?.message || "Unknown error occurred"]);
                    });
            } else if (mode === "editor" && selectedYourExercise) {
                await apiClient.patch(`exercise/update/${selectedYourExercise.id}`, data)
                    .then(async response => {
                        setSelectedYourExercise(response.data);
                        await getYoursExercises();
                        await getCategories();
                        setIsLoading(false);
                        setInfoYourEx(`${data.name} has been updated`);
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
                        setInfoCreator((prev) => [...prev, error.response?.data?.message || "Unknown error occurred"]);
                    });
            }
        } catch (error) {
            console.error("An error occurred during submission:", error);
        }
    };

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

    const handleCategoryModeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setCategoryMode(event.target.value as 'new' | 'existing');
        setNewCategory(null);
        setExistingCategory(null);
    };

    const handleSetMode = (newMode: "creator" | "editor" | null) => {
        if (newMode === "creator") {
            resetExercise({ 
                name: "",
                description: "",
                sets: undefined,
                reps: undefined,
                load: undefined,
                tempo: "",
            });
            setCategoryMode("new");
        }
        if (newMode === "editor" && selectedYourExercise) {
            resetExercise({
                name: selectedYourExercise.name || "",
                description: selectedYourExercise.description || "",
                sets: selectedYourExercise.sets || undefined,
                reps: selectedYourExercise.reps || undefined,
                load: selectedYourExercise.load || undefined,
                tempo: selectedYourExercise.tempo || "",
            });
            if (selectedYourExercise.categories) {
                setCategoryMode("existing"); 
            } else {
                setCategoryMode("new"); 
            }
        }
        setMode(newMode);
    };

    const handleDeleteEx = () => {
        setOpenDialog(true);
      };
  
      const handleDialogClose = () => {
        setOpenDialog(false);
      };
  
      const handleDeleteConfirmEx = async () => {
        try {
          await apiClient.delete(`exercise/delete/${selectedYourExercise?.id}`);
          await getYoursExercises();
          await getCategories();
          setSelectedYourExercise(null);
          setOpenDialog(false);
        } catch (error) {
            console.error('Error deleting training unit:', error);
        }
      };

    const validateTempo = (value: string | undefined) => {
        if (!value || typeof value !== 'string') {
            return true;
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

    return(
        <>
            <NavBar/>
            <StyledBoxShadow sx={{padding: "15px 15px 15px 15px",margin: "200px 0 200px 0"}}>
                <ExMainBox>
                    <ExColumnBox>
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
                                sx={{minWidth: "270px"}}
                                options={yourExercises || []}
                                getOptionLabel={(option) => option.name} 
                                renderInput={(params) => (
                                    <TextField {...params} label="Choose exercise" variant="outlined" />
                                )}
                                value={selectedYourExercise}
                                onChange={(event, newValue) => setSelectedYourExercise(newValue)}
                                isOptionEqualToValue={(option, value) => option.id === value?.id}
                            />
                            <Dialog open={openDialog} onClose={handleDialogClose}>
                                <DialogTitle>Confirm Deletion</DialogTitle>
                                <DialogContent>
                                    <p>Are you sure you want to delete the raport "{selectedYourExercise?.name}"?</p>
                                </DialogContent>
                                <DialogActions>
                                    <Button onClick={handleDialogClose} color="primary">
                                        Cancel
                                    </Button>
                                    <Button onClick={handleDeleteConfirmEx} color="secondary">
                                        Delete
                                    </Button>
                                </DialogActions>
                            </Dialog>
                            {infoYourEx ? (
                                <Box sx={{display: 'block' , textAlign: 'center'}}>
                                    <p style={{ fontSize: '12px', color: 'green'}}>{infoYourEx}</p>
                                </Box>
                            ) : null}
                            {selectedYourExercise ? (
                            <>
                            <ExDetailsBox>
                                <Box sx={{display: "flex", gap: "20px" }}>
                                    <h3 style={{ margin: "15px 0 0 0" }}>{selectedYourExercise.name}</h3>
                                    <IconButton
                                      onClick={() => handleDeleteEx()}
                                      aria-label="delete"
                                      title="Delete Training Plan"
                                    >
                                      <DeleteIcon sx={{fontSize: "30px"}}/>
                                    </IconButton>
                                    <IconButton
                                      onClick={() => handleSetMode("editor")}
                                      aria-label="edit"
                                      title="Edit Training Plan"
                                    >
                                        <EditIcon sx={{fontSize: "30px"}}/>
                                    </IconButton>
                                </Box>
                                <StyledHr/>
                                <Box sx={{display:"flex", gap: "0px",flexDirection: "column", textAlign: "left", width: "100%", paddingLeft: "30px"}}>
                                    <p style={{margin: "5px 0 0 0"}}><strong>Sets:</strong> {selectedYourExercise.sets}</p>
                                    <p style={{margin: "5px 0 0 0"}}><strong>Reps</strong>: {selectedYourExercise.reps}</p>
                                    {selectedYourExercise.tempo && <p style={{margin: "5px 0 0 0"}}><strong>Tempo</strong>: {selectedYourExercise.tempo.join('-')}</p>}
                                </Box>
                            </ExDetailsBox>
                            </>
                            ) : (null)}
                            {!mode && (
                              <Box sx={{ paddingTop: "15px" }}>
                                <Button variant="outlined" onClick={() => handleSetMode("creator")}>
                                  OPEN EXERCISE CREATOR
                                </Button>
                              </Box>
                            )}
                        </YourExBox>
                    </ExColumnBox>
                    {mode ? (
                        <ExColumnBox sx={{borderLeft: '4px solid lightgray', paddingLeft: "20px"}}>
                            <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column'}}>
                                <p>{mode === "creator" ? ("Exercise creator") : ("Exercise editor")}</p>
                                <form key={mode} onSubmit={handleSubmitExercise(onSubmitEx)}>
                                    <FormControl>
                                        <FormGroup sx={{ gap: '16px' }}>
                                            <TextField
                                                id="ex-form-name-input"
                                                label="Name *"
                                                defaultValue={mode === "editor" ? selectedYourExercise?.name || '' : ''}
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
                                                    options={yoursExercisesCategory ?? []} 
                                                    getOptionLabel={(option) => option?.name || ''} 
                                                    value={
                                                        (yoursExercisesCategory ?? []).find((category) =>
                                                            selectedYourExercise?.categories?.some((selectedCategory) => selectedCategory.id === category.id)
                                                        ) || null
                                                    } 
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
                                            <Button variant="outlined" type="submit" >
                                                {mode === "creator" ? ("Add Exercise") : ("Edit Exercise")}
                                            </Button>
                                            <Box sx={{margin: "15px 0 0 0"}}>
                                                <Button variant='outlined' sx={{ width: "100%" }} onClick={() => handleSetMode(null)}>
                                                    {mode === "creator" ? ("CLOSE CREATOR") : ("CLOSE EDITOR")}
                                                </Button>
                                            </Box>
                                        </FormGroup>
                                    </FormControl>
                                </form>
                            </Box>
                        </ExColumnBox>
                    ) : (null)}
                    
                </ExMainBox>
            </StyledBoxShadow>
        </>
    )
    
}

export default Exercises;