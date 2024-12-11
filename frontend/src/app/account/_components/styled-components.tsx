import { Box } from "@mui/material";
import styled from "styled-components";

export const UserMainBox = styled(Box)(() => ({
    display: 'flex',
    justifyContent: 'space-between',
    gap: '10px',
}));

export const UserColumn = styled(Box)(() => ({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    minWidth: "300px"
}));