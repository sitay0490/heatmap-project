import { Box, Tooltip, Grid } from '@mui/material';
import { ScanDto } from '../../../common/dtos/scan.dto';
import { prepareHeatmapData, getColorClass } from '../helpers/heatmapHelper';

interface HeatmapProps {
	scans: ScanDto[];
	year: number;
}

export const Heatmap = ({ scans, year }: HeatmapProps) => {
	const { months, maxScans } = prepareHeatmapData(scans, year);

	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
			{months.map((monthDays, monthIndex) => (
				<Grid container spacing={0.5} key={monthIndex}>
					{monthDays.map((day) => (
						<Grid item key={day.date}>
							<Tooltip
								title={`${new Date(day.date).toDateString()} - ${day.scanCount} scans`}
								arrow
								placement="top"
							>
								<Box
									sx={{
										width: 20,
										height: 20,
										borderRadius: 1,
										backgroundColor: getColorClass(day.scanCount, maxScans),
										cursor: 'pointer'
									}}
								/>
							</Tooltip>
						</Grid>
					))}
				</Grid>
			))}
		</Box>
	);
};
