import { Box } from "@mui/material";
import styled from "styled-components";

export const PlanCreatorExMainBox = styled(Box)(() => ({
    display: 'flex',
    justifyContent: 'space-between',
    gap: '10px',
}));

export const PlanCreatorExColumnBox = styled(Box)(() => ({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    minWidth: "300px"
}));

export const NameForTrainingPlanBox = styled(Box)(() => ({
    display: 'flex', 
    alignItems: 'center', 
    gap: "15px", 
    marginBottom: '16px'
}));

export const YourExBox = styled(Box)(() => ({
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
    minWidth: "300px",
    maxHeight: "500px"
}));

export const TrainingUnitBox = styled(Box)(() => ({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
    borderRadius: "8px",
    padding: "20px",
    marginBottom: "10px",
    minWidth: "250px"
}));

export const ExerciseBox = styled(Box)(() => ({
    borderRadius: "7px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    border: "1px",
    marginBottom: "10px",
    width: '95%'
}));



export const StyledHr = styled.hr(() => ({
    width: '90%',                    
    height: '1px',
    border: 'none', 
    backgroundColor: '#888888',        
    margin: '5px 0 10px 0',    
}));