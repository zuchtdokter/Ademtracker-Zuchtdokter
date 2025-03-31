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
  Tooltip
} from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';

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
    // TODO:
    // - Toevoegen van grafieken voor visualisatie van trends
    // - Implementeren van statistieken over tijd
    // - Toevoegen van herinneringen/notificaties
    // - Exporteren van data naar CSV/PDF
    // - Synchronisatie met cloud opslag
    // - Toevoegen van weekoverzicht
    // - Verbeteren van validatie logica
    // - Toevoegen van gebruikersprofielen
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  useEffect(() => {
    const savedData = localStorage.getItem("sleepBreathData");
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      // Alleen data van vandaag laden
      if (parsedData.date === formData.date) {
        setFormData(parsedData);
      }
    }
  }, []);

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

    localStorage.setItem("sleepBreathData", JSON.stringify(formData));
    setSnackbar({
      open: true,
      message: "Data succesvol opgeslagen!",
      severity: "success"
    });
  };

  const handleDelete = () => {
    if (window.confirm("Weet je zeker dat je deze registratie wilt verwijderen?")) {
      localStorage.removeItem("sleepBreathData");
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
    <Box sx={{ p: 4, maxWidth: 600, mx: "auto" }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Slaap- en Ademtracker
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          {format(new Date(formData.date), 'd MMMM yyyy', { locale: nl })}
        </Typography>
      </Box>
      
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