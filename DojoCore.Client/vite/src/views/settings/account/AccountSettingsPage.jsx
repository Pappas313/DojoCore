import { useState } from 'react';
import { useTranslation } from 'react-i18next';

// material-ui
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import { useAuth } from 'contexts/AuthContext';

// ==============================|| ACCOUNT SETTINGS PAGE ||============================== //

function TabPanel({ children, value, index, ...other }) {
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export default function AccountSettingsPage() {
  const { t } = useTranslation('common');
  const { user } = useAuth();
  const [tab, setTab] = useState(0);

  return (
    <MainCard title={t('settings.accountSettings', 'Ρυθμίσεις Λογαριασμού')}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} aria-label="account settings tabs">
          <Tab label={t('settings.tabGeneral', 'Γενικά')} />
          <Tab label={t('settings.tabSecurity', 'Ασφάλεια')} />
          <Tab label={t('settings.tabNotifications', 'Ειδοποιήσεις')} />
        </Tabs>
      </Box>

      {/* General */}
      <TabPanel value={tab} index={0}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            <Typography variant="h5" gutterBottom>
              {t('settings.generalInfo', 'Γενικές Πληροφορίες')}
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label={t('settings.username', 'Username')}
              defaultValue={user?.username || ''}
              InputProps={{ readOnly: true }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label={t('settings.email', 'Email')}
              defaultValue={user?.email || ''}
              InputProps={{ readOnly: true }}
            />
          </Grid>
        </Grid>
      </TabPanel>

      {/* Security */}
      <TabPanel value={tab} index={1}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            <Typography variant="h5" gutterBottom>
              {t('settings.changePassword', 'Αλλαγή Κωδικού')}
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField fullWidth label={t('settings.currentPassword', 'Τρέχων Κωδικός')} type="password" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField fullWidth label={t('settings.newPassword', 'Νέος Κωδικός')} type="password" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField fullWidth label={t('settings.confirmPassword', 'Επιβεβαίωση Κωδικού')} type="password" />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Stack direction="row" justifyContent="flex-end">
              <Button variant="contained" color="primary">
                {t('settings.saveChanges', 'Αποθήκευση')}
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Notifications */}
      <TabPanel value={tab} index={2}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            <Typography variant="h5" gutterBottom>
              {t('settings.notifications', 'Ειδοποιήσεις')}
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <FormControlLabel
              control={<Switch defaultChecked color="primary" />}
              label={t('settings.emailNotifications', 'Ειδοποιήσεις Email')}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <FormControlLabel
              control={<Switch color="primary" />}
              label={t('settings.pushNotifications', 'Push Ειδοποιήσεις')}
            />
          </Grid>
        </Grid>
      </TabPanel>
    </MainCard>
  );
}
