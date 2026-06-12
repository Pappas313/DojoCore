import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

// api
import { getCoachMapPins } from 'api/map';

// project imports
import MapView from './MapView';

const LEGEND = [{ color: '#f9a825', label: 'Coaches' }];

export default function CoachesMapPage() {
  const { t } = useTranslation('common');
  const [pins, setPins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getCoachMapPins()
      .then((data) => { if (!cancelled) setPins(data ?? []); })
      .catch((err) => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, []);

  return (
    <MapView
      title={t('Coaches Map', 'Coaches Map')}
      pins={pins}
      loading={loading}
      error={error}
      legend={LEGEND}
    />
  );
}
