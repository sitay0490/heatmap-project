import { useCallback, useEffect, useState, useMemo } from 'react';
import './styles.css';
import { Heatmap } from './components/Heatmap';
import { YearPicker } from './components/YearPicker';
import { CloudProviderSelect } from './components/CloudProviderSelect';
import { ErrorMessage } from './components/ErrorMessage';
import { api } from './services/api';
import { CloudProviderDto } from '../../common/dtos/cloud-provider.dto';
import { ScanDto } from '../../common/dtos/scan.dto';
import { ApiError } from './types/api';
import { CircularProgress } from '@mui/material';

export default function App() {
	const [year, setYear] = useState(new Date().getFullYear());
	const [cloudProviders, setCloudProviders] = useState<CloudProviderDto[]>([]);
	const [selectedProviders, setSelectedProviders] = useState<string[]>([]);
	const [scans, setScans] = useState<ScanDto[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<ApiError>();

	const fetchCloudProviders = useCallback(async () => {
		try {
			const response = await api.getCloudProviders();
			if (response.error) {
				setError(response.error);
			} else if (response.data) {
				setCloudProviders(response.data);
			}
		} catch (err) {
			setError({ message: 'Failed to fetch cloud providers' });
		}
	}, []);

	const fetchScans = useCallback(async (year: number, selectedProviders: string[]) => {
		try {
			setLoading(true);
			const startDate = new Date(year, 0, 1).toISOString();
			const endDate = new Date(year + 1, 0, 1).toISOString();

			const response = await api.getScans({
				startDate,
				endDate,
				cloudProvidersIds: selectedProviders.length ? selectedProviders : undefined
			});

			if (response.error) {
				setError(response.error);
			} else if (response.data) {
				setScans(response.data);
			}
		} catch (err) {
			setError({ message: 'Failed to fetch scans' });
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchCloudProviders();
	}, [fetchCloudProviders]);

	useEffect(() => {
		fetchScans(year, selectedProviders);
	}, [year, selectedProviders, fetchScans]);

	const cloudProviderOptions = useMemo(
		() =>
			cloudProviders.map((provider) => ({
				displayName: provider.displayName,
				value: provider.id
			})),
		[cloudProviders]
	);

	const memoizedScans = useMemo(() => scans, [scans]);

	return (
		<div className="app">
			<ErrorMessage error={error} onClose={() => setError(undefined)} />
			<div className="filters">
				<YearPicker value={year} onChange={setYear} disableFuture />
				<CloudProviderSelect
					options={cloudProviderOptions}
					onChange={setSelectedProviders}
					selectedOptions={selectedProviders}
				/>
			</div>
			{loading ? <CircularProgress /> : <Heatmap scans={memoizedScans} year={year} />}
		</div>
	);
}
