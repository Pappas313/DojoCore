import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as Yup from 'yup';

// material-ui
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
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
import Paper from '@mui/material/Paper';
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

// icons
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';

// ---------------------------------------------------------------------------
// Validation schemas
// ---------------------------------------------------------------------------
const accountSchema = Yup.object({
  username: Yup.string().min(3, 'Min 3 characters').max(60).required('Username is required'),
  email: Yup.string().email('Must be a valid email').required('Email is required'),
  password: Yup.string().min(8, 'Password must be at least 8 characters').required('Password is required'),
  role: Yup.number().oneOf([2, 3], 'Select a role').required('Role is required'),
  gender: Yup.number().oneOf([0, 1], 'Select a gender').required('Gender is required'),
  dateOfBirth: Yup.string().required('Date of birth is required'),
  address: Yup.string().max(100).nullable()
});

const athleteSchema = Yup.object({
  athleteAction: Yup.string().oneOf(['freelance', 'gym_member'], 'Select an option').required('Select an option')
});

const gymSchema = Yup.object({
  gymAction: Yup.string().oneOf(['create', 'join'], 'Select a gym option').required('Select a gym option'),
  gymName: Yup.string().when('gymAction', {
    is: 'create',
    then: (s) => s.max(255).required('Gym name is required'),
    otherwise: (s) => s.nullable()
  }),
  gymCode: Yup.string().when('gymAction', {
    is: (val) => val === 'create' || val === 'join',
    then: (s) => s.max(20, 'Max 20 characters').required('Gym code is required'),
    otherwise: (s) => s.nullable()
  }),
  gymAddress: Yup.string().max(100).nullable()
});

// ---------------------------------------------------------------------------
// FileUploadZone
// ---------------------------------------------------------------------------
function FileUploadZone({ files, onFilesChange, label, description }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const addFiles = (newFiles) => {
    const merged = [...files];
    Array.from(newFiles).forEach((f) => {
      if (!merged.find((x) => x.name === f.name && x.size === f.size)) merged.push(f);
    });
    onFilesChange(merged);
  };

  const removeFile = (index) => onFilesChange(files.filter((_, i) => i !== index));

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  };

  return (
    <Box>
      <Typography variant="subtitle1" sx={{ mb: 0.5 }}>{label}</Typography>
      {description && (
        <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
          {description}
        </Typography>
      )}
      <Paper
        variant="outlined"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        sx={{
          p: 3, textAlign: 'center', cursor: 'pointer', borderStyle: 'dashed',
          borderColor: dragging ? 'primary.main' : 'divider',
          bgcolor: dragging ? 'action.hover' : 'background.paper',
          transition: 'border-color 0.2s, background-color 0.2s',
          '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' }
        }}
      >
        <CloudUploadIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
        <Typography variant="body2" color="text.secondary">
          Drag &amp; drop files here or{' '}
          <Typography component="span" color="primary.main" variant="body2">browse</Typography>
        </Typography>
        <input ref={inputRef} type="file" multiple hidden onChange={(e) => addFiles(e.target.files)} />
      </Paper>
      {files.length > 0 && (
        <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 1.5 }}>
          {files.map((file, idx) => (
            <Chip key={idx} icon={<InsertDriveFileIcon />} label={file.name}
              onDelete={() => removeFile(idx)} variant="outlined" size="small" />
          ))}
        </Stack>
      )}
    </Box>
  );
}

// ---------------------------------------------------------------------------
// AuthRegister
// ---------------------------------------------------------------------------
export default function AuthRegister() {
  const { register, isLoading } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [strength, setStrength] = useState(0);
  const [level, setLevel] = useState();

  const [account, setAccount] = useState({
    username: '', email: '', password: '', role: '', gender: '', dateOfBirth: '', address: ''
  });

  // Step 1 state (athletes only)
  const [athleteSetup, setAthleteSetup] = useState({
    athleteAction: '', // 'freelance' | 'gym_member'
    userCode: ''
  });

  // Last step state (all roles)
  const [gymSetup, setGymSetup] = useState({
    gymAction: '', // 'create' | 'join'
    gymCode: '',
    gymName: '',
    gymAddress: ''
  });

  // File arrays
  const [athleteFiles, setAthleteFiles] = useState([]);
  const [gymFiles, setGymFiles] = useState([]);

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');

  const isAthlete = Number(account.role) === 3;

  // Athletes: 3 steps; Managers: 2 steps
  const steps = isAthlete
    ? ['Account Details', 'Athlete Status', 'Gym Setup']
    : ['Account Details', 'Gym Setup'];

  const isLastStep = step === steps.length - 1;

  useEffect(() => {
    const s = strengthIndicator('');
    setStrength(s);
    setLevel(strengthColor(s));
  }, []);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------
  const handleAccountChange = (e) => {
    const { name, value } = e.target;
    setAccount((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
    if (name === 'role') {
      setAthleteSetup({ athleteAction: '', userCode: '' });
      setGymSetup({ gymAction: '', gymCode: '', gymName: '', gymAddress: '' });
      setAthleteFiles([]);
      setGymFiles([]);
      setStep(0);
    }
    if (name === 'password') {
      const s = strengthIndicator(value);
      setStrength(s);
      setLevel(strengthColor(s));
    }
  };

  const handleAthleteChange = (e) => {
    const { name, value } = e.target;
    setAthleteSetup((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleGymChange = (e) => {
    const { name, value } = e.target;
    setGymSetup((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleNext = async () => {
    setServerError('');
    try {
      if (step === 0) {
        await accountSchema.validate(account, { abortEarly: false });
      } else if (isAthlete && step === 1) {
        await athleteSchema.validate(athleteSetup, { abortEarly: false });
      }
      setErrors({});
      setStep((s) => s + 1);
    } catch (err) {
      const fieldErrors = {};
      (err.inner || []).forEach((e) => { fieldErrors[e.path] = e.message; });
      setErrors(fieldErrors);
    }
  };

  const handleBack = () => {
    setStep((s) => s - 1);
    setErrors({});
    setServerError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    try {
      await gymSchema.validate(gymSetup, { abortEarly: false });
    } catch (err) {
      const fieldErrors = {};
      (err.inner || []).forEach((e) => { fieldErrors[e.path] = e.message; });
      setErrors(fieldErrors);
      return;
    }

    const isFreelance = isAthlete && athleteSetup.athleteAction === 'freelance';
    const isGymMember = isAthlete && athleteSetup.athleteAction === 'gym_member';

    const payload = {
      user: {
        username: account.username,
        email: account.email,
        password: account.password,
        role: Number(account.role),
        address: account.address || null,
        gender: Number(account.gender),
        dateOfBirth: account.dateOfBirth,
        ...(isGymMember && athleteSetup.userCode ? { user_code: athleteSetup.userCode } : {})
      },
      gymAction: gymSetup.gymAction,
      gymCode: gymSetup.gymCode || null,
      newGym: gymSetup.gymAction === 'create'
        ? { name: gymSetup.gymName, address: gymSetup.gymAddress || null, gym_code: gymSetup.gymCode }
        : null
    };

    const files = {
      athleteDocuments: isFreelance ? athleteFiles : [],
      gymDocuments: gymSetup.gymAction === 'create' ? gymFiles : []
    };

    try {
      await register(payload, files);
      navigate(DASHBOARD_PATH);
    } catch (err) {
      setServerError(err.message || 'Registration failed. Please try again.');
    }
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <Box
      component="form"
      onSubmit={isLastStep ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }}
      noValidate
    >
      <Stepper activeStep={step} sx={{ mb: 3 }}>
        {steps.map((label) => (
          <Step key={label}><StepLabel>{label}</StepLabel></Step>
        ))}
      </Stepper>

      {serverError && <Alert severity="error" sx={{ mb: 2 }}>{serverError}</Alert>}

      {/* ------------------------------------------------------------------ */}
      {/* Step 0: Account Details                                              */}
      {/* ------------------------------------------------------------------ */}
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

      {/* ------------------------------------------------------------------ */}
      {/* Step 1 (athletes only): Athlete Status                               */}
      {/* ------------------------------------------------------------------ */}
      {isAthlete && step === 1 && (
        <>
          <FormControl component="fieldset" error={!!errors.athleteAction} sx={{ mb: 2 }}>
            <FormLabel component="legend">Athlete Status</FormLabel>
            <RadioGroup name="athleteAction" value={athleteSetup.athleteAction} onChange={handleAthleteChange}>
              <FormControlLabel value="freelance" control={<Radio />} label="Freelance" />
              <FormControlLabel value="gym_member" control={<Radio />} label="Belong to a gym" />
            </RadioGroup>
            {errors.athleteAction && <FormHelperText>{errors.athleteAction}</FormHelperText>}
          </FormControl>

          {athleteSetup.athleteAction === 'freelance' && (
            <FileUploadZone
              files={athleteFiles}
              onFilesChange={setAthleteFiles}
              label="Athlete Documents"
              description="Upload certifications, ID, or any supporting documents (optional)"
            />
          )}

          {athleteSetup.athleteAction === 'gym_member' && (
            <CustomFormControl fullWidth error={!!errors.userCode}>
              <InputLabel htmlFor="reg-usercode">User Code (optional)</InputLabel>
              <OutlinedInput
                id="reg-usercode"
                name="userCode"
                value={athleteSetup.userCode}
                onChange={handleAthleteChange}
                label="User Code (optional)"
                placeholder="Code assigned by your gym"
              />
              {errors.userCode && <FormHelperText>{errors.userCode}</FormHelperText>}
            </CustomFormControl>
          )}
        </>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Last step: Gym Setup                                                 */}
      {/* ------------------------------------------------------------------ */}
      {isLastStep && (
        <>
          <FormControl component="fieldset" error={!!errors.gymAction} sx={{ mb: 2 }}>
            <FormLabel component="legend">Gym</FormLabel>
            <RadioGroup name="gymAction" value={gymSetup.gymAction} onChange={handleGymChange}>
              <FormControlLabel value="create" control={<Radio />} label="New gym" />
              <FormControlLabel value="join" control={<Radio />} label="Belong to existing gym" />
            </RadioGroup>
            {errors.gymAction && <FormHelperText>{errors.gymAction}</FormHelperText>}
          </FormControl>

          {gymSetup.gymAction === 'create' && (
            <>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <CustomFormControl fullWidth error={!!errors.gymName}>
                    <InputLabel htmlFor="reg-gymname">Gym Name</InputLabel>
                    <OutlinedInput id="reg-gymname" name="gymName" value={gymSetup.gymName} onChange={handleGymChange} label="Gym Name" />
                    {errors.gymName && <FormHelperText>{errors.gymName}</FormHelperText>}
                  </CustomFormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <CustomFormControl fullWidth error={!!errors.gymCode}>
                    <InputLabel htmlFor="reg-gymcode-new">Gym Code</InputLabel>
                    <OutlinedInput id="reg-gymcode-new" name="gymCode" value={gymSetup.gymCode} onChange={handleGymChange} label="Gym Code" placeholder="e.g. GYM-X7B9Q" />
                    {errors.gymCode && <FormHelperText>{errors.gymCode}</FormHelperText>}
                  </CustomFormControl>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <CustomFormControl fullWidth error={!!errors.gymAddress}>
                    <InputLabel htmlFor="reg-gymaddress">Gym Address (optional)</InputLabel>
                    <OutlinedInput id="reg-gymaddress" name="gymAddress" value={gymSetup.gymAddress} onChange={handleGymChange} label="Gym Address (optional)" />
                    {errors.gymAddress && <FormHelperText>{errors.gymAddress}</FormHelperText>}
                  </CustomFormControl>
                </Grid>
              </Grid>
              <FileUploadZone
                files={gymFiles}
                onFilesChange={setGymFiles}
                label="Gym Documents"
                description="Upload gym registration, license, or certification documents (optional)"
              />
            </>
          )}

          {gymSetup.gymAction === 'join' && (
            <CustomFormControl fullWidth error={!!errors.gymCode}>
              <InputLabel htmlFor="reg-gymcode-join">Gym Code</InputLabel>
              <OutlinedInput
                id="reg-gymcode-join"
                name="gymCode"
                value={gymSetup.gymCode}
                onChange={handleGymChange}
                label="Gym Code"
                placeholder="Enter the gym's code"
              />
              {errors.gymCode && <FormHelperText>{errors.gymCode}</FormHelperText>}
            </CustomFormControl>
          )}
        </>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Navigation                                                           */}
      {/* ------------------------------------------------------------------ */}
      <Stack direction="row" sx={{ justifyContent: step === 0 ? 'flex-end' : 'space-between', mt: 3 }}>
        {step > 0 && (
          <Button onClick={handleBack} disabled={isLoading} variant="outlined" color="secondary">
            Back
          </Button>
        )}
        <AnimateButton>
          <Button disableElevation size="large" type="submit" variant="contained" color="secondary" disabled={isLoading}>
            {isLoading ? <CircularProgress size={24} color="inherit" /> : isLastStep ? 'Sign up' : 'Next'}
          </Button>
        </AnimateButton>
      </Stack>
    </Box>
  );
}
