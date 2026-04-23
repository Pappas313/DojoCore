import React, { useState, useEffect } from 'react';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  InputAdornment,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
  Grid,
  RadioGroup,
  Radio,
  FormControlLabel,
  ToggleButtonGroup,
  ToggleButton,
  LinearProgress
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { Dayjs } from 'dayjs';
import { DocumentDropzone } from './DocumentDropzone';
import type { CombinedRegistrationPayload, GymAction } from '@/types/auth';

const registerSchema = z.object({
  username: z.string().min(1, { message: 'Username is required' }),
  email: z.string().email({ message: 'Invalid email' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  address: z.string().min(1, { message: 'Address is required' }),
  gender: z.number({ invalid_type_error: 'Please select a gender' }),
  dateOfBirth: z.string().min(1, { message: 'Date of birth is required' }),
  userCode: z.string().optional(),
  role: z.number(),
  gymAction: z.enum(['join', 'create', 'none']),
  gymCode: z.string().optional().nullable(),
  newGymName: z.string().optional().nullable(),
  newGymAddress: z.string().optional().nullable(),
});

type RegisterFormInputs = z.infer<typeof registerSchema>;

interface RegisterFormProps {
  onSubmit: (data: CombinedRegistrationPayload, files: File[]) => void;
  isLoading?: boolean;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSubmit, isLoading = false }) => {
  const { t } = useTranslation('auth');
  const [showPassword, setShowPassword] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  const { control, handleSubmit, setValue, formState: { errors } } = useForm<RegisterFormInputs>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      address: '',
      gender: '' as unknown as number,
      dateOfBirth: '',
      userCode: '',
      role: 3, // Default to Athlete
      gymAction: 'join',
      gymCode: '',
      newGymName: '',
      newGymAddress: '',
    }
  });

  const selectedRole = useWatch({ control, name: 'role' });
  const selectedGymAction = useWatch({ control, name: 'gymAction' });
  const passwordValue = useWatch({ control, name: 'password' }) || '';

  // Password strength logic
  const getPasswordStrength = (pw: string) => {
    if (!pw || pw.length === 0) return { score: 0, label: '', color: 'inherit' as const };
    if (pw.length < 6) return { score: 33, label: t('password_weak'), color: 'error' as const };
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(pw);
    if (pw.length >= 8 && hasSpecial) return { score: 100, label: t('password_strong'), color: 'success' as const };
    return { score: 66, label: t('password_medium'), color: 'warning' as const };
  };

  const pwStrength = getPasswordStrength(passwordValue);

  // Reset gymAction and files when role changes to ensure valid state mappings
  useEffect(() => {
    if (selectedRole === 3 && selectedGymAction === 'create') {
      setValue('gymAction', 'join');
    }
    if ((selectedRole === 1 || selectedRole === 2) && selectedGymAction === 'none') {
      setValue('gymAction', 'join');
    }
    setFiles([]); // Clear files on flow change to prevent stale docs being submitted
  }, [selectedRole, selectedGymAction, setValue]);

  const handleFormSubmit = (data: RegisterFormInputs) => {
    const payload: CombinedRegistrationPayload = {
      user: {
        username: data.username,
        email: data.email,
        password: data.password,
        role: data.role,
        address: data.address,
        gender: data.gender,
        dateOfBirth: data.dateOfBirth,
        userCode: data.userCode,
      },
      gymAction: data.gymAction as GymAction,
      gymCode: data.gymAction === 'join' ? data.gymCode || null : null,
      newGym: data.gymAction === 'create' ? {
        name: data.newGymName || '',
        address: data.newGymAddress || '',
      } : null,
    };

    onSubmit(payload, files);
  };

  return (
    <Box component="form" onSubmit={handleSubmit(handleFormSubmit)} noValidate sx={{ width: '100%' }}>
      <Grid container spacing={2}>
        {/* Prominent Role Selector */}
        <Grid item xs={12}>
          <Controller
            name="role"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth error={!!errors.role} disabled={isLoading}>
                <InputLabel>{t('role')}</InputLabel>
                <Select {...field} label={t('role')}>
                  <MenuItem value={3}>{t('role_athlete')}</MenuItem>
                  <MenuItem value={1}>{t('role_coach')}</MenuItem>
                  <MenuItem value={2}>{t('role_manager')}</MenuItem>
                </Select>
                {errors.role && <FormHelperText>{errors.role.message}</FormHelperText>}
              </FormControl>
            )}
          />
        </Grid>

        {/* Base Fields */}
        <Grid item xs={12} sm={6}>
          <Controller
            name="username"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label={t('username')}
                variant="outlined"
                error={!!errors.username}
                helperText={errors.username?.message}
                disabled={isLoading}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label={t('email')}
                variant="outlined"
                error={!!errors.email}
                helperText={errors.email?.message}
                disabled={isLoading}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <Box>
                <TextField
                  {...field}
                  fullWidth
                  label={t('password')}
                  type={showPassword ? 'text' : 'password'}
                  variant="outlined"
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  disabled={isLoading}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                {passwordValue.length > 0 && (
                  <Box sx={{ mt: 1, px: 1 }}>
                    <LinearProgress 
                      variant="determinate" 
                      value={pwStrength.score} 
                      color={pwStrength.color === 'inherit' ? 'primary' : pwStrength.color} 
                      sx={{ height: 6, borderRadius: 1, mb: 0.5 }} 
                    />
                    <Typography variant="caption" color={pwStrength.color === 'inherit' ? 'text.secondary' : `${pwStrength.color}.main`}>
                      {pwStrength.label}
                    </Typography>
                  </Box>
                )}
              </Box>
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Controller
            name="address"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label={t('address')}
                variant="outlined"
                error={!!errors.address}
                helperText={errors.address?.message}
                disabled={isLoading}
              />
            )}
          />
        </Grid>

        {/* NEW FIELDS: Gender and Date of Birth */}
        <Grid item xs={12} sm={6}>
          <Controller
            name="gender"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth error={!!errors.gender} disabled={isLoading}>
                <InputLabel>{t('gender')}</InputLabel>
                <Select {...field} label={t('gender')}>
                  <MenuItem value={1}>{t('gender_male')}</MenuItem>
                  <MenuItem value={0}>{t('gender_female')}</MenuItem>
                  <MenuItem value={2}>{t('gender_other')}</MenuItem>
                </Select>
                {errors.gender && <FormHelperText>{errors.gender.message}</FormHelperText>}
              </FormControl>
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Controller
            name="dateOfBirth"
            control={control}
            render={({ field: { onChange, value, ...rest } }) => (
              <DatePicker
                label={t('date_of_birth')}
                value={value ? dayjs(value) : null}
                onChange={(newValue: Dayjs | null) => {
                  onChange(newValue ? newValue.format('YYYY-MM-DD') : '');
                }}
                format="DD/MM/YYYY"
                slotProps={{
                  textField: {
                    ...rest,
                    fullWidth: true,
                    variant: 'outlined',
                    error: !!errors.dateOfBirth,
                    helperText: errors.dateOfBirth?.message,
                    disabled: isLoading,
                    placeholder: t('dob_placeholder')
                  }
                }}
              />
            )}
          />
        </Grid>

        {/* Conditional Flows */}
        <Grid item xs={12} container justifyContent="center">
          <Grid item xs={12} md={8}>
            <Box sx={{ mt: 2, mb: 1, p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2, backgroundColor: 'background.paper' }}>
              <Typography variant="subtitle2" color="primary" sx={{ mb: 2 }}>
                {selectedRole === 3 ? t('role_athlete') : (selectedRole === 1 ? t('role_coach') : t('role_manager'))} Options
              </Typography>

              {(selectedRole === 1 || selectedRole === 2) && (
                <Controller
                  name="userCode"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label={selectedRole === 1 ? t('coach_code') : t('manager_code')}
                      variant="outlined"
                      error={!!errors.userCode}
                      helperText={errors.userCode?.message}
                      disabled={isLoading}
                      sx={{ mb: 3 }}
                    />
                  )}
                />
              )}

              <Controller
                name="gymAction"
                control={control}
                render={({ field }) => (
                  selectedRole === 3 ? (
                    <ToggleButtonGroup
                      color="primary"
                      value={field.value}
                      exclusive
                      onChange={(_, val) => val && field.onChange(val)}
                      fullWidth
                      sx={{ mb: 3 }}
                      disabled={isLoading}
                    >
                      <ToggleButton value="join">{t('member')}</ToggleButton>
                      <ToggleButton value="none">{t('freelancer')}</ToggleButton>
                    </ToggleButtonGroup>
                  ) : (
                    <RadioGroup
                      row
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                      sx={{ mb: 3 }}
                    >
                      <FormControlLabel value="join" control={<Radio disabled={isLoading} />} label={t('join_gym')} />
                      <FormControlLabel value="create" control={<Radio disabled={isLoading} />} label={t('create_gym')} />
                    </RadioGroup>
                  )
                )}
              />

              {selectedGymAction === 'join' && (
                <Grid container spacing={2} sx={{ mb: 1 }}>
                  {selectedRole === 3 && (
                    <Grid item xs={12} sm={6}>
                      <Controller
                        name="userCode"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            label={t('athlete_code')}
                            variant="outlined"
                            error={!!errors.userCode}
                            helperText={errors.userCode?.message}
                            disabled={isLoading}
                          />
                        )}
                      />
                    </Grid>
                  )}
                  <Grid item xs={12} sm={selectedRole === 3 ? 6 : 12}>
                    <Controller
                      name="gymCode"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label={t('gym_code')}
                          variant="outlined"
                          error={!!errors.gymCode}
                          helperText={errors.gymCode?.message}
                          disabled={isLoading}
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              )}

              {selectedGymAction === 'create' && (
                <Grid container spacing={2} sx={{ mb: 1 }}>
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="newGymName"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label={t('gym_name')}
                          variant="outlined"
                          error={!!errors.newGymName}
                          helperText={errors.newGymName?.message}
                          disabled={isLoading}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="newGymAddress"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label={t('gym_address')}
                          variant="outlined"
                          error={!!errors.newGymAddress}
                          helperText={errors.newGymAddress?.message}
                          disabled={isLoading}
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              )}

              {(selectedGymAction === 'none' || selectedGymAction === 'create') && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontWeight: 500, textAlign: 'center' }}>
                    {selectedGymAction === 'none' 
                      ? t('upload_freelancer_docs') 
                      : t('upload_gym_docs')}
                  </Typography>
                  <DocumentDropzone onFilesSelected={setFiles} />
                  {files.length > 0 && (
                    <Typography variant="caption" color="success.main" sx={{ mt: 1, display: 'block', fontWeight: 'bold', textAlign: 'center' }}>
                      {files.length} {t('files_selected')}
                    </Typography>
                  )}
                </Box>
              )}
            </Box>
          </Grid>
        </Grid>

        <Grid item xs={12}>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            size="large"
            disabled={isLoading}
            sx={{ py: 1.5, mt: 2, fontSize: '1rem', fontWeight: 600 }}
          >
            {t('signup_button')}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};
