import { useState } from 'react';
import { useTranslation } from 'react-i18next';

// material-ui
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

// qr code
import { QRCodeSVG } from 'qrcode.react';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import { useAuth } from 'contexts/AuthContext';

// assets
import User1 from 'assets/images/users/user-round.svg';
import { IconUser } from '@tabler/icons-react';

// ==============================|| PROFILE PAGE ||============================== //

const ROLE_LABELS = { 0: 'Admin', 1: 'Manager', 2: 'Coach', 3: 'Athlete' };

export default function ProfilePage() {
  const { t } = useTranslation('common');
  const { user } = useAuth();

  const profileUrl = `${window.location.origin}/settings/profile`;
  const displayName = user?.username || user?.email || 'User';
  const roleLabel = user?.role != null ? (ROLE_LABELS[user.role] ?? `Role ${user.role}`) : '';

  return (
    <MainCard title={t('settings.profile', 'Profile')}>
      <Grid container spacing={3}>
        {/* Avatar + basic info */}
        <Grid size={{ xs: 12, md: 4 }}>
          <MainCard>
            <Stack alignItems="center" spacing={2} sx={{ py: 2 }}>
              <Avatar src={User1} alt="profile" sx={{ width: 96, height: 96 }} />
              <Typography variant="h4">{displayName}</Typography>
              {roleLabel && (
                <Typography variant="subtitle2" color="text.secondary">
                  {roleLabel}
                </Typography>
              )}
              {user?.email && (
                <Typography variant="body2" color="text.secondary">
                  {user.email}
                </Typography>
              )}
              <Divider sx={{ width: '100%' }} />
              {/* QR Code */}
              <Typography variant="subtitle1" fontWeight={600}>
                {t('settings.profileQR', 'Profile QR Code')}
              </Typography>
              <Box sx={{ p: 1, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                <QRCodeSVG value={profileUrl} size={160} />
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>
                {profileUrl}
              </Typography>
            </Stack>
          </MainCard>
        </Grid>

        {/* Edit form */}
        <Grid size={{ xs: 12, md: 8 }}>
          <MainCard title={t('settings.profileDetails', 'Profile Details')}>
            <Grid container spacing={2}>
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
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label={t('settings.role', 'Role')}
                  value={roleLabel}
                  InputProps={{ readOnly: true }}
                />
              </Grid>
            </Grid>
          </MainCard>
        </Grid>
      </Grid>
    </MainCard>
  );
}
