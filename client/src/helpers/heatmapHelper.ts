import { ScanDto } from '../../../common/dtos/scan.dto';
import { COLORS } from '../constants';

export interface DayData {
	date: string;
	scanCount: number;
}

export interface HeatmapData {
	days: DayData[];
	months: DayData[][];
	maxScans: number;
}

export const prepareHeatmapData = (scans: ScanDto[], year: number): HeatmapData => {
	const groupedScans = scans.reduce<Record<string, number>>((acc, scan) => {
		const dateStr = new Date(scan.date).toISOString().split('T')[0];
		acc[dateStr] = (acc[dateStr] || 0) + 1;
		return acc;
	}, {});

	const startOfYear = new Date(year, 0, 1);
	const endOfYear = new Date(year + 1, 0, 1);

	const days: DayData[] = [];
	const currentDate = startOfYear;

	while (currentDate < endOfYear) {
		const dateStr = currentDate.toISOString().split('T')[0];
		days.push({
			date: dateStr,
			scanCount: groupedScans[dateStr] || 0
		});
		currentDate.setDate(currentDate.getDate() + 1);
	}

	const maxScans = Math.max(...days.map((day) => day.scanCount), 1);

	const months = Array.from({ length: 12 }, (_, monthIndex) =>
		days.filter((day) => new Date(day.date).getMonth() === monthIndex)
	);

	return { days, months, maxScans };
};

export const getColorClass = (scanCount: number, maxScans: number): string => {
	const percentage = (scanCount / maxScans) * 100;
	if (scanCount === 0) return COLORS.DARK_GREY;
	if (percentage <= 25) return COLORS.DARK_PURPLE;
	if (percentage <= 50) return COLORS.PURPLE;
	if (percentage <= 75) return COLORS.LIGHT_PURPLE;
	return COLORS.VERY_LIGHT_PURPLE;
};
