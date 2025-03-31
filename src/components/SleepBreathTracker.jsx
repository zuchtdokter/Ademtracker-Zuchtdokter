import React, { useState, useEffect } from "react";
import { 
  Slider, 
  TextField, 
  Button, 
  Box, 
  Typography, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  Snackbar,
  Alert,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Paper,
  Grid,
  Tabs,
  Tab,
  ButtonGroup
} from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import DownloadIcon from '@mui/icons-material/Download';
import { format, subDays, isSameDay, parseISO } from 'date-fns';
import { nl } from 'date-fns/locale';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend
} from 'chart.js';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  ChartTooltip,
  Legend
);

export default function SleepBreathTracker() {
  const [formData, setFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    stressLevel: "",
    sunlightExposure: "",
    screenTime: "",
    foodTime: "",
    alcoholTime: "",
    activityTime: "",
    eveningWalk: "",
    sleepDuration: 7,
    wakeCount: 0,
    awakeDuration: 0,
    inputExercises: "",
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  const [viewDataDialog, setViewDataDialog] = useState(false);
  const [savedData, setSavedData] = useState(null);
  const [allData, setAllData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [tabValue, setTabValue] = useState(0);
  const [chartType, setChartType] = useState('line');
  const [timeRange, setTimeRange] = useState(7);

  useEffect(() => {
    loadAllData();
  }, []);

  useEffect(() => {
    const existingData = allData.find(d => isSameDay(parseISO(d.date), selectedDate));
    if (existingData) {
      setFormData(existingData);
    } else {
      setFormData({
        ...formData,
        date: format(selectedDate, 'yyyy-MM-dd'),
      });
    }
  }, [selectedDate]);

  const loadAllData = () => {
    const data = localStorage.getItem("sleepBreathData");
    if (data) {
      setAllData(JSON.parse(data));
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.stressLevel || formData.stressLevel === "---") {
      setSnackbar({
        open: true,
        message: "Vul een stressniveau in",
        severity: "error"
      });
      return false;
    }
    if (!formData.sunlightExposure || formData.sunlightExposure === "---") {
      setSnackbar({
        open: true,
        message: "Vul de blootstelling aan zonlicht in",
        severity: "error"
      });
      return false;
    }
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const newData = [...allData];
    const existingIndex = newData.findIndex(d => isSameDay(parseISO(d.date), selectedDate));
    
    if (existingIndex >= 0) {
      newData[existingIndex] = formData;
    } else {
      newData.push(formData);
    }

    localStorage.setItem("sleepBreathData", JSON.stringify(newData));
    setAllData(newData);
    setSnackbar({
      open: true,
      message: "Data succesvol opgeslagen!",
      severity: "success"
    });
  };

  const handleDelete = () => {
    if (window.confirm("Weet je zeker dat je deze registratie wilt verwijderen?")) {
      const newData = allData.filter(d => !isSameDay(parseISO(d.date), selectedDate));
      localStorage.setItem("sleepBreathData", JSON.stringify(newData));
      setAllData(newData);
      setFormData({
        ...formData,
        stressLevel: "",
        sunlightExposure: "",
        screenTime: "",
        foodTime: "",
        alcoholTime: "",
        activityTime: "",
        eveningWalk: "",
        sleepDuration: 7,
        wakeCount: 0,
        awakeDuration: 0,
        inputExercises: "",
      });
      setSnackbar({
        open: true,
        message: "Registratie verwijderd",
        severity: "info"
      });
    }
  };

  const handleViewData = () => {
    const data = allData.find(d => isSameDay(parseISO(d.date), selectedDate));
    if (data) {
      setSavedData(data);
      setViewDataDialog(true);
    } else {
      setSnackbar({
        open: true,
        message: "Geen opgeslagen data gevonden",
        severity: "info"
      });
    }
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleExport = () => {
    const ws = XLSX.utils.json_to_sheet(allData.map(entry => ({
      Datum: format(new Date(entry.date), 'd MMMM yyyy', { locale: nl }),
      'Stressniveau': entry.stressLevel,
      'Blootstelling aan zonlicht': entry.sunlightExposure,
      'Schermtijd voor slapen': entry.screenTime,
      'Eten voor slapen': entry.foodTime,
      'Alcohol voor slapen': entry.alcoholTime,
      'Fysieke inspanning voor slapen': entry.activityTime,
      'Wandeling voor slapen': entry.eveningWalk,
      'Slaapduur (uren)': entry.sleepDuration,
      'Aantal keer wakker': entry.wakeCount,
      'Wakker liggen (minuten)': entry.awakeDuration,
      'Oefeningen': entry.inputExercises
    })));
    
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Slaapgegevens");
    
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(data, `slaapgegevens_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
  };

  const getChartData = () => {
    const days = Array.from({ length: timeRange }, (_, i) => subDays(new Date(), i)).reverse();
    
    return {
      labels: days.map(date => format(date, 'd MMM', { locale: nl })),
      datasets: [
        {
          label: 'Slaapduur (uren)',
          data: days.map(date => {
            const dayData = allData.find(d => isSameDay(parseISO(d.date), date));
            return dayData ? dayData.sleepDuration : null;
          }),
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1
        },
        {
          label: 'Wakker worden (keer)',
          data: days.map(date => {
            const dayData = allData.find(d => isSameDay(parseISO(d.date), date));
            return dayData ? dayData.wakeCount : null;
          }),
          borderColor: 'rgb(255, 99, 132)',
          tension: 0.1
        }
      ]
    };
  };

  const getStressChartData = () => {
    const days = Array.from({ length: timeRange }, (_, i) => subDays(new Date(), i)).reverse();
    
    return {
      labels: days.map(date => format(date, 'd MMM', { locale: nl })),
      datasets: [
        {
          label: 'Stressniveau',
          data: days.map(date => {
            const dayData = allData.find(d => isSameDay(parseISO(d.date), date));
            return dayData ? dayData.stressLevel : null;
          }),
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
        }
      ]
    };
  };

  const getSunlightChartData = () => {
    const days = Array.from({ length: timeRange }, (_, i) => subDays(new Date(), i)).reverse();
    
    return {
      labels: days.map(date => format(date, 'd MMM', { locale: nl })),
      datasets: [
        {
          label: 'Blootstelling aan zonlicht',
          data: days.map(date => {
            const dayData = allData.find(d => isSameDay(parseISO(d.date), date));
            return dayData ? dayData.sunlightExposure : null;
          }),
          backgroundColor: 'rgba(255, 206, 86, 0.5)',
        }
      ]
    };
  };

  const getChartOptions = () => ({
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Slaapgegevens'
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  });

  const timeOptions = [
    { value: "---", label: "---" },
    { value: "1 uur", label: "1 uur" },
    { value: "2 uur", label: "2 uur" },
    { value: "3 uur", label: "3 uur" },
  ];

  const levelOptions = [
    { value: "---", label: "---" },
    { value: "Laag", label: "Laag" },
    { value: "Middel", label: "Middel" },
    { value: "Hoog", label: "Hoog" },
  ];

  const getSliderColor = (value, field) => {
    switch (field) {
      case 'sleepDuration':
        return value < 6 ? 'error' : value < 8 ? 'warning' : 'success';
      case 'wakeCount':
        return value > 3 ? 'error' : value > 1 ? 'warning' : 'success';
      case 'awakeDuration':
        return value > 30 ? 'error' : value > 15 ? 'warning' : 'success';
      default:
        return 'primary';
    }
  };

  return (
    <Box sx={{ p: 4, maxWidth: 800, mx: "auto" }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Slaap- en Ademtracker
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          {format(selectedDate, 'd MMMM yyyy', { locale: nl })}
        </Typography>
      </Box>

      <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="Registreren" />
        <Tab label="Grafieken" />
        <Tab label="Kalender" />
      </Tabs>

      {tabValue === 0 && (
        <form onSubmit={handleSubmit}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <FormControl fullWidth required>
              <InputLabel>Stressniveau vandaag</InputLabel>
              <Select
                value={formData.stressLevel}
                label="Stressniveau vandaag"
                onChange={(e) => handleChange("stressLevel", e.target.value)}
              >
                {levelOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth required>
              <InputLabel>Blootstelling aan zonlicht</InputLabel>
              <Select
                value={formData.sunlightExposure}
                label="Blootstelling aan zonlicht"
                onChange={(e) => handleChange("sunlightExposure", e.target.value)}
              >
                {levelOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {[
              ["screenTime", "Geen schermtijd"],
              ["foodTime", "Geen eten"],
              ["alcoholTime", "Geen alcohol"],
              ["activityTime", "Geen fysieke inspanning"],
            ].map(([key, label]) => (
              <FormControl key={key} fullWidth>
                <InputLabel>{label} voor het slapen</InputLabel>
                <Select
                  value={formData[key]}
                  label={label}
                  onChange={(e) => handleChange(key, e.target.value)}
                >
                  {timeOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ))}

            <FormControl fullWidth>
              <InputLabel>Wandeling gemaakt voor het slapen?</InputLabel>
              <Select
                value={formData.eveningWalk}
                label="Wandeling gemaakt voor het slapen?"
                onChange={(e) => handleChange("eveningWalk", e.target.value)}
              >
                <MenuItem value="---">---</MenuItem>
                <MenuItem value="Ja">Ja</MenuItem>
                <MenuItem value="Nee">Nee</MenuItem>
              </Select>
            </FormControl>

            <Box>
              <Typography gutterBottom>
                Hoe lang heb je geslapen? ({formData.sleepDuration} uur)
              </Typography>
              <Slider
                min={3}
                max={12}
                value={formData.sleepDuration}
                onChange={(_, value) => handleChange("sleepDuration", value)}
                step={0.5}
                valueLabelDisplay="auto"
                color={getSliderColor(formData.sleepDuration, 'sleepDuration')}
              />
            </Box>

            <Box>
              <Typography gutterBottom>
                Hoe vaak werd je wakker? ({formData.wakeCount}x)
              </Typography>
              <Slider
                min={0}
                max={10}
                value={formData.wakeCount}
                onChange={(_, value) => handleChange("wakeCount", value)}
                step={1}
                valueLabelDisplay="auto"
                color={getSliderColor(formData.wakeCount, 'wakeCount')}
              />
            </Box>

            <Box>
              <Typography gutterBottom>
                Hoe lang lag je wakker? ({formData.awakeDuration} min)
              </Typography>
              <Slider
                min={0}
                max={60}
                value={formData.awakeDuration}
                onChange={(_, value) => handleChange("awakeDuration", value)}
                step={5}
                valueLabelDisplay="auto"
                color={getSliderColor(formData.awakeDuration, 'awakeDuration')}
              />
            </Box>

            <TextField
              fullWidth
              multiline
              rows={4}
              label="Input oefeningen (ademwerk, meditatie, etc)"
              value={formData.inputExercises}
              onChange={(e) => handleChange("inputExercises", e.target.value)}
            />

            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                sx={{ flex: 1 }}
              >
                Opslaan
              </Button>
              <Tooltip title="Bekijk opgeslagen data">
                <IconButton 
                  color="primary" 
                  onClick={handleViewData}
                  sx={{ border: 1, borderColor: 'primary.main' }}
                >
                  <VisibilityIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Verwijder registratie">
                <IconButton 
                  color="error" 
                  onClick={handleDelete}
                  sx={{ border: 1, borderColor: 'error.main' }}
                >
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </form>
      )}

      {tabValue === 1 && (
        <Box sx={{ mt: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">
              Slaapgegevens van de laatste {timeRange} dagen
            </Typography>
            <ButtonGroup variant="outlined" size="small">
              <Button onClick={() => setTimeRange(7)}>7 dagen</Button>
              <Button onClick={() => setTimeRange(14)}>14 dagen</Button>
              <Button onClick={() => setTimeRange(30)}>30 dagen</Button>
            </ButtonGroup>
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Box sx={{ mb: 2 }}>
                  <ButtonGroup variant="outlined" size="small">
                    <Button onClick={() => setChartType('line')}>Lijn</Button>
                    <Button onClick={() => setChartType('bar')}>Staaf</Button>
                  </ButtonGroup>
                </Box>
                {chartType === 'line' ? (
                  <Line data={getChartData()} options={getChartOptions()} />
                ) : (
                  <Bar data={getChartData()} options={getChartOptions()} />
                )}
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>Stressniveau</Typography>
                <Bar data={getStressChartData()} options={getChartOptions()} />
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>Blootstelling aan zonlicht</Typography>
                <Bar data={getSunlightChartData()} options={getChartOptions()} />
              </Paper>
            </Grid>
          </Grid>

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={handleExport}
            >
              Exporteer Data
            </Button>
          </Box>
        </Box>
      )}

      {tabValue === 2 && (
        <Grid container spacing={2}>
          {Array.from({ length: 7 }, (_, i) => subDays(new Date(), i)).reverse().map((date) => {
            const dayData = allData.find(d => isSameDay(parseISO(d.date), date));
            return (
              <Grid item xs={12} sm={6} md={4} key={date.toISOString()}>
                <Paper 
                  sx={{ 
                    p: 2, 
                    cursor: 'pointer',
                    bgcolor: isSameDay(date, selectedDate) ? 'primary.light' : 'background.paper',
                    color: isSameDay(date, selectedDate) ? 'primary.contrastText' : 'text.primary',
                  }}
                  onClick={() => handleDateChange(date)}
                >
                  <Typography variant="h6">
                    {format(date, 'd MMMM', { locale: nl })}
                  </Typography>
                  {dayData ? (
                    <>
                      <Typography>Slaapduur: {dayData.sleepDuration} uur</Typography>
                      <Typography>Wakker worden: {dayData.wakeCount}x</Typography>
                      <Typography>Wakker liggen: {dayData.awakeDuration} min</Typography>
                    </>
                  ) : (
                    <Typography>Geen data</Typography>
                  )}
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      )}

      <Dialog 
        open={viewDataDialog} 
        onClose={() => setViewDataDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Opgeslagen Data</DialogTitle>
        <DialogContent>
          {savedData && (
            <List>
              <ListItem>
                <ListItemText 
                  primary="Datum" 
                  secondary={format(new Date(savedData.date), 'd MMMM yyyy', { locale: nl })}
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Stressniveau" 
                  secondary={savedData.stressLevel}
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Blootstelling aan zonlicht" 
                  secondary={savedData.sunlightExposure}
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Schermtijd voor slapen" 
                  secondary={savedData.screenTime}
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Eten voor slapen" 
                  secondary={savedData.foodTime}
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Alcohol voor slapen" 
                  secondary={savedData.alcoholTime}
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Fysieke inspanning voor slapen" 
                  secondary={savedData.activityTime}
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Wandeling voor slapen" 
                  secondary={savedData.eveningWalk}
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Slaapduur" 
                  secondary={`${savedData.sleepDuration} uur`}
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Aantal keer wakker" 
                  secondary={`${savedData.wakeCount}x`}
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Wakker liggen" 
                  secondary={`${savedData.awakeDuration} minuten`}
                />
              </ListItem>
              {savedData.inputExercises && (
                <ListItem>
                  <ListItemText 
                    primary="Oefeningen" 
                    secondary={savedData.inputExercises}
                  />
                </ListItem>
              )}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDataDialog(false)}>Sluiten</Button>
        </DialogActions>
      </Dialog>

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
} 