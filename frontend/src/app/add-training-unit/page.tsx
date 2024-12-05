'use client'
import axios, { AxiosError, AxiosResponse } from 'axios';
import { TrainingPlan } from './types';
import NavBar from '../_components/navbar';
import { Box, Button } from '@mui/material';
import { useEffect, useState } from 'react';
import { StyledBoxShadow } from '../_components/styled-components';
import { useRouter } from 'next/navigation';

const apiClient = axios.create({
    baseURL: 'http://localhost:3000/',
    withCredentials: true,
});

const AddTrainingUnit = () => {
    const [mainTrainingPlan, setMainTrainingPlan] = useState<TrainingPlan | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter()

    const getMainPlan = async () => {
        await apiClient.get('training-plan/getMainPlan')
        .then((response: AxiosResponse) => {
            setMainTrainingPlan(response.data);
        })
        .catch((error: AxiosError) => {
            console.log(error) 
        })
    }

    useEffect(() => {
        const fetchData = async () => {
            await getMainPlan();
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
        <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', margin: "100px 0 100px 0"}}>
        <StyledBoxShadow>
            {mainTrainingPlan && mainTrainingPlan.id ? (
                <p>{mainTrainingPlan.name} PLAN</p>
            ) : (
                <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column'}}>
                    <p>An error occurred while loading the training plan to which the training unit was to be added.</p>
                    <Button variant="outlined" onClick={() => router.back()} color="primary">
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