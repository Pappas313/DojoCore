import PropTypes from 'prop-types';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

// material-ui
import { createTheme, ThemeProvider, StyledEngineProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { enUS as dataGridEnUS, elGR as dataGridElGR } from '@mui/x-data-grid/locales';

// project imports
import { CSS_VAR_PREFIX, DEFAULT_THEME_MODE } from 'config';
import CustomShadows from './custom-shadows';
import useConfig from 'hooks/useConfig';
import { buildPalette } from './palette';
import Typography from './typography';
import componentsOverrides from './overrides';

// ==============================|| DEFAULT THEME - MAIN ||============================== //

export default function ThemeCustomization({ children }) {
  const {
    state: { borderRadius, fontFamily, outlinedFilled, presetColor }
  } = useConfig();

  const { i18n } = useTranslation('common');
  const dataGridLocale = (i18n.resolvedLanguage ?? i18n.language) === 'gr' ? dataGridElGR : dataGridEnUS;

  const palette = useMemo(() => buildPalette(presetColor), [presetColor]);

  const themeTypography = useMemo(() => Typography(fontFamily), [fontFamily]);

  const themeOptions = useMemo(
    () => ({
      direction: 'ltr',
      mixins: {
        toolbar: {
          minHeight: '48px',
          padding: '16px',
          '@media (min-width: 600px)': {
            minHeight: '48px'
          }
        }
      },
      typography: themeTypography,
      colorSchemes: {
        light: {
          palette: palette.light,
          customShadows: CustomShadows(palette.light, 'light')
        },
        dark: {
          palette: palette.dark,
          customShadows: CustomShadows(palette.dark, 'dark')
        }
      },
      cssVariables: {
        cssVarPrefix: CSS_VAR_PREFIX,
        colorSchemeSelector: 'data-color-scheme'
      }
    }),
    [themeTypography, palette]
  );

  const themes = createTheme(themeOptions, dataGridLocale);
  themes.components = useMemo(() => componentsOverrides(themes, borderRadius, outlinedFilled), [themes, borderRadius, outlinedFilled]);

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider disableTransitionOnChange theme={themes} modeStorageKey="theme-mode" defaultMode={DEFAULT_THEME_MODE}>
        <CssBaseline enableColorScheme />
        {children}
      </ThemeProvider>
    </StyledEngineProvider>
  );
}

ThemeCustomization.propTypes = { children: PropTypes.node };
