import { useState } from 'react';
import { useTranslation } from 'react-i18next';

// material-ui
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';

// leaflet
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

// project imports
import MainCard from 'ui-component/cards/MainCard';

// ── Tile layer definitions (no API key required) ──────────────────────────────

// CartoDB labels-only overlay — free, no API key, shows roads / cities / countries
const CARTO_LABELS = {
  url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png',
  attribution: '&copy; <a href="https://carto.com/attributions">CARTO</a>'
};

const ESRI_SATELLITE = {
  url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  attribution:
    'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
};

const TILE_LAYERS = {
  street: {
    label: 'Street',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    // OpenStreetMap already includes roads, cities, countries, POIs — no overlay needed
  },
  satellite: {
    label: 'Satellite',
    ...ESRI_SATELLITE,
    overlay: CARTO_LABELS   // adds road names, city & country labels over imagery
  },
  hybrid: {
    label: 'Hybrid',
    ...ESRI_SATELLITE,
    overlay: {
      // Full CartoDB Voyager style (roads drawn + labels) layered over satellite
      url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png',
      attribution: '&copy; <a href="https://carto.com/attributions">CARTO</a>',
      // second overlay for the labels on top
      labelsUrl: CARTO_LABELS.url,
      labelsAttribution: CARTO_LABELS.attribution
    }
  }
};



const PIN_COLORS = {
  Athlete: '#1976d2',  // blue
  Coach:   '#f9a825',  // yellow
  Manager: '#d32f2f',  // red
  Gym:     '#388e3c'   // green (fallback)
};

// Build a custom SVG DivIcon for a given colour
function makePinIcon(color) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="24" height="36">
      <path d="M12 0C5.373 0 0 5.373 0 12c0 9 12 24 12 24s12-15 12-24C24 5.373 18.627 0 12 0z"
            fill="${color}" stroke="#fff" stroke-width="1.5"/>
      <circle cx="12" cy="12" r="5" fill="#fff" opacity="0.9"/>
    </svg>`.trim();

  return L.divIcon({
    html: svg,
    className: '',
    iconSize: [24, 36],
    iconAnchor: [12, 36],
    popupAnchor: [0, -36]
  });
}

const ICON_CACHE = {};
function getIcon(type) {
  if (!ICON_CACHE[type]) {
    ICON_CACHE[type] = makePinIcon(PIN_COLORS[type] || '#555');
  }
  return ICON_CACHE[type];
}

// ── Legend item ───────────────────────────────────────────────────────────────

function LegendDot({ color, label }) {
  return (
    <Stack direction="row" alignItems="center" spacing={0.75}>
      <Box sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: color, border: '1.5px solid #fff', boxShadow: 1 }} />
      <Typography variant="caption">{label}</Typography>
    </Stack>
  );
}

// ── Layer switcher (overlaid on the map) ──────────────────────────────────────

function LayerSwitcher({ value, onChange }) {
  return (
    <Box
      sx={{
        position: 'absolute',
        bottom: 24,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000
      }}
    >
      <ToggleButtonGroup
        value={value}
        exclusive
        onChange={(_, v) => { if (v) onChange(v); }}
        size="small"
        sx={{
          bgcolor: 'background.paper',
          boxShadow: 2,
          borderRadius: 1,
          '& .MuiToggleButton-root': { px: 2, py: 0.5, textTransform: 'none', fontSize: '0.75rem' }
        }}
      >
        {Object.entries(TILE_LAYERS).map(([key, layer]) => (
          <ToggleButton key={key} value={key}>
            {layer.label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </Box>
  );
}

// ── MapView ───────────────────────────────────────────────────────────────────

/**
 * @param {Object}  props
 * @param {string}  props.title       - Card title
 * @param {Array}   props.pins        - Array of MapPinDto: { id, name, type, latitude, longitude }
 * @param {boolean} props.loading
 * @param {string|null} props.error
 * @param {Array}   [props.legend]    - [{ color, label }] shown in top-right legend
 */
export default function MapView({ title, pins, loading, error, legend }) {
  const { t } = useTranslation('common');
  const [layerKey, setLayerKey] = useState('street');

  const validPins = Array.isArray(pins)
    ? pins.filter((p) => p.latitude != null && p.longitude != null)
    : [];

  const activeLayer = TILE_LAYERS[layerKey];

  return (
    <MainCard title={title}>
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      )}

      {!loading && error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {!loading && !error && (
        <Box sx={{ position: 'relative', height: 560, borderRadius: 2, overflow: 'hidden' }}>
          {/* Legend */}
          {legend && legend.length > 0 && (
            <Box
              sx={{
                position: 'absolute',
                top: 10,
                right: 10,
                zIndex: 1000,
                bgcolor: 'background.paper',
                borderRadius: 1,
                px: 1.5,
                py: 1,
                boxShadow: 2
              }}
            >
              <Stack spacing={0.5}>
                {legend.map((item) => (
                  <LegendDot key={item.label} color={item.color} label={t(item.label, item.label)} />
                ))}
              </Stack>
            </Box>
          )}

          <MapContainer
            center={[20, 0]}
            zoom={2}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom
          >
            {/* Base layer */}
            <TileLayer
              key={layerKey}
              attribution={activeLayer.attribution}
              url={activeLayer.url}
            />
            {/* Roads / cities / countries overlay (Satellite & Hybrid) */}
            {activeLayer.overlay && (
              <TileLayer
                key={`${layerKey}-overlay`}
                attribution={activeLayer.overlay.attribution}
                url={activeLayer.overlay.url}
                opacity={0.85}
              />
            )}
            {/* Extra labels layer for Hybrid */}
            {activeLayer.overlay?.labelsUrl && (
              <TileLayer
                key={`${layerKey}-labels`}
                attribution={activeLayer.overlay.labelsAttribution}
                url={activeLayer.overlay.labelsUrl}
              />
            )}
            {validPins.map((pin) => (
              <Marker
                key={pin.id}
                position={[pin.latitude, pin.longitude]}
                icon={getIcon(pin.type)}
              >
                <Popup>
                  <strong>{pin.name}</strong>
                  <br />
                  <span style={{ fontSize: '0.8em', color: '#666' }}>{pin.type}</span>
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          <LayerSwitcher value={layerKey} onChange={setLayerKey} />
        </Box>
      )}

      {!loading && !error && validPins.length === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
          {t('No locations available', 'No locations available')}
        </Typography>
      )}
    </MainCard>
  );
}
