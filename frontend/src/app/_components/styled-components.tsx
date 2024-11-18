import styled from 'styled-components';
import { Box } from '@mui/material';


export const StyledBox = styled(Box)(() => ({
    borderRadius: "25px",
    border: "1px",
    padding: "25px",
    boxShadow: "5px 10px 18px #888888",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center"
  }));

export const StyledBoxShadow = styled(Box)(() => ({
  borderRadius: "25px",
  border: "1px",
  padding: "25px",
  boxShadow: "5px 10px 18px #888888"
}));

export const StyledHr = styled.hr(() => ({
  width: '100%',                    
  height: '1px',
  border: 'none', 
  backgroundColor: '#888888',        
  margin: '20px 0', 
}));

