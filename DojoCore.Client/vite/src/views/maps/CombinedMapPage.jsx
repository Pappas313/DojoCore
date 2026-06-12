import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

// api
import { getAllMapPins } from 'api/map';

// project imports
import MapView from './MapView';

// ── Legend config ─────────────────────────────────────────────────────────────

const LEGEND = [
  { color: '#1976d2', label: 'Athletes' },
  { color: '#f9a825', label: 'Coaches' },
  { color: '#d32f2f', label: 'Managers' },
  { color: '#388e3c', label: 'Gyms' }
];

// ── Page ──────────────────────────────────────────────────────────────────────

export default function CombinedMapPage() {
  const { t } = useTranslation('common');
  const [pins, setPins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getAllMapPins()
      .then((data) => {
        if (!cancelled) {
          const all = [
            ...(data?.athletes ?? []),
            ...(data?.coaches ?? []),
            ...(data?.managers ?? []),
            ...(data?.gyms ?? [])
          ];
          setPins(all);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  return (
    <MapView
      title={t('Combined Map', 'Combined Map')}
      pins={pins}
      loading={loading}
      error={error}
      legend={LEGEND}
    />
  );
}
