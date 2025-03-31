import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import { Line } from 'react-chartjs-2';
import { auth, sleepData } from '../services/api';

const TherapistDashboard = () => {
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientData, setClientData] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [newClient, setNewClient] = useState({
    email: '',
    password: '',
    name: ''
  });

  useEffect(() => {
    loadClients();
  }, []);

  useEffect(() => {
    if (selectedClient) {
      loadClientData();
    }
  }, [selectedClient]);

  const loadClients = async () => {
    try {
      const profile = await auth.getProfile();
      // Hier zou je normaal gesproken een API call maken om alle clients van de therapeut op te halen
      // Voor nu gebruiken we dummy data
      setClients([
        { id: 1, name: 'Jan Jansen', email: 'jan@example.com' },
        { id: 2, name: 'Piet Pietersen', email: 'piet@example.com' }
      ]);
    } catch (error) {
      console.error('Error loading clients:', error);
    }
  };

  const loadClientData = async () => {
    try {
      const data = await sleepData.getUserData(selectedClient.id);
      setClientData(data);
    } catch (error) {
      console.error('Error loading client data:', error);
    }
  };

  const handleAddClient = async () => {
    try {
      // Hier zou je normaal gesproken een API call maken om een nieuwe client toe te voegen
      setOpenDialog(false);
      setNewClient({ email: '', password: '', name: '' });
      loadClients();
    } catch (error) {
      console.error('Error adding client:', error);
    }
  };

  const chartData = {
    labels: clientData.map(d => new Date(d.date).toLocaleDateString('nl-NL')),
    datasets: [
      {
        label: 'Slaapduur (uren)',
        data: clientData.map(d => d.sleepDuration),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      },
      {
        label: 'Aantal keer wakker',
        data: clientData.map(d => d.wakeCount),
        borderColor: 'rgb(255, 99, 132)',
        tension: 0.1
      }
    ]
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4">Therapeut Dashboard</Typography>
        <Button variant="contained" color="primary" onClick={() => setOpenDialog(true)}>
          Nieuwe Client Toevoegen
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Clienten
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Naam</TableCell>
                      <TableCell>Email</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {clients.map((client) => (
                      <TableRow
                        key={client.id}
                        hover
                        selected={selectedClient?.id === client.id}
                        onClick={() => setSelectedClient(client)}
                        sx={{ cursor: 'pointer' }}
                      >
                        <TableCell>{client.name}</TableCell>
                        <TableCell>{client.email}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          {selectedClient ? (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Data van {selectedClient.name}
                </Typography>
                <Box height={300} mb={3}>
                  <Line data={chartData} options={{ maintainAspectRatio: false }} />
                </Box>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Datum</TableCell>
                        <TableCell>Slaapduur</TableCell>
                        <TableCell>Wakker</TableCell>
                        <TableCell>Stress</TableCell>
                        <TableCell>Zonlicht</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {clientData.map((data) => (
                        <TableRow key={data._id}>
                          <TableCell>{new Date(data.date).toLocaleDateString('nl-NL')}</TableCell>
                          <TableCell>{data.sleepDuration} uur</TableCell>
                          <TableCell>{data.wakeCount}</TableCell>
                          <TableCell>{data.stressLevel}</TableCell>
                          <TableCell>{data.sunlightExposure}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent>
                <Typography variant="h6" align="center">
                  Selecteer een client om hun data te bekijken
                </Typography>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Nieuwe Client Toevoegen</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Naam"
            fullWidth
            value={newClient.name}
            onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Email"
            type="email"
            fullWidth
            value={newClient.email}
            onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Wachtwoord"
            type="password"
            fullWidth
            value={newClient.password}
            onChange={(e) => setNewClient({ ...newClient, password: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Annuleren</Button>
          <Button onClick={handleAddClient} color="primary">
            Toevoegen
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default TherapistDashboard; 