'use client'
import NavBar from "@/app/_components/navbar";
import { StyledBoxShadow } from '../../_components/styled-components';
import { Box, Button, IconButton, TextField } from "@mui/material";
import axios, { AxiosError, AxiosResponse } from "axios";
import { useParams, useRouter } from "next/navigation";
import DeleteIcon from '@mui/icons-material/Delete';
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { ExerciseBox, NameForTrainingUnitBox, StyledHr, TrainingUnitBox, UnitCreatorExColumnBox, UnitCreatorExMainBox } from "@/app/add-training-unit/_components/styled-components";

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


    useEffect(() => {
        const fetchData = async () => {
            await getTrainingUnit();
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
                                                    // onClick={backToDashboard}
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
                            </UnitCreatorExColumnBox>
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