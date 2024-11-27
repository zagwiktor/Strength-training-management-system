import axios, { AxiosResponse } from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { Box, Button, FormControl, FormGroup, MenuItem, TextField } from "@mui/material";
import { StyledBoxShadow } from "@/app/_components/styled-components";


const apiClient = axios.create({
    baseURL: 'http://localhost:3000/auth',
    withCredentials: true
  });

type RegisterDataForm = {
    name: string,
    surname: string,
    email: string,
    password: string,
    weight: number,
    height: number,
    age: number,
    gender: "Male" | "Female",
};


const RegisterForm = () => {
    const { register, handleSubmit, formState: { errors }} = useForm<RegisterDataForm>()
    const [info, setInfo] = useState<string[] | null>(null);
    const router = useRouter();
    const onSubmit:SubmitHandler<RegisterDataForm> = async (data: RegisterDataForm) => {
        data.height = parseFloat(data.height as unknown as string);
        data.weight = parseFloat(data.weight as unknown as string);
        data.age = parseFloat(data.age as unknown as string);
        await apiClient.post('/register', data).then((response: AxiosResponse) => {
            router.push(`/login?user=${data.email}`);
        }).catch((errors) => {
            const newInfo = errors.response.data.message === 'Email already exists'
            ? [errors.response.data.message]
            : errors.response.data.message;
            setInfo(newInfo);
        });
    }
    return (
        <StyledBoxShadow>
            <form onSubmit={handleSubmit(onSubmit)}>
                <FormControl>
                    <FormGroup sx={{ gap: '16px' }}>
                        <TextField
                            id='register-form-name-input'
                            label='Name'
                            variant="filled"
                            {...register('name', {required:'Name is required'})}
                            error={!!errors.name}
                            helperText={errors.name ? errors.name.message : ''}
                        />
                        <TextField
                            id='register-form-surname-input'
                            label='Surname'
                            variant="filled"
                            {...register('surname', {required: 'Surname is required'})}
                            error={!!errors.surname}
                            helperText={errors.surname ? errors.surname.message : ''}
                        />
                        <TextField
                            id='register-form-email-input'
                            label='Email'
                            variant="filled"
                            {...register('email', {required: 'Email is required'})}
                            error={!!errors.email}
                            helperText={errors.email ? errors.email.message : ''}
                        />
                        <TextField
                            id='register-form-password-input'
                            label='Password'
                            variant="filled"
                            type='password'
                            {...register('password', {required: 'Password is required'})}
                            error={!!errors.password}
                            helperText={errors.password ? errors.password.message : ''}
                        />
                        <TextField
                            id="register-form-age-input"
                            label="Age (years)"
                            type="number"
                            variant="filled"
                            slotProps={{
                                inputLabel: {
                                  shrink: true,
                                },
                            }}
                            {...register('age', {required: 'Age is required'})}
                            error={!!errors.age}
                            helperText={errors.age ? errors.age.message : ''}
                        />   
                        <TextField
                            id="register-form-weight-input"
                            label="Weight (kg)"
                            type="number"
                            variant="filled"
                            slotProps={{
                                inputLabel: {
                                  shrink: true,
                                },
                            }}
                            {...register('weight', {required: 'Weight is required'})}
                            error={!!errors.weight}
                            helperText={errors.weight ? errors.weight.message : ''}
                        />      
                        <TextField
                            id="register-form-height-input"
                            label="Height (cm)"
                            type="number"
                            variant="filled"
                            slotProps={{
                                inputLabel: {
                                  shrink: true,
                                },
                            }}
                            {...register('height', {required: 'Height is required'})}
                            error={!!errors.height}
                            helperText={errors.height ? errors.height.message : ''}
                        />  
                        <TextField
                            id="register-form-gender-input"
                            select
                            label="Select gender"
                            defaultValue=""
                            variant="filled"
                            {...register('gender', { required: 'Gender is required' })}
                            error={!!errors.gender}
                            helperText={errors.gender ? errors.gender.message : ''}
                        >
                            <MenuItem value="Male">Male</MenuItem>
                            <MenuItem value="Female">Female</MenuItem>
                        </TextField>
                        <Button type='submit' variant='outlined'>REGISTER</Button>
                        <Box sx={{display: 'block' , justifyContent: 'center'}}>
                            {info && info.length > 0 ? (
                                info.map((item, index) => (
                                    <Box key={index} sx={{display: 'flex' , justifyContent: 'center'}}>
                                        <p style={{ fontSize: '12px', color: 'red'}}>{item}</p>
                                    </Box>
                            ))) : null}
                        </Box>
                        <Box sx={{display: 'flex' ,justifyContent: 'center'}}>
                            <p style={{ fontSize: '12px' }}>Do you already have an account? <a href='/login'>Login!</a></p>
                        </Box>
                    </FormGroup>
                </FormControl>
            </form>
        </StyledBoxShadow>
    )
};

export default RegisterForm;