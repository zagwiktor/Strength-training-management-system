
import { SubmitHandler, useForm } from 'react-hook-form';
import { Box, FormControl, FormGroup, TextField, Button } from '@mui/material';
import axios, { AxiosError, AxiosResponse } from 'axios'
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { StyledBoxShadow } from '@/app/_components/styled-components';


type LoginDataForm = {
    email: string,
    password: string,
}
const apiClient = axios.create({
    baseURL: 'http://localhost:3000/auth',
    withCredentials: true
});

const LoginForm = () => {
    const { register, handleSubmit, formState: { errors } } = useForm<LoginDataForm>();
    const [info, setInfo] = useState<string | null>(null);
    const router = useRouter();
    const searchParams = useSearchParams();
    const createdUser = searchParams.get('user');
    
    const onSubmit:SubmitHandler<LoginDataForm> = async (data: LoginDataForm) => {
        setInfo(null);
        await apiClient.post('/login', data).then((response: AxiosResponse) => {
            router.push('/dashboard')
        }).catch((error: AxiosError) => {
            setInfo('Invalid credentials!');
        })
    }

    useEffect(() => {
        if (createdUser) {
          setInfo(`${createdUser} successfully registered! Please log in.`);
        }
      }, [createdUser]);
    
    return (
        <StyledBoxShadow>
            <form onSubmit={handleSubmit(onSubmit)}>
            <FormControl>
                <FormGroup sx={{ gap: '16px' }}>
                    <TextField
                        id="login-form-name-input"
                        label="Email"
                        variant="filled"
                        {...register('email', { required: 'Name is required' })}
                        error={!!errors.email}
                        helperText={errors.email ? errors.email.message : ''}
                    />
                    <TextField
                        id="login-form-username-input"
                        label="Password"
                        variant="filled"
                        type='password'
                        {...register('password', { required: 'Username is required' })}
                        error={!!errors.password}
                        helperText={errors.password ? errors.password.message : ''}
                    />
                    <Button type='submit' variant='outlined'>Login</Button>
                    <Box sx={{display: 'block' , textAlign: 'center'}}>
                        <p style={{ fontSize: '12px', color: 'red'}}>{info}</p>
                    </Box>
                    <Box sx={{display: 'flex' ,justifyContent: 'center'}}>
                    <p style={{ fontSize: '12px' }}>Don't have you account yet? <a href='/register'>Register!</a></p>
                    </Box>
                </FormGroup>
            </FormControl>
            </form>
        </StyledBoxShadow>
    )
}

export default LoginForm;
