'use client'

import { useEffect, useState } from "react";
import NavBar from "../_components/navbar";
import { StyledBoxShadow } from "../_components/styled-components";
import { ColumnRaport, RaportDetailsBox, RaportMainBox} from "./_components/styled-components";
import { Autocomplete, Box, Button, TextField, IconButton, Dialog, DialogContent, DialogActions, DialogTitle } from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import axios from "axios";
import { Raport, RaportFormData, TrainingPlan } from "./types";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale, 
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale, 
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const apiClient = axios.create({
    baseURL: 'http://localhost:3000/',
    withCredentials: true
});

const Raports = () => {
    const [yourRaports, setYourRaports] = useState<Raport[] | null>(null);
    const [selectedRaport, setSelectedRaport] = useState<Raport | null>(null);
    const [mainTrainingPlan, setMainTrainingPlan] = useState<TrainingPlan | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formMode, setFormMode] = useState<"add" | "edit" | null>(null);
    const [formData, setFormData] = useState<RaportFormData| null>(null);
    const [chartsVisible, setChartsVisible] = useState(false);
    const [chartData, setChartData] = useState<{
      circuitData: any;
      weightData: any;
    } | null>(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [info, setInfo] = useState<string[]>([]);

    const getRaportsAndPlan = async () => {
        try {
            const responsePlan = await apiClient.get('training-plan/getMainPlan');
            setMainTrainingPlan(responsePlan.data);
            const responseRaports = await apiClient.get(`raports/get?trainingPlanId=${responsePlan.data.id}`);
            setYourRaports(responseRaports.data);
        } catch (error) {
            console.log("Error fetching plan or raports:", error);
        }
    };

    const isItTheNewestRaport = (date: string): boolean => {
      const dateToCheck = new Date(date).getTime(); 
      return yourRaports?.every((raport) => {
        const dateToCompare = new Date(raport.dateCreated).getTime();
        return dateToCheck >= dateToCompare;
      }) ?? false; 
    }

    const handleCreateRaport = async () => {
        setInfo([]);
        if (!mainTrainingPlan?.id) {
          setInfo(["Main training plan is not defined"]);
          return;
        }
        const data = { ...formData, trainingPlanId: mainTrainingPlan.id };
        try {
          if (data.dateCreated && isItTheNewestRaport(data.dateCreated) && data.weight) {
            try {
              await apiClient.patch("user/update", { weight: data.weight });
            } catch (error) {
              console.error("Failed to update weight:", error);
            }
          }
          const response = await apiClient.post("raports/create", data);
          const createdRaport = response.data;
          getRaportsAndPlan();
          setSelectedRaport(createdRaport);
          setIsFormOpen(false);
        } catch (error: any) {
            console.error("Failed to create raport:", error);
            const errorMessage = error.response?.data?.message || error.message || "Unknown error occurred";
            const errorMessages = Array.isArray(errorMessage) ? errorMessage : errorMessage.split(/(?<=[a-z])(?=[A-Z])/);
            setInfo((prev) => [...prev, ...errorMessages]);
        }
    };

    const handleUpdateRaport = async () => {
      setInfo([]);
      if (selectedRaport?.id && mainTrainingPlan && formData) {
        const { id, ...data } = formData;
        try {
          if (data.dateCreated && isItTheNewestRaport(data.dateCreated) && data.weight) {
            try {
              await apiClient.patch("user/update", { weight: data.weight });
            } catch (error) {
              console.error("Failed to update weight:", error);
            }
          } else if (selectedRaport.dateCreated && isItTheNewestRaport(selectedRaport.dateCreated) && data.weight) {
            try {
              await apiClient.patch("user/update", { weight: data.weight });
            } catch (error) {
              console.error("Failed to update weight:", error);
            }
          }
          const response = await apiClient.patch(`raports/update/${selectedRaport.id}`, data);
          const updatedRaport = response.data;
          getRaportsAndPlan();
          setSelectedRaport(updatedRaport);
          setIsFormOpen(false);
        } catch (error: any) {
          console.error("Failed to update raport:", error);
          const errorMessage = error.response?.data?.message || error.message || "Unknown error occurred";
          const errorMessages = Array.isArray(errorMessage) ? errorMessage : errorMessage.split(/(?<=[a-z])(?=[A-Z])/);
          setInfo((prev) => [...prev, ...errorMessages]);
        }
      }
    };

    useEffect(() => {
        const fetchData = async () => {
            await getRaportsAndPlan();
            setIsLoading(false);
        }
        fetchData();
    }, [])

    if (isLoading) {
        return <div>Loading...</div>;  
    }

    const handleAddRaport = () => {
        setFormMode("add");
        setFormData(null); 
        setIsFormOpen(true);
        setInfo([])
    };
    
    const handleEditRaport = (raport: Raport) => {
        setFormMode("edit");
        setFormData(raport); 
        setIsFormOpen(true);
        setInfo([])
    };
    
    const handleCloseForm = () => {
        setIsFormOpen(false);
        setFormMode(null);
        setFormData(null);
        setInfo([])
    };

    const handleDeleteRaport = () => {
      setOpenDialog(true);
    };

    const handleDialogClose = () => {
      setOpenDialog(false);
    };

    const handleDeleteConfirm = async () => {
      try {
        await apiClient.delete(`raports/delete/${selectedRaport?.id}`);
        await getRaportsAndPlan();
        setSelectedRaport(null);
        setChartData(null);
        setOpenDialog(false);
      } catch (error) {
          console.error('Error deleting training unit:', error);
      }
    };

    const handleGenerateCharts = () => {
      if (yourRaports && Array.isArray(yourRaports) && yourRaports.length > 1) {
        const labels = yourRaports.map(raport => raport.dateCreated);
        const circuitData = {
          labels,
          datasets: [
              {
                  label: 'Chest Circuit',
                  data: yourRaports.map(raport => raport.chestCircuit),
                  borderColor: 'rgba(255, 99, 132, 1)',
                  backgroundColor: 'rgba(255, 99, 132, 0.2)',
              },
              {
                  label: 'Biceps Circuit',
                  data: yourRaports.map(raport => raport.bicepsCircuit),
                  borderColor: 'rgba(54, 162, 235, 1)',
                  backgroundColor: 'rgba(54, 162, 235, 0.2)',
              },
              {
                  label: 'Thigh Circuit',
                  data: yourRaports.map(raport => raport.thighCircuit),
                  borderColor: 'rgba(75, 192, 192, 1)',
                  backgroundColor: 'rgba(75, 192, 192, 0.2)',
              },
              {
                  label: 'Waist Circuit',
                  data: yourRaports.map(raport => raport.waistCircuit),
                  borderColor: 'rgba(153, 102, 255, 1)',
                  backgroundColor: 'rgba(153, 102, 255, 0.2)',
              },
              {
                  label: 'Calf Circuit',
                  data: yourRaports.map(raport => raport.calfCircuit),
                  borderColor: 'rgba(255, 159, 64, 1)',
                  backgroundColor: 'rgba(255, 159, 64, 0.2)',
              },
          ],
      }
        const weightData = {
          labels,
          datasets: [
              {
                  label: 'Weight',
                  data: yourRaports.map(raport => raport.weight),
                  borderColor: 'rgba(75, 192, 192, 1)',
                  backgroundColor: 'rgba(75, 192, 192, 0.2)',
              },
          ],
        };
        setChartData({ circuitData, weightData });
        setChartsVisible(true)
      };
  
      
  };

    return (
        <>
            <NavBar/>
            <StyledBoxShadow sx={{margin: "200px 0 70px 0"}}>
                <RaportMainBox>
                    <ColumnRaport>
                        <p>Your Raports</p>
                        <Box sx={{display: "flex", gap: "20px"}}>
                        <Autocomplete
                            sx={{minWidth: "270px"}}
                            options={yourRaports || []}
                            getOptionLabel={(option) => option.dateCreated} 
                            renderInput={(params) => (
                                <TextField {...params} label="Choose Raport" variant="outlined" />
                            )}
                            value={selectedRaport}
                            onChange={(event, newValue) => setSelectedRaport(newValue)}
                            isOptionEqualToValue={(option, value) => option.id === value?.id}
                        />
                        <Button variant="outlined" color="primary" onClick={handleAddRaport}>
                            Add Raport
                        </Button>
                        </Box>
                        <Dialog open={openDialog} onClose={handleDialogClose}>
                            <DialogTitle>Confirm Deletion</DialogTitle>
                            <DialogContent>
                                <p>Are you sure you want to delete the raport "{selectedRaport?.dateCreated}"?</p>
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={handleDialogClose} color="primary">
                                    Cancel
                                </Button>
                                <Button onClick={handleDeleteConfirm} color="secondary">
                                    Delete
                                </Button>
                            </DialogActions>
                        </Dialog>
                        {yourRaports && Array.isArray(yourRaports) && yourRaports.length > 1 ? (
                            chartsVisible ? (
                                <Box sx={{ marginTop: "15px", width: "100%" }}>
                                    <Button sx={{width: "100%" }} variant="outlined" onClick={() => setChartsVisible(false)}>
                                        Hide Charts
                                    </Button>
                                </Box>
                            ) : (
                                <Box sx={{ marginTop: "15px", width: "100%" }}>
                                    <Button sx={{width: "100%" }} variant="outlined" onClick={handleGenerateCharts}>
                                        See Charts
                                    </Button>
                                </Box>
                            )
                        ) : (
                            <p>You must add at least two reports in order to generate charts.</p>
                        )}
                        {selectedRaport ? (
                            <>
                            <RaportDetailsBox>
                                <Box sx={{display: "flex", gap: "20px"}}>
                                    <h3 style={{ margin: "15px 0 0 0" }}>Raport Details</h3>
                                    <IconButton
                                      onClick={() => handleDeleteRaport()}
                                      aria-label="delete"
                                      title="Delete Training Plan"
                                    >
                                      <DeleteIcon sx={{fontSize: "30px"}}/>
                                    </IconButton>
                                    <IconButton
                                      onClick={() => handleEditRaport(selectedRaport)}
                                      aria-label="edit"
                                      title="Edit Training Plan"
                                    >
                                        <EditIcon sx={{fontSize: "30px"}}/>
                                    </IconButton>
                                </Box>
                                <Box>
                                    <p><strong>Chest Circuit:</strong> {selectedRaport.chestCircuit} cm</p>
                                    <p><strong>Biceps Circuit:</strong> {selectedRaport.bicepsCircuit} cm</p>
                                    <p><strong>Thigh Circuit:</strong> {selectedRaport.thighCircuit} cm</p>
                                    <p><strong>Waist Circuit:</strong> {selectedRaport.waistCircuit} cm</p>
                                    <p><strong>Calf Circuit:</strong> {selectedRaport.calfCircuit} cm</p>
                                    <p><strong>Weight:</strong> {selectedRaport.weight} kg</p>
                                </Box>
                            </RaportDetailsBox>
                            
                            </>
                        ) : (null)}
                    </ColumnRaport>
                    {isFormOpen && (
                      <ColumnRaport
                        sx={{
                          borderLeft: "4px solid lightgray",
                          padding: "0 15px 0 15px",
                          maxWidth: "400px",
                        }}
                      >
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            if (formMode === "add") {
                                handleCreateRaport()
                            } else {
                                handleUpdateRaport()
                            }
                          }}
                        >
                          <TextField
                            type="date"
                            value={formData?.dateCreated || ""}
                            onChange={(e) =>
                              setFormData((prev) => ({ ...(prev || {}), dateCreated: e.target.value }))
                            }
                            fullWidth
                            margin="normal"
                          />
                          <TextField
                            label="Weight"
                            type="number"
                            value={formData?.weight || ""}
                            onChange={(e) =>
                              setFormData((prev) => ({ ...(prev || {}), weight: parseFloat(e.target.value) || 0 }))
                            }
                            fullWidth
                            margin="normal"
                          />
                          <TextField
                            label="Chest Circuit"
                            type="number"
                            value={formData?.chestCircuit || ""}
                            onChange={(e) =>
                              setFormData((prev) => ({ ...(prev || {}), chestCircuit: parseFloat(e.target.value) || 0 }))
                            }
                            fullWidth
                            margin="normal"
                          />
                          <TextField
                            label="Biceps Circuit"
                            type="number"
                            value={formData?.bicepsCircuit || ""}
                            onChange={(e) =>
                              setFormData((prev) => ({ ...(prev || {}), bicepsCircuit: parseFloat(e.target.value) || 0 }))
                            }
                            fullWidth
                            margin="normal"
                          />
                          <TextField
                            label="Thigh Circuit"
                            type="number"
                            value={formData?.thighCircuit || ""}
                            onChange={(e) =>
                              setFormData((prev) => ({ ...(prev || {}), thighCircuit: parseFloat(e.target.value) || 0 }))
                            }
                            fullWidth
                            margin="normal"
                          />
                          <TextField
                            label="Waist Circuit"
                            type="number"
                            value={formData?.waistCircuit || ""}
                            onChange={(e) =>
                              setFormData((prev) => ({ ...(prev || {}), waistCircuit: parseFloat(e.target.value) || 0 }))
                            }
                            fullWidth
                            margin="normal"
                          />
                          <TextField
                            label="Calf Circuit"
                            type="number"
                            value={formData?.calfCircuit || ""}
                            onChange={(e) =>
                              setFormData((prev) => ({ ...(prev || {}), calfCircuit: parseFloat(e.target.value) || 0 }))
                            }
                            fullWidth
                            margin="normal"
                          />
                          <Box sx={{ display: "flex", justifyContent: "space-between", marginTop: "15px" }}>
                            <Button
                              type="submit"
                              variant="contained"
                              color={formMode === "add" ? "primary" : "secondary"}
                            >
                              {formMode === "add" ? "Add" : "Edit"}
                            </Button>
                            <Button variant="outlined" onClick={handleCloseForm}>
                              {formMode === "add" ? "Close Creator" : "Close Editor"}
                            </Button>
                          </Box>
                        </form>
                        <Box sx={{display: 'block', justifyContent: 'center', marginTop: "10px"}}>
                            {info && info.length > 0 ? (
                                info.map((item, index) => (
                                    <Box key={index} sx={{display: 'flex' , justifyContent: 'center'}}>
                                        <p style={{ fontSize: '12px', color: 'red', margin: '0 0 5px 0'}}>{item}</p>
                                    </Box>
                            ))) : null}
                        </Box>
                      </ColumnRaport>
                    )}
                </RaportMainBox>
            </StyledBoxShadow>
            {chartData && chartsVisible ? (
                <StyledBoxShadow sx={{width: "60%", marginBottom: "100px"}}>
                    <Box>
                      <h3>Circuits Over Time</h3>
                      <Line data={chartData.circuitData} />
                    </Box>
                    <Box sx={{marginTop: "100px"}}>
                      <h3>Weight Over Time</h3>
                      <Line data={chartData.weightData} />
                    </Box>
                </StyledBoxShadow>
            ) : (null)}
        </>
    )
}

export default Raports; 