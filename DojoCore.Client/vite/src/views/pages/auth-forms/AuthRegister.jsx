import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as Yup from 'yup';

// material-ui
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import FormLabel from '@mui/material/FormLabel';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import OutlinedInput from '@mui/material/OutlinedInput';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Select from '@mui/material/Select';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Stepper from '@mui/material/Stepper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project imports
import AnimateButton from 'ui-component/extended/AnimateButton';
import CustomFormControl from 'ui-component/extended/Form/CustomFormControl';
import { strengthColor, strengthIndicator } from 'utils/password-strength';
import { useAuth } from 'contexts/AuthContext';
import { DASHBOARD_PATH } from 'config';

// assets
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

// â”€â”€â”€ Validation Schemas â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const step0Schema = Yup.object({
  username: Yup.string().min(3, 'Min 3 characters').max(60).required('Username is required'),
  email: Yup.string().email('Must be a valid email').required('Email is required'),
  password: Yup.string().min(8, 'Password must be at least 8 characters').required('Password is required'),
  role: Yup.number().oneOf([2, 3], 'Select a role').required('Role is required'),
  gender: Yup.number().oneOf([0, 1], 'Select a gender').required('Gender is required'),
  dateOfBirth: Yup.string().required('Date of birth is required'),
  address: Yup.string().max(100)
});

const step1Schema = Yup.object({
  gymAction: Yup.string().oneOf(['none', 'join', 'create']).required('Select a gym option'),
  gymCode: Yup.string().when('gymAction', {
    is: 'join',
    then: (s) => s.required('Gym code is required'),
    otherwise: (s) => s.nullable()
  }),
  gymName: Yup.string().when('gymAction', {
    is: 'create',
    then: (s) => s.max(255).required('Gym name is required'),
    otherwise: (s) => s.nullable()
  }),
  gymAddress: Yup.string().when('gymAction', {
    is: 'create',
    then: (s) => s.max(20, 'Max 20 characters').required('Gym address is required'),
    otherwise: (s) => s.nullable()
  })
});

const STEPS = ['Account Details', 'Gym Setup'];

// â”€â”€â”€ Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export default function AuthRegister() {
  const { register, isLoading } = useAuth();
  const navigate = useNavigate();

  // Step 0 state
  const [step, setStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [strength, setStrength] = useState(0);
  const [level, setLevel] = useState();

  const [account, setAccount] = useState({
    username: '',
    email: '',
    password: '',
    role: '',
    gender: '',
    dateOfBirth: '',
    address: ''
  });

  // Step 1 state
  const [gymSetup, setGymSetup] = useState({
    gymAction: 'none',
    gymCode: '',
    gymName: '',
    gymAddress: ''
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');

  useEffect(() => {
    setStrength(strengthIndicator(''));
    setLevel(strengthColor(strengthIndicator('')));
  }, []);

  // â”€â”€ Handlers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  const handleAccountChange = (e) => {
    const { name, value } = e.target;
    setAccount((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
    if (name === 'password') {
      const s = strengthIndicator(value);
      setStrength(s);
      setLevel(strengthColor(s));
    }
  };

  const handleGymChange = (e) => {
    const { name, value } = e.target;
    setGymSetup((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleNext = async () => {
    setServerError('');
    try {
      await step0Schema.validate(account, { abortEarly: false });
      setErrors({});
      setStep(1);
    } catch (err) {
      const fieldErrors = {};
      err.inner.forEach((e) => { fieldErrors[e.path] = e.message; });
      setErrors(fieldErrors);
    }
  };

  const handleBack = () => {
    setStep(0);
    setErrors({});
    setServerError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    try {
      await step1Schema.validate(gymSetup, { abortEarly: false });
    } catch (err) {
      const fieldErrors = {};
      err.inner.forEach((e) => { fieldErrors[e.path] = e.message; });
      setErrors(fieldErrors);
      return;
    }

    const payload = {
      user: {
        username: account.username,
        email: account.email,
        password: account.password,
        role: Number(account.role),
        address: account.address || null,
        gender: Number(account.gender),
        dateOfBirth: account.dateOfBirth
      },
      gymAction: gymSetup.gymAction,
      gymCode: gymSetup.gymAction === 'join' ? gymSetup.gymCode : null,
      newGym:
        gymSetup.gymAction === 'create'
          ? { name: gymSetup.gymName, address: gymSetup.gymAddress }
          : null
    };

    try {
      await register(payload);
      navigate(DASHBOARD_PATH);
    } catch (err) {
      setServerError(err.message || 'Registration failed. Please try again.');
    }
  };

  // â”€â”€ Render â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  return (
    <Box component="form" onSubmit={step === 0 ? (e) => { e.preventDefault(); handleNext(); } : handleSubmit} noValidate>
      <Stepper activeStep={step} sx={{ mb: 3 }}>
        {STEPS.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {serverError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {serverError}
        </Alert>
      )}

      {/* â”€â”€ Step 0: Account Details â”€â”€ */}
      {step === 0 && (
        <>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomFormControl fullWidth error={!!errors.username}>
                <InputLabel htmlFor="reg-username">Username</InputLabel>
                <OutlinedInput id="reg-username" name="username" value={account.username} onChange={handleAccountChange} label="Username" />
                {errors.username && <FormHelperText>{errors.username}</FormHelperText>}
              </CustomFormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomFormControl fullWidth error={!!errors.email}>
                <InputLabel htmlFor="reg-email">Email Address</InputLabel>
                <OutlinedInput id="reg-email" type="email" name="email" value={account.email} onChange={handleAccountChange} label="Email Address" />
                {errors.email && <FormHelperText>{errors.email}</FormHelperText>}
              </CustomFormControl>
            </Grid>
          </Grid>

          <CustomFormControl fullWidth error={!!errors.password}>
            <InputLabel htmlFor="reg-password">Password</InputLabel>
            <OutlinedInput
              id="reg-password"
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={account.password}
              onChange={handleAccountChange}
              label="Password"
              endAdornment={
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword((s) => !s)} onMouseDown={(e) => e.preventDefault()} edge="end" size="large">
                    {showPassword ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                </InputAdornment>
              }
            />
            {errors.password && <FormHelperText>{errors.password}</FormHelperText>}
          </CustomFormControl>

          {strength !== 0 && (
            <Box sx={{ mb: 1 }}>
              <Stack direction="row" sx={{ gap: 2, alignItems: 'center' }}>
                <Box sx={{ width: 85, height: 8, borderRadius: '7px', bgcolor: level?.color }} />
                <Typography variant="subtitle1" sx={{ fontSize: '0.75rem' }}>{level?.label}</Typography>
              </Stack>
            </Box>
          )}

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth error={!!errors.role}>
                <InputLabel id="reg-role-label">Role</InputLabel>
                <Select labelId="reg-role-label" name="role" value={account.role} onChange={handleAccountChange} label="Role">
                  <MenuItem value={3}>Athlete</MenuItem>
                  <MenuItem value={2}>Manager</MenuItem>
                </Select>
                {errors.role && <FormHelperText>{errors.role}</FormHelperText>}
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth error={!!errors.gender}>
                <InputLabel id="reg-gender-label">Gender</InputLabel>
                <Select labelId="reg-gender-label" name="gender" value={account.gender} onChange={handleAccountChange} label="Gender">
                  <MenuItem value={1}>Male</MenuItem>
                  <MenuItem value={0}>Female</MenuItem>
                </Select>
                {errors.gender && <FormHelperText>{errors.gender}</FormHelperText>}
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomFormControl fullWidth error={!!errors.dateOfBirth}>
                <InputLabel htmlFor="reg-dob" shrink>Date of Birth</InputLabel>
                <OutlinedInput id="reg-dob" type="date" name="dateOfBirth" value={account.dateOfBirth} onChange={handleAccountChange} label="Date of Birth" notched />
                {errors.dateOfBirth && <FormHelperText>{errors.dateOfBirth}</FormHelperText>}
              </CustomFormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomFormControl fullWidth error={!!errors.address}>
                <InputLabel htmlFor="reg-address">Address (optional)</InputLabel>
                <OutlinedInput id="reg-address" name="address" value={account.address} onChange={handleAccountChange} label="Address (optional)" />
                {errors.address && <FormHelperText>{errors.address}</FormHelperText>}
              </CustomFormControl>
            </Grid>
          </Grid>
        </>
      )}

      {/* â”€â”€ Step 1: Gym Setup â”€â”€ */}
      {step === 1 && (
        <>
          <FormControl component="fieldset" error={!!errors.gymAction} sx={{ mb: 2 }}>
            <FormLabel component="legend">Gym Option</FormLabel>
            <RadioGroup name="gymAction" value={gymSetup.gymAction} onChange={handleGymChange} row>
              <FormControlLabel value="none" control={<Radio />} label="No gym" />
              <FormControlLabel value="join" control={<Radio />} label="Join existing gym" />
              <FormControlLabel value="create" control={<Radio />} label="Create new gym" />
            </RadioGroup>
            {errors.gymAction && <FormHelperText>{errors.gymAction}</FormHelperText>}
          </FormControl>

          {gymSetup.gymAction === 'join' && (
            <CustomFormControl fullWidth error={!!errors.gymCode}>
              <InputLabel htmlFor="reg-gymcode">Gym Code</InputLabel>
              <OutlinedInput id="reg-gymcode" name="gymCode" value={gymSetup.gymCode} onChange={handleGymChange} label="Gym Code" placeholder="e.g. GYM-X7B9Q" />
              {errors.gymCode && <FormHelperText>{errors.gymCode}</FormHelperText>}
            </CustomFormControl>
          )}

          {gymSetup.gymAction === 'create' && (
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <CustomFormControl fullWidth error={!!errors.gymName}>
                  <InputLabel htmlFor="reg-gymname">Gym Name</InputLabel>
                  <OutlinedInput id="reg-gymname" name="gymName" value={gymSetup.gymName} onChange={handleGymChange} label="Gym Name" />
                  {errors.gymName && <FormHelperText>{errors.gymName}</FormHelperText>}
                </CustomFormControl>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <CustomFormControl fullWidth error={!!errors.gymAddress}>
                  <InputLabel htmlFor="reg-gymaddress">Gym Address</InputLabel>
                  <OutlinedInput id="reg-gymaddress" name="gymAddress" value={gymSetup.gymAddress} onChange={handleGymChange} label="Gym Address" />
                  {errors.gymAddress && <FormHelperText>{errors.gymAddress}</FormHelperText>}
                </CustomFormControl>
              </Grid>
            </Grid>
          )}
        </>
      )}

      {/* â”€â”€ Navigation Buttons â”€â”€ */}
      <Stack direction="row" sx={{ justifyContent: step === 0 ? 'flex-end' : 'space-between', mt: 3 }}>
        {step === 1 && (
          <Button onClick={handleBack} disabled={isLoading} variant="outlined" color="secondary">
            Back
          </Button>
        )}
        <AnimateButton>
          <Button disableElevation size="large" type="submit" variant="contained" color="secondary" disabled={isLoading}>
            {isLoading ? <CircularProgress size={24} color="inherit" /> : step === 0 ? 'Next' : 'Sign up'}
          </Button>
        </AnimateButton>
      </Stack>
    </Box>
  );
}

