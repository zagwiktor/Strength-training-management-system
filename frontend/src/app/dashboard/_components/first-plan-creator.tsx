import { StyledBoxShadow } from "@/app/_components/styled-components";
import { Box } from "@mui/material";
import axios from "axios";

const apiClient = axios.create({
    baseURL: 'http://localhost:3000/',
    timeout: 1000,
});

const FirstPlanCreator = () => {
    return (
        <Box>
            <p>To create a training plan, you first need to add exercises.</p>
            <StyledBoxShadow>

            </StyledBoxShadow>
        </Box>
    )
}

export default FirstPlanCreator;