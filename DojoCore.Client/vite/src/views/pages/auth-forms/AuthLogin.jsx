import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';

// material-ui
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
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

const DEMO_ACCOUNTS = [
  { role: 'Demo Manager', username: 'demo.manager', password: 'Demo@12345' },
  { role: 'Demo Coach', username: 'demo.coach1', password: 'Demo@12345' },
  { role: 'Demo Athlete', username: 'demo.athlete', password: 'Demo@12345' },
  { role: 'Demo Freelance Athlete', username: 'demo.freelancer', password: 'Demo@12345' }
];

// ===============================|| JWT - LOGIN ||=============================== //

export default function AuthLogin() {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation('common');

  // Redirect back to the page the user was trying to reach, or fall back to dashboard
  const redirectTo = location.state?.from?.pathname ?? DASHBOARD_PATH;

  const [values, setValues] = useState({ identifier: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [checked, setChecked] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [demoDialogOpen, setDemoDialogOpen] = useState(false);

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
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setServerError(err.message || t('Login failed. Please try again.', 'Login failed. Please try again.'));
    }
  };

  const handleDemoLogin = async (account) => {
    setServerError('');
    setDemoDialogOpen(false);
    setValues({ identifier: account.username, password: account.password });

    try {
      await login({ identifier: account.username, password: account.password });
      navigate(redirectTo, { replace: true });
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

      <Box sx={{ mt: 2 }}>
        <Button color="secondary" fullWidth size="large" variant="outlined" onClick={() => setDemoDialogOpen(true)}>
          {t('Try Demo Accounts', 'Try Demo Accounts')}
        </Button>
      </Box>

      <Dialog open={demoDialogOpen} onClose={() => setDemoDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('Demo Accounts', 'Demo Accounts')}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            {t(
              'Use one of the accounts below to explore DojoCore, or click a row to sign in instantly.',
              'Use one of the accounts below to explore DojoCore, or click a row to sign in instantly.'
            )}
          </Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>{t('Role', 'Role')}</TableCell>
                <TableCell>{t('Username', 'Username')}</TableCell>
                <TableCell>{t('Password', 'Password')}</TableCell>
                <TableCell align="right" />
              </TableRow>
            </TableHead>
            <TableBody>
              {DEMO_ACCOUNTS.map((account) => (
                <TableRow key={account.username} hover sx={{ cursor: 'pointer' }} onClick={() => handleDemoLogin(account)}>
                  <TableCell>{t(account.role, account.role)}</TableCell>
                  <TableCell>{account.username}</TableCell>
                  <TableCell>{account.password}</TableCell>
                  <TableCell align="right">
                    <Button
                      size="small"
                      color="secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDemoLogin(account);
                      }}
                    >
                      {t('Sign In', 'Sign In')}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDemoDialogOpen(false)}>{t('Close', 'Close')}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
