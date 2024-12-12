'use client'

import { Box, Button, FormControl, IconButton, InputLabel, MenuItem, Select, TextField, FormGroup, DialogTitle, Dialog, DialogContent, DialogActions} from "@mui/material"
import NavBar from "../_components/navbar"
import { useEffect, useState } from "react";
import { DietType } from "./types";
import axios, { AxiosError, AxiosResponse } from "axios";
import { DietElBox, DietColumnBox, DietMainBox, StyledHr, StyledBoxShadow} from "./_components/styled-components";
import InfoIcon from '@mui/icons-material/Info';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

const apiClient = axios.create({
    baseURL: 'http://localhost:3000/',
    withCredentials: true,
})

const Diet = () => {
    const [diet, setDiet] = useState<DietType | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activityFactor, setActivityFactor] = useState<number | null>(null);
    const [weightAndHeight, setWeightAndHeight] = useState<{weight: number, height: number, gender: "Male" | "Female"} | null>(null);
    const [bmi, setBmi] = useState<number | null>(null);
    const [calories, setCalories] = useState<number | null>(null);
    const [mode, setMode] = useState<"creator" | "editor" | null>(null);
    const [infoError, setInfoError] = useState<string | null>(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [formData, setFormData] = useState<Omit<DietType, 'id'>>({
        calories: 0,
        protein: 0,
        fat: 0,
        carbohydrates: 0,
    });

    const getDiet = async () => {
        await apiClient.get('diet/get')
        .then((res: AxiosResponse) => {
            setDiet(res.data[0])
        })
        .catch((error: AxiosError) => {
            console.log(error)
        })
    }

    const getActiveUser = async () => {
        await apiClient.get("user/get")
        .then((res: AxiosResponse) => {
            setWeightAndHeight({
                weight: res.data.weight,
                height: res.data.height,
                gender: res.data.gender
            });
        })
        .catch((error: AxiosError) => {
          console.log(error);
        });
    };

    const calculateBmi = async () => {
        if(weightAndHeight) {
            if (weightAndHeight.weight <= 0 || weightAndHeight.height <= 0) {
                console.error("Weight and height must be positive numbers");
                return;
            }
            const heightInMeters = weightAndHeight.height / 100;
            const bmiValue = weightAndHeight.weight / (heightInMeters * heightInMeters);
            setBmi(parseFloat(bmiValue.toFixed(2)));
        }
    };

    const calculateCalories = () => {
        if (weightAndHeight && activityFactor) {
            const { weight, height, gender } = weightAndHeight;
            const bmr =
                10 * weight +
                6.25 * height -
                5 * 30 + 
                (gender === "Male" ? 5 : -161);
            const totalCalories = bmr * activityFactor;
            setCalories(Math.round(totalCalories));
        }
    };

    const handleSetMode = (newMode: "creator" | "editor" | null) => {
        if (newMode === "editor" && diet) {
            setFormData({
                calories: diet.calories,
                protein: diet.protein,
                fat: diet.fat,
                carbohydrates: diet.carbohydrates,
            });
        } else if (newMode === "creator") {
            setFormData({
                calories: 0,
                protein: 0,
                fat: 0,
                carbohydrates: 0,
            });
        }
        setMode(newMode);
    };

    const handleFormSubmit = async () => {
        try {
            if (mode === "creator") {
                await apiClient.post("diet/create", formData)
                    .then((response) => {
                        console.log("Diet created successfully:", response.data);
                        setDiet(response.data);
                        setMode(null); 
                    });
            } else if (mode === "editor") {
                if (diet) {
                    await apiClient.patch(`diet/update/${diet.id}`, formData)
                        .then((response) => {
                            console.log("Diet updated successfully:", response.data);
                            setDiet(response.data);
                            setMode(null); 
                        });
                } else {
                    console.error("No diet selected for editing.");
                    setInfoError("No diet selected for editing.");
                }
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const errorMessage = error.response?.data?.message || "Unknown error occurred.";
                setInfoError(errorMessage);
            } else {
                setInfoError("An unexpected error occurred.");
            }
        }
    };

    const handleDelete = () => {
        setOpenDialog(true);
      };
  
    const handleDialogClose = () => {
      setOpenDialog(false);
    };

    const handleDeleteConfirmDiet = async () => {
      try {
        await apiClient.delete(`diet/delete/${diet?.id}`);
        await getDiet();
        setDiet(null);
        setOpenDialog(false);
      } catch (error) {
          console.error('Error deleting diet:', error);
      }
    };

    useEffect(() => {
        const fetchData = async () => {
            await getDiet();
            await getActiveUser();
            setIsLoading(false);
        };
        fetchData();
    }, []);

    if (isLoading) {
        return <div>Loading...</div>;  
    }

    return (
        <>
            <NavBar/>
            <StyledBoxShadow sx={{margin: "200px 0 200px 0"}}>
                <DietMainBox>
                    <DietColumnBox>
                        <p>Your Diet</p>
                        <Box sx={{marginBottom: "15px"}}>
                            <IconButton
                              onClick={() => setOpenDialog(true)}
                              aria-label="delete"
                              title="Delete Diet"
                            >
                              <DeleteIcon/>
                            </IconButton>
                            <IconButton
                              onClick={() => handleSetMode("editor")}
                              aria-label="edit"
                              title="Edit Diet"
                            >
                              <EditIcon />
                            </IconButton>
                        </Box>
                        {diet ? (
                            <DietElBox>
                                <p><strong>Calories:</strong> {diet.calories} kcal</p>
                                <p><strong>Protein:</strong> {diet.protein} g</p>
                                <p><strong>Fat:</strong> {diet.fat} g</p>
                                <p><strong>Carbohydrates:</strong> {diet.calories} g</p>
                            </DietElBox>
                        ) : (
                            <DietElBox>
                                <p>You have not added diet yet.</p>
                                <Button variant="outlined" color="primary" onClick={() => handleSetMode("creator")}>
                                    Add Diet
                                </Button>
                            </DietElBox>
                            
                            
                        )}
                    <Dialog open={openDialog} onClose={handleDialogClose}>
                        <DialogTitle>Confirm Deletion</DialogTitle>
                        <DialogContent>
                            <p>Are you sure you want to delete the diet?</p>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleDialogClose} color="primary">
                                Cancel
                            </Button>
                            <Button onClick={handleDeleteConfirmDiet} color="secondary">
                                Delete
                            </Button>
                        </DialogActions>
                    </Dialog>
                    </DietColumnBox>
                    <DietColumnBox sx={{borderLeft: '4px solid lightgray', paddingLeft: "40px"}}>
                        <p>Diet advisor</p>
                        <DietElBox>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <p>Bmi Calculator</p>
                                <IconButton
                                  aria-label="info"
                                  title="BMI is an approximate value and may not be accurate for individuals with a high muscle mass."
                                >
                                    <InfoIcon sx={{fontSize: "20px"}}/>
                                </IconButton>
                            </Box>
                            <Button onClick={calculateBmi} variant="outlined">
                                Calculate BMI
                            </Button>
                            {bmi ? (
                                <p><strong>BMI:</strong> {bmi}</p>
                            ) : (null)}
                            
                        </DietElBox>
                        <StyledHr/>
                        <DietElBox>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <p>Calorie Maintenance Calculator</p>
                                <IconButton
                                    aria-label="info"
                                    title="This is an approximate value calculated using the Harris-Benedict equation."
                                >
                                    <InfoIcon sx={{ fontSize: "20px" }} />
                                </IconButton>
                            </Box>
                            <FormControl fullWidth sx={{ marginBottom: 2 }}>
                                <InputLabel id="activity-label">Activity Level</InputLabel>
                                <Select
                                    labelId="activity-label"
                                    value={activityFactor || ""}
                                    onChange={(e) => setActivityFactor(Number(e.target.value))}
                                    label="Activity Level"
                                >
                                    <MenuItem value={1.2}>Sedentary (little or no exercise)</MenuItem>
                                    <MenuItem value={1.375}>Lightly active (light exercise/sports 1-3 days/week)</MenuItem>
                                    <MenuItem value={1.55}>Moderately active (moderate exercise/sports 3-5 days/week)</MenuItem>
                                    <MenuItem value={1.725}>Very active (hard exercise/sports 6-7 days a week)</MenuItem>
                                    <MenuItem value={1.9}>Super active (very hard exercise/sports, physical job)</MenuItem>
                                </Select>
                            </FormControl>

                            {activityFactor && (
                                <Button onClick={calculateCalories} variant="outlined">
                                    Calculate Calories
                                </Button>
                            )}

                            {calories && (
                                <Box sx={{ marginTop: 2 }}>
                                    <p><strong>Calories for Maintenance:</strong> {calories} kcal/day</p>
                                </Box>
                            )}
                        </DietElBox>
                    </DietColumnBox>
                    {mode && (
                        <DietColumnBox sx={{ borderLeft: '4px solid lightgray', marginLeft: "40px", padding: "20px", maxWidth: "400px" }}>
                            <h3>{mode === "creator" ? "Diet Creator" : "Diet Editor"}</h3>
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                handleFormSubmit();
                            }}>
                                <FormControl fullWidth>
                                    <FormGroup sx={{ gap: "16px" }}>
                                    <TextField
                                        label="Calories"
                                        type="number"
                                        value={formData.calories}
                                        onChange={(e) => setFormData({ ...formData, calories: Number(e.target.value) })}
                                        required
                                    />
                                    <TextField
                                        label="Protein (g)"
                                        type="number"
                                        value={formData.protein}
                                        onChange={(e) => setFormData({ ...formData, protein: Number(e.target.value) })}
                                        required
                                    />
                                    <TextField
                                        label="Fat (g)"
                                        type="number"
                                        value={formData.fat}
                                        onChange={(e) => setFormData({ ...formData, fat: Number(e.target.value) })}
                                        required
                                    />
                                    <TextField
                                        label="Carbohydrates (g)"
                                        type="number"
                                        value={formData.carbohydrates}
                                        onChange={(e) => setFormData({ ...formData, carbohydrates: Number(e.target.value) })}
                                        required
                                    />
                                    {infoError && (
                                        <Box sx={{ marginTop: 2, color: 'red', textAlign: 'center' }}>
                                            <p>{infoError}</p>
                                        </Box>
                                    )}
                                    <Button
                                        variant="outlined"
                                        color={mode === "creator" ? "primary" : "secondary"}
                                        type="submit"
                                    >
                                        {mode === "creator" ? "Create Diet" : "Update Diet"}
                                    </Button>
                                    </FormGroup>
                                </FormControl>
                            </form>
                            <Button
                                variant="outlined"
                                sx={{ marginTop: "20px" }}
                                onClick={() => setMode(null)}
                            >
                                Close {mode === "creator" ? "Creator" : "Editor"}
                            </Button>
                        </DietColumnBox>
                    )}
                </DietMainBox>
            </StyledBoxShadow>
        </>
    )
}

export default Diet;