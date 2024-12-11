'use client'
import { Box, Button, Dialog, DialogContent, DialogTitle, IconButton, TextField, DialogActions} from "@mui/material";
import NavBar from "../_components/navbar";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { StyledBoxShadow } from "../dashboard/_components/styled-components";
import { useEffect, useState } from "react";
import { User, UserUpdateForm } from "./types";
import axios, { AxiosError, AxiosResponse } from "axios";
import { UserColumn, UserMainBox } from "./_components/styled-components";
import { useRouter } from "next/navigation";


const apiClient = axios.create({
    baseURL: 'http://localhost:3000/',
    withCredentials: true,
});

const Account = () => {
    const [userDetails, setUserDetails] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [editFormVisible, setEditFormVisible] = useState(false);
    const [infoError, setInfoError] = useState<string[]>([]);
    const [info, setInfo] = useState<string>();
    const [openDialog, setOpenDialog] = useState(false);
    const router = useRouter();
    const [formData, setFormData] = useState<UserUpdateForm>({
        name: "",
        surname: "",
        email: "",
        password: "",
        password2: "",
        weight: 0,
        height: 0,
        gender: "Male",
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const getActiveUser = async () => {
        await apiClient.get("user/get")
        .then((res: AxiosResponse) => {
            setUserDetails(res.data);
            setFormData({
                name: res.data.name || "",
                surname: res.data.surname || "",
                email: res.data.email || "",
                password: "", 
                password2: "",
                weight: res.data.weight || 0,
                height: res.data.height || 0,
                gender: res.data.gender || "Male",
            });
        })
        .catch((error: AxiosError) => {
          console.log(error);
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        setInfoError([])
        e.preventDefault();
        if (formData.password !== formData.password2) {
            setInfoError((prev) => [...new Set([...prev, "Passwords don't match"])]);
            return;
        }
        const { password2, ...data } = formData;
        if (data.password === "") {
            delete data.password;
        }
        if (data.height) data.height = parseFloat(data.height as unknown as string);
        if (data.weight) data.weight = parseFloat(data.weight as unknown as string);
        try {
            const response = await apiClient.patch("user/update", data);
            setUserDetails(response.data);
            setInfo("User details has been updated.")
            setEditFormVisible(false);
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message || "Unknown error occurred";
            setInfoError((prev) => [...new Set([...prev, ...errorMessage])]);
        }
    };
    
    const handleDelete = () => {
        setOpenDialog(true);
    };
  
    const handleDialogClose = () => {
        setOpenDialog(false);
    };
  
    const handleDeleteConfirm = async () => {
        try {
          await apiClient.delete(`user/delete`);
          router.push('/')
        } catch (error) {
            console.error('Error deleting training unit:', error);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            await getActiveUser();
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
            <StyledBoxShadow sx={{padding: "15px 0 15px 0",margin: "200px 0 200px 0"}}>
                <UserMainBox>
                    <UserColumn>
                        <h3>User Details</h3>
                        <Box>
                            <Dialog open={openDialog} onClose={handleDialogClose}>
                                <DialogTitle>Confirm Deletion</DialogTitle>
                                <DialogContent>
                                    <p>Are you sure you want to delete the your account?</p>
                                </DialogContent>
                                <DialogActions>
                                    <Button onClick={handleDialogClose} color="primary">
                                      Cancel
                                    </Button>
                                    <Button onClick={() => handleDeleteConfirm()} color="secondary">
                                      Delete
                                    </Button>
                                </DialogActions>
                            </Dialog>
                            <Box sx={{display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center"}}>
                                <AccountCircleIcon sx={{fontSize: "100px"}}/> 
                                <Box sx={{display: "flex"}}>
                                    <IconButton
                                        onClick={() => handleDelete()}
                                        aria-label="delete"
                                        title="Delete Account"
                                    >
                                      <DeleteIcon sx={{fontSize: "30px"}}/>
                                    </IconButton>
                                    <IconButton
                                        onClick={() => setEditFormVisible((prev) => !prev)}
                                        aria-label="edit"
                                        title="Edit User Details"
                                    >
                                        <EditIcon sx={{fontSize: "30px"}}/>
                                    </IconButton>
                                </Box>
                            </Box>
                            {userDetails ? (
                            <Box sx={{ textAlign: "center", marginTop: "20px" }}>
                              <p>
                                <strong>Name:</strong> {userDetails.name} {userDetails.surname}
                              </p>
                              <p>
                                <strong>Email:</strong> {userDetails.email}
                              </p>
                              <p>
                                <strong>Weight:</strong> {userDetails.weight} kg
                              </p>
                              <p>
                                <strong>Height:</strong> {userDetails.height} cm
                              </p>
                              <p>
                                <strong>Gender:</strong> {userDetails.gender}
                              </p>
                              {info ? (
                                <p style={{ fontSize: '12px', color: 'green'}}>{info}</p>
                              ) : (null)}
                            </Box>
                            ) : (
                              <p>Loading user details...</p>
                            )}
                        </Box>
                    </UserColumn>
                    {editFormVisible ? (
                        <UserColumn
                          sx={{
                            borderLeft: "4px solid lightgray",
                            padding: "0 15px 0 15px",
                            maxWidth: "400px",
                          }}
                        >
                          <h3>Edit User Details</h3>
                          <form onSubmit={handleSubmit}>
                            <TextField
                              label="Name"
                              name="name"
                              value={formData.name}
                              onChange={handleInputChange}
                              fullWidth
                              margin="normal"
                            />
                            <TextField
                              label="Surname"
                              name="surname"
                              value={formData.surname}
                              onChange={handleInputChange}
                              fullWidth
                              margin="normal"
                            />
                            <TextField
                              label="Email"
                              name="email"
                              value={formData.email}
                              onChange={handleInputChange}
                              fullWidth
                              margin="normal"
                            />
                            <TextField
                              label="Weight (kg)"
                              name="weight"
                              type="number"
                              value={formData.weight}
                              onChange={handleInputChange}
                              fullWidth
                              margin="normal"
                            />
                            <TextField
                              label="Height (cm)"
                              name="height"
                              type="number"
                              value={formData.height}
                              onChange={handleInputChange}
                              fullWidth
                              margin="normal"
                            />
                            <TextField
                              label="Gender"
                              name="gender"
                              value={formData.gender}
                              onChange={handleInputChange}
                              fullWidth
                              margin="normal"
                            />
                            <TextField
                              label="Password"
                              name="password"
                              type="password"
                              value={formData.password}
                              onChange={handleInputChange}
                              fullWidth
                              margin="normal"
                            />
                            <TextField
                              label="Confirm Password"
                              name="password2"
                              type="password"
                              value={formData.password2}
                              onChange={handleInputChange}
                              fullWidth
                              margin="normal"
                            />
                            <Box sx={{display: 'block', justifyContent: 'center'}}>
                                {infoError && infoError.length > 0 ? (
                                    infoError.map((item, index) => (
                                        <Box key={index} sx={{display: 'flex' , justifyContent: 'center'}}>
                                            <p style={{ fontSize: '12px', color: 'red'}}>{item}</p>
                                        </Box>
                                ))) : null}
                            </Box>
                            <Box sx={{display: "flex", alignItems: "center", justifyContent: "center"}}>
                                <Button
                                  type="submit"
                                  variant="contained"
                                  color="primary"
                                  sx={{ marginTop: "20px" }}
                                >
                                  Save Changes
                                </Button>
                            </Box>
                            
                          </form>
                            
                        </UserColumn>
                    ) : null}
                </UserMainBox>
            </StyledBoxShadow>
        </>
    )
}

export default Account;