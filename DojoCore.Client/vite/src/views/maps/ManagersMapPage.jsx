import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

// api
import { getManagerMapPins } from 'api/map';

// project imports
import MapView from './MapView';

const LEGEND = [{ color: '#d32f2f', label: 'Managers' }];

export default function ManagersMapPage() {
  const { t } = useTranslation('common');
  const [pins, setPins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getManagerMapPins()
      .then((data) => { if (!cancelled) setPins(data ?? []); })
      .catch((err) => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, []);

  return (
    <MapView
      title={t('Managers Map', 'Managers Map')}
      pins={pins}
      loading={loading}
      error={error}
      legend={LEGEND}
    />
  );
}
