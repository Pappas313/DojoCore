import { useState } from 'react';
import { useTranslation } from 'react-i18next';

// material-ui
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import Tooltip from '@mui/material/Tooltip';
import { useTheme } from '@mui/material/styles';

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'gr', label: 'Ελληνικά', flag: '🇬🇷' }
];

// ==============================|| LANGUAGE SWITCHER ||============================== //

export default function LanguageSwitcher({ variant = 'header' }) {
  const theme = useTheme();
  const { t, i18n } = useTranslation('common');
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const currentLang = LANGUAGES.find((l) => l.code === (i18n.resolvedLanguage ?? i18n.language)) ?? LANGUAGES[0];

  const handleToggle = (e) => setAnchorEl(anchorEl ? null : e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleSelect = (code) => {
    i18n.changeLanguage(code);
    handleClose();
  };

  const chipSx = variant === 'auth'
    ? {
        cursor: 'pointer',
        fontWeight: 600,
        fontSize: '0.75rem',
        px: 0.5,
        color: '#fff',
        background: 'rgba(255,255,255,0.15)',
        backdropFilter: 'blur(4px)',
        border: '1px solid rgba(255,255,255,0.35)',
        '&:hover': { background: 'rgba(255,255,255,0.28)' }
      }
    : {
        cursor: 'pointer',
        fontWeight: 600,
        fontSize: '0.75rem',
        px: 0.5,
        color: theme.vars.palette.secondary.dark,
        background: theme.vars.palette.secondary.light,
        '&:hover': {
          color: theme.vars.palette.secondary.light,
          background: theme.vars.palette.secondary.dark
        }
      };

  return (
    <>
      <Tooltip title="Change language">
        <Chip
          label={`${currentLang.flag} ${currentLang.code.toUpperCase()}`}
          onClick={handleToggle}
          size="small"
          sx={chipSx}
        />
      </Tooltip>

      <Popper open={open} anchorEl={anchorEl} placement="bottom-end" sx={{ zIndex: 1200 }}>
        <ClickAwayListener onClickAway={handleClose}>
          <Paper elevation={4} sx={{ mt: 1, minWidth: 160 }}>
            <List dense disablePadding>
              {LANGUAGES.map((lang) => (
                <ListItemButton
                  key={lang.code}
                  selected={lang.code === currentLang.code}
                  onClick={() => handleSelect(lang.code)}
                >
                  <Box component="span" sx={{ mr: 1, fontSize: '1.1rem' }}>
                    {lang.flag}
                  </Box>
                  <ListItemText primary={lang.label} secondary={lang.code.toUpperCase()} />
                </ListItemButton>
              ))}
            </List>
          </Paper>
        </ClickAwayListener>
      </Popper>
    </>
  );
}
