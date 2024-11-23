import { Box } from "@mui/material";
import styled from "styled-components";

export const ExerciseBox = styled(Box)(() => ({
    borderRadius: "7px",
    padding: "1px 0 1px 1px",
    border: "1px",
    marginBottom: "10px",
    boxShadow: "3px 3px 3px #888888"
}));

export const StyledBoxShadow = styled(Box)(() => ({
    borderRadius: "25px",
    border: "1px",
    padding: "5px 70px 30px 70px",
    boxShadow: "5px 10px 18px #888888",
    minWidth: "300px"
}));

export const IconArrowBox = styled(Box)(() => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '8px',
    marginRight: '10px',
    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
    transition: 'background-color 0.3s ease', 
    '&:hover': {
      backgroundColor: '#f2f2f2',
      cursor: 'pointer', 
    },
}));

export const FirstPlanExMainBox = styled(Box)(() => ({
    display: 'flex',
    justifyContent: 'space-between',
    gap: '10px',
}));



export const FirstPlanExColumnBox = styled(Box)(() => ({
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
    minWidth: "300px"
}));

export const YourExBox = styled(Box)(() => ({
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
    minWidth: "300px",
    maxHeight: "500px"
}));