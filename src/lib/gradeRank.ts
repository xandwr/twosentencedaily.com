const GRADE_ORDER = ['A+','A','A-','B+','B','B-','C+','C','C-','D+','D','D-','F'];

export function gradeRank(grade: string | null): number {
	if (!grade) return GRADE_ORDER.length;
	const i = GRADE_ORDER.indexOf(grade);
	return i === -1 ? GRADE_ORDER.length : i;
}

const GRADE_COLORS: Record<string, { text: string; border: string }> = {
	A: { text: 'text-emerald-500', border: 'border-emerald-200' },
	B: { text: 'text-sky-500', border: 'border-sky-200' },
	C: { text: 'text-amber-500', border: 'border-amber-200' },
	D: { text: 'text-orange-500', border: 'border-orange-200' },
	F: { text: 'text-red-500', border: 'border-red-200' },
};

function gradeColors(grade: string | null) {
	if (!grade) return { text: 'text-gray-400', border: 'border-gray-100' };
	return GRADE_COLORS[grade[0]] ?? { text: 'text-red-500', border: 'border-red-200' };
}

export function gradeColor(grade: string | null): string {
	return gradeColors(grade).text;
}

export function gradeBorder(grade: string | null): string {
	return gradeColors(grade).border;
}
