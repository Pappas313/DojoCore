import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Box, 
  TextField, 
  Button, 
  Checkbox, 
  FormControlLabel, 
  Typography, 
  Link,
  InputAdornment,
  IconButton
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import type { LoginPayload } from '@/types/auth';

const loginSchema = z.object({
  identifier: z.string().min(1, { message: 'Email/Username is required' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  rememberMe: z.boolean().optional(),
});

type LoginFormInputs = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onSubmit: (data: LoginPayload) => void;
  isLoading?: boolean;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSubmit, isLoading = false }) => {
  const { t } = useTranslation('auth');
  const [showPassword, setShowPassword] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: '',
      password: '',
      rememberMe: true,
    }
  });

  const handleFormSubmit = (data: LoginFormInputs) => {
    onSubmit({
      identifier: data.identifier,
      password: data.password,
    });
  };

  return (
    <Box component="form" onSubmit={handleSubmit(handleFormSubmit)} noValidate sx={{ width: '100%' }}>
      <Controller
        name="identifier"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            fullWidth
            label={t('email') || 'Email Address / Username'}
            variant="outlined"
            margin="normal"
            error={!!errors.identifier}
            helperText={errors.identifier?.message}
            disabled={isLoading}
            sx={{ mb: 2 }}
          />
        )}
      />

      <Controller
        name="password"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            fullWidth
            label={t('password')}
            type={showPassword ? 'text' : 'password'}
            variant="outlined"
            margin="normal"
            error={!!errors.password}
            helperText={errors.password?.message}
            disabled={isLoading}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ mb: 1 }}
          />
        )}
      />

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, mt: 1 }}>
        <Controller
          name="rememberMe"
          control={control}
          render={({ field }) => (
            <FormControlLabel
              control={<Checkbox {...field} checked={field.value} color="primary" disabled={isLoading} />}
              label={<Typography variant="body2">{t('keep_logged_in') || 'Keep me logged in'}</Typography>}
            />
          )}
        />
        <Link href="#" variant="body2" underline="hover" color="primary">
          {t('forgot_password') || 'Forgot Password?'}
        </Link>
      </Box>

      <Button
        type="submit"
        fullWidth
        variant="contained"
        color="primary"
        size="large"
        disabled={isLoading}
        sx={{ py: 1.5, mb: 2, fontSize: '1rem', fontWeight: 600 }}
      >
        {t('login_button')}
      </Button>

      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          {t('dont_have_account')}{' '}
          <Link component={RouterLink} to="/register" variant="subtitle2" underline="hover" color="primary.main">
            {t('signup_button')}
          </Link>
        </Typography>
      </Box>
    </Box>
  );
};
