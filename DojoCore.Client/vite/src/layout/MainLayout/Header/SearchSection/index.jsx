import PropTypes from 'prop-types';
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

// material-ui
import { useTheme } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import InputAdornment from '@mui/material/InputAdornment';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import OutlinedInput from '@mui/material/OutlinedInput';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import Typography from '@mui/material/Typography';

// third party
import PopupState, { bindPopper, bindToggle } from 'material-ui-popup-state';

// project imports
import Transitions from 'ui-component/extended/Transitions';
import menuItems from 'menu-items';

// assets
import { IconAdjustmentsHorizontal, IconSearch, IconX } from '@tabler/icons-react';

// ==============================|| FLATTEN MENU ITEMS INTO SEARCHABLE LIST ||============================== //

function flattenMenuItems(items) {
  const results = [];

  function walk(node, groupTitle) {
    if (node.type === 'group') {
      (node.children || []).forEach((child) => walk(child, node.title || groupTitle));
    } else if (node.type === 'collapse') {
      (node.children || []).forEach((child) => walk(child, groupTitle));
    } else if (node.type === 'item' && node.url && !node.external && !node.target) {
      results.push({
        id: node.id,
        title: node.title,
        url: node.url,
        icon: node.icon || null,
        group: groupTitle || ''
      });
    }
  }

  items.forEach((item) => walk(item, item.title || ''));
  return results;
}

// ==============================|| HIGHLIGHT MATCHED TEXT ||============================== //

function HighlightText({ text, query }) {
  if (!query) return <span>{text}</span>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <span>{text}</span>;
  return (
    <span>
      {text.slice(0, idx)}
      <strong>{text.slice(idx, idx + query.length)}</strong>
      {text.slice(idx + query.length)}
    </span>
  );
}

// ==============================|| SEARCH RESULTS LIST ||============================== //

function ResultsList({ results, query, onSelect }) {
  const theme = useTheme();

  if (!results.length) {
    return (
      <Box sx={{ px: 2, py: 1.5 }}>
        <Typography variant="body2" color="text.secondary">
          No results found
        </Typography>
      </Box>
    );
  }

  // group results by group label for display
  const grouped = results.reduce((acc, item) => {
    const key = item.group || 'Other';
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  return (
    <List disablePadding dense>
      {Object.entries(grouped).map(([group, items], gi) => (
        <Box key={group}>
          {gi > 0 && <Divider />}
          <Box sx={{ px: 2, pt: 1, pb: 0.25 }}>
            <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {group}
            </Typography>
          </Box>
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <ListItemButton
                key={item.id}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => onSelect(item.url)}
                sx={{
                  px: 2,
                  py: 0.75,
                  '&:hover': {
                    bgcolor: theme.vars.palette.secondary.light
                  }
                }}
              >
                {Icon && (
                  <ListItemIcon sx={{ minWidth: 32, color: theme.vars.palette.secondary.dark }}>
                    <Icon size="18px" stroke={1.5} />
                  </ListItemIcon>
                )}
                <ListItemText
                  primary={
                    <Typography variant="body2" color="text.primary">
                      <HighlightText text={item.title} query={query} />
                    </Typography>
                  }
                />
              </ListItemButton>
            );
          })}
        </Box>
      ))}
    </List>
  );
}

// ==============================|| HEADER AVATAR ||============================== //

function HeaderAvatar({ children, ref, ...others }) {
  const theme = useTheme();

  return (
    <Avatar
      ref={ref}
      variant="rounded"
      sx={{
        ...theme.typography.commonAvatar,
        ...theme.typography.mediumAvatar,
        color: theme.vars.palette.secondary.dark,
        background: theme.vars.palette.secondary.light,
        '&:hover': {
          color: theme.vars.palette.secondary.light,
          background: theme.vars.palette.secondary.dark
        }
      }}
      {...others}
    >
      {children}
    </Avatar>
  );
}

// ==============================|| SEARCH INPUT - MOBILE ||============================== //

function MobileSearch({ value, onChange, popupState, results, onSelect }) {
  const theme = useTheme();
  const open = value.trim().length > 0;

  return (
    <Box>
      <OutlinedInput
        id="input-search-header"
        value={value}
        onChange={onChange}
        placeholder="Search"
        startAdornment={
          <InputAdornment position="start">
            <IconSearch stroke={1.5} size="16px" />
          </InputAdornment>
        }
        endAdornment={
          <InputAdornment position="end">
            <HeaderAvatar>
              <IconAdjustmentsHorizontal stroke={1.5} size="20px" />
            </HeaderAvatar>
            <Box sx={{ ml: 2 }}>
              <Avatar
                variant="rounded"
                sx={{
                  ...theme.typography.commonAvatar,
                  ...theme.typography.mediumAvatar,
                  bgcolor: 'orange.light',
                  color: 'orange.dark',
                  '&:hover': { bgcolor: 'orange.dark', color: 'orange.light' }
                }}
                {...bindToggle(popupState)}
              >
                <IconX stroke={1.5} size="20px" />
              </Avatar>
            </Box>
          </InputAdornment>
        }
        aria-describedby="search-helper-text"
        slotProps={{ input: { 'aria-label': 'weight', sx: { bgcolor: 'transparent', pl: 0.5 } } }}
        sx={{ width: '100%', ml: 0.5, px: 2, bgcolor: 'background.paper' }}
      />
      {open && (
        <Paper elevation={4} sx={{ mt: 1, maxHeight: 360, overflowY: 'auto', borderRadius: 2 }}>
          <ResultsList results={results} query={value} onSelect={onSelect} />
        </Paper>
      )}
    </Box>
  );
}

// ==============================|| SEARCH INPUT ||============================== //

export default function SearchSection() {
  const [value, setValue] = useState('');
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const allPages = useMemo(() => flattenMenuItems(menuItems.items), []);

  const results = useMemo(() => {
    const q = value.trim();
    if (!q) return [];
    return allPages.filter((p) => p.title.toLowerCase().includes(q.toLowerCase()));
  }, [value, allPages]);

  const handleSelect = (url) => {
    setValue('');
    setOpen(false);
    navigate(url);
  };

  const handleChange = (e) => {
    setValue(e.target.value);
    setOpen(true);
  };

  const handleBlur = () => {
    // delay so onClick on a result fires before the dropdown closes
    setTimeout(() => setOpen(false), 150);
  };

  const dropdownOpen = open && value.trim().length > 0;

  return (
    <>
      {/* Mobile */}
      <Box sx={{ display: { xs: 'block', md: 'none' } }}>
        <PopupState variant="popper" popupId="demo-popup-popper">
          {(popupState) => (
            <>
              <Box sx={{ ml: 2 }}>
                <HeaderAvatar {...bindToggle(popupState)}>
                  <IconSearch stroke={1.5} size="19.2px" />
                </HeaderAvatar>
              </Box>
              <Popper
                {...bindPopper(popupState)}
                transition
                sx={{ zIndex: 1100, width: '99%', top: '-55px !important', px: { xs: 1.25, sm: 1.5 } }}
              >
                {({ TransitionProps }) => (
                  <Transitions type="zoom" {...TransitionProps} sx={{ transformOrigin: 'center left' }}>
                    <Card sx={{ bgcolor: 'background.default', border: 0, boxShadow: 'none' }}>
                      <Box sx={{ p: 2 }}>
                        <Grid container sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                          <Grid size="grow">
                            <MobileSearch
                              value={value}
                              onChange={handleChange}
                              popupState={popupState}
                              results={results}
                              onSelect={(url) => {
                                handleSelect(url);
                                popupState.close();
                              }}
                            />
                          </Grid>
                        </Grid>
                      </Box>
                    </Card>
                  </Transitions>
                )}
              </Popper>
            </>
          )}
        </PopupState>
      </Box>

      {/* Desktop */}
      <Box sx={{ display: { xs: 'none', md: 'block' }, position: 'relative' }}>
        <OutlinedInput
          id="input-search-header"
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={() => value.trim() && setOpen(true)}
          placeholder="Search"
          autoComplete="off"
          startAdornment={
            <InputAdornment position="start">
              <IconSearch stroke={1.5} size="16px" />
            </InputAdornment>
          }
          endAdornment={
            <InputAdornment position="end">
              <HeaderAvatar>
                <IconAdjustmentsHorizontal stroke={1.5} size="20px" />
              </HeaderAvatar>
            </InputAdornment>
          }
          aria-describedby="search-helper-text"
          slotProps={{ input: { 'aria-label': 'weight', sx: { bgcolor: 'transparent', pl: 0.5 } } }}
          sx={{ width: { md: 250, lg: 434 }, ml: 2, px: 2 }}
        />
        {dropdownOpen && (
          <Paper
            elevation={8}
            sx={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              left: 16,
              right: 0,
              zIndex: 1300,
              maxHeight: 400,
              overflowY: 'auto',
              borderRadius: 2
            }}
          >
            <ResultsList results={results} query={value} onSelect={handleSelect} />
          </Paper>
        )}
      </Box>
    </>
  );
}

HeaderAvatar.propTypes = { children: PropTypes.node, ref: PropTypes.any, others: PropTypes.any };

MobileSearch.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  popupState: PropTypes.any,
  results: PropTypes.array,
  onSelect: PropTypes.func
};

HighlightText.propTypes = { text: PropTypes.string, query: PropTypes.string };

ResultsList.propTypes = { results: PropTypes.array, query: PropTypes.string, onSelect: PropTypes.func };
