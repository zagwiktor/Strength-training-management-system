import { Box } from "@mui/material";
import styled from "styled-components";

export const RaportMainBox = styled(Box)(() => ({
    display: 'flex',
    justifyContent: 'space-between',
    gap: '10px',
}));

export const ColumnRaport = styled(Box)(() => ({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    minWidth: "300px"
}));

export const StyledHr = styled.hr(() => ({
    width: '90%',                    
    height: '1px',
    border: 'none', 
    backgroundColor: '#888888',        
    margin: '15px 0 10px 0',    
}));

export const RaportDetailsBox = styled(Box)(() => ({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
    borderRadius: "8px",
    padding: "20px",
    margin: "20px 0 20px 0",
    minWidth: "250px"
}));