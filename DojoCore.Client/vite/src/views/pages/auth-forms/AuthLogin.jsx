import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';

// material-ui
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import CircularProgress from '@mui/material/CircularProgress';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project imports
import AnimateButton from 'ui-component/extended/AnimateButton';
import CustomFormControl from 'ui-component/extended/Form/CustomFormControl';
import { useAuth } from 'contexts/AuthContext';
import { DASHBOARD_PATH } from 'config';

// assets
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

const loginSchema = Yup.object({
  identifier: Yup.string().required('Email or username is required'),
  password: Yup.string().required('Password is required')
});

// ===============================|| JWT - LOGIN ||=============================== //

export default function AuthLogin() {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation('common');

  const [values, setValues] = useState({ identifier: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [checked, setChecked] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleClickShowPassword = () => setShowPassword((s) => !s);
  const handleMouseDownPassword = (e) => e.preventDefault();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    try {
      await loginSchema.validate(values, { abortEarly: false });
    } catch (validationErr) {
      const fieldErrors = {};
      validationErr.inner.forEach((err) => {
        fieldErrors[err.path] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    try {
      await login({ identifier: values.identifier, password: values.password });
      navigate(DASHBOARD_PATH);
    } catch (err) {
      setServerError(err.message || t('Login failed. Please try again.', 'Login failed. Please try again.'));
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      {serverError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {serverError}
        </Alert>
      )}

      <CustomFormControl fullWidth error={!!errors.email}>
        <InputLabel htmlFor="outlined-adornment-email-login">{t('Email Address / Username', 'Email Address / Username')}</InputLabel>
        <OutlinedInput
          id="outlined-adornment-email-login"
          type="text"
          value={values.identifier}
          name="identifier"
          onChange={handleChange}
          label={t('Email Address / Username', 'Email Address / Username')}
        />
        {errors.identifier && (
          <Typography variant="caption" color="error">
            {t(errors.identifier, errors.identifier)}
          </Typography>
        )}
      </CustomFormControl>

      <CustomFormControl fullWidth error={!!errors.password}>
        <InputLabel htmlFor="outlined-adornment-password-login">{t('Password', 'Password')}</InputLabel>
        <OutlinedInput
          id="outlined-adornment-password-login"
          type={showPassword ? 'text' : 'password'}
          value={values.password}
          name="password"
          onChange={handleChange}
          endAdornment={
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle password visibility"
                onClick={handleClickShowPassword}
                onMouseDown={handleMouseDownPassword}
                edge="end"
                size="large"
              >
                {showPassword ? <Visibility /> : <VisibilityOff />}
              </IconButton>
            </InputAdornment>
          }
          label={t('Password', 'Password')}
        />
        {errors.password && (
          <Typography variant="caption" color="error">
            {t(errors.password, errors.password)}
          </Typography>
        )}
      </CustomFormControl>

      <Grid container sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <Grid>
          <FormControlLabel
            control={<Checkbox checked={checked} onChange={(e) => setChecked(e.target.checked)} name="checked" color="primary" />}
            label={t('Keep me logged in', 'Keep me logged in')}
          />
        </Grid>
        <Grid>
          <Typography variant="subtitle1" component={Link} to="#!" sx={{ textDecoration: 'none', color: 'secondary.main' }}>
            {t('Forgot Password?', 'Forgot Password?')}
          </Typography>
        </Grid>
      </Grid>

      <Box sx={{ mt: 2 }}>
        <AnimateButton>
          <Button color="secondary" fullWidth size="large" type="submit" variant="contained" disabled={isLoading}>
            {isLoading ? <CircularProgress size={24} color="inherit" /> : t('Sign In', 'Sign In')}
          </Button>
        </AnimateButton>
      </Box>
    </Box>
  );
}
