import { Box } from "@mui/material";
import styled from "styled-components";

export const DietMainBox = styled(Box)(() => ({
    display: 'flex',
    justifyContent: 'space-between',
    gap: '10px',
}));

export const DietColumnBox = styled(Box)(() => ({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    minWidth: "300px"
}));

export const DietElBox = styled(Box)(() => ({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
    borderRadius: "8px",
    padding: "20px",
    margin: "0 0 20px 0",
    minWidth: "200px"
}));

export const StyledHr = styled.hr(() => ({
    width: '90%',                    
    height: '1px',
    border: 'none', 
    backgroundColor: '#888888',        
    margin: '5px 0 20px 0',    
}));

export const StyledBoxShadow = styled(Box)(() => ({
    borderRadius: "25px",
    border: "1px",
    padding: "5px 40px 30px 20px",
    boxShadow: "5px 10px 18px #888888",
    minWidth: "300px"
}));