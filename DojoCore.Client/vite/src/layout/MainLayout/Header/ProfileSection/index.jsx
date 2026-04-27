import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// material-ui
import { useTheme, useColorScheme } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import Transitions from 'ui-component/extended/Transitions';
import useConfig from 'hooks/useConfig';
import { useAuth } from 'contexts/AuthContext';

// assets
import User1 from 'assets/images/users/user-round.svg';
import { IconLogout, IconMoon, IconSettings, IconSun, IconUser } from '@tabler/icons-react';

// ==============================|| PROFILE MENU ||============================== //

const ROLE_LABELS = { 0: 'Admin', 1: 'Manager', 2: 'Coach', 3: 'Athlete' };
const roleLabel = (role) => ROLE_LABELS[role] ?? `Role ${role}`;

export default function ProfileSection() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { t } = useTranslation('common');
  const { mode, setMode } = useColorScheme();
  const {
    state: { borderRadius }
  } = useConfig();

  const isDark = mode === 'dark';
  const [open, setOpen] = useState(false);

  /**
   * anchorRef is used on different components and specifying one type leads to other components throwing an error
   * */
  const anchorRef = useRef(null);

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }

    setOpen(false);
  };

  const prevOpen = useRef(open);
  useEffect(() => {
    if (prevOpen.current === true && open === false) {
      anchorRef.current.focus();
    }

    prevOpen.current = open;
  }, [open]);

  const handleLogout = async () => {
    await logout();
    navigate('/pages/login', { replace: true });
  };

  return (
    <>
      <Chip
        slotProps={{ label: { sx: { lineHeight: 0 } } }}
        sx={{ ml: 2, height: '48px', alignItems: 'center', borderRadius: '27px' }}
        icon={
          <Avatar
            src={User1}
            alt="user-images"
            sx={{ typography: 'mediumAvatar', margin: '8px 0 8px 8px !important', cursor: 'pointer' }}
            ref={anchorRef}
            aria-controls={open ? 'menu-list-grow' : undefined}
            aria-haspopup="true"
            color="inherit"
          />
        }
        label={<IconSettings stroke={1.5} size="24px" />}
        ref={anchorRef}
        aria-controls={open ? 'menu-list-grow' : undefined}
        aria-haspopup="true"
        onClick={handleToggle}
        color="primary"
        aria-label="user-account"
      />
      <Popper
        placement="bottom"
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
        modifiers={[
          {
            name: 'offset',
            options: {
              offset: [0, 14]
            }
          }
        ]}
      >
        {({ TransitionProps }) => (
          <ClickAwayListener onClickAway={handleClose}>
            <Transitions in={open} {...TransitionProps}>
              <Paper>
                {open && (
                  <MainCard border={false} elevation={16} content={false} boxShadow shadow={theme.shadows[16]}>
                    <Box sx={{ p: 2, pb: 0 }}>
                      <Stack>
                        <Stack direction="row" sx={{ alignItems: 'center', gap: 0.5 }}>
                          <Typography variant="h4">{t('profile.greeting', 'Good Morning,')}</Typography>
                          <Typography component="span" variant="h4" sx={{ fontWeight: 400 }}>
                            {user?.username || user?.email || 'User'}
                          </Typography>
                        </Stack>
                        <Typography variant="subtitle2">{user?.role != null ? roleLabel(user.role) : ''}</Typography>
                      </Stack>
                      <Divider sx={{ mt: 2 }} />
                    </Box>
                    <Box
                      sx={{
                        p: 2,
                        py: 0,
                        height: '100%',
                        maxHeight: 'calc(100vh - 250px)',
                        overflowX: 'hidden',
                        '&::-webkit-scrollbar': { width: 5 }
                      }}
                    >
                      <List
                        component="nav"
                        sx={{
                          width: '100%',
                          maxWidth: 350,
                          minWidth: 300,
                          borderRadius: `${borderRadius}px`,
                          '& .MuiListItemButton-root': { mt: 0.5 }
                        }}
                      >
                        <ListItemButton sx={{ borderRadius: `${borderRadius}px` }}>
                          <ListItemIcon>
                            <IconSettings stroke={1.5} size="20px" />
                          </ListItemIcon>
                          <ListItemText primary={<Typography variant="body2">{t('profile.accountSettings', 'Account Settings')}</Typography>} />
                        </ListItemButton>
                        <ListItemButton sx={{ borderRadius: `${borderRadius}px` }}>
                          <ListItemIcon>
                            <IconUser stroke={1.5} size="20px" />
                          </ListItemIcon>
                          <ListItemText primary={<Typography variant="body2">{t('profile.profile', 'Profile')}</Typography>} />
                        </ListItemButton>
                        <ListItemButton sx={{ borderRadius: `${borderRadius}px` }} onClick={() => setMode(isDark ? 'light' : 'dark')}>
                          <ListItemIcon>
                            {isDark ? <IconSun stroke={1.5} size="20px" /> : <IconMoon stroke={1.5} size="20px" />}
                          </ListItemIcon>
                          <ListItemText primary={<Typography variant="body2">{isDark ? t('profile.lightMode', 'Light Mode') : t('profile.darkMode', 'Dark Mode')}</Typography>} />
                          <Switch checked={isDark} onChange={() => setMode(isDark ? 'light' : 'dark')} size="small" color="primary" onClick={(e) => e.stopPropagation()} />
                        </ListItemButton>
                        <ListItemButton sx={{ borderRadius: `${borderRadius}px` }} onClick={handleLogout}>
                          <ListItemIcon>
                            <IconLogout stroke={1.5} size="20px" />
                          </ListItemIcon>
                          <ListItemText primary={<Typography variant="body2">{t('profile.logout', 'Logout')}</Typography>} />
                        </ListItemButton>
                      </List>
                    </Box>
                  </MainCard>
                )}
              </Paper>
            </Transitions>
          </ClickAwayListener>
        )}
      </Popper>
    </>
  );
}
