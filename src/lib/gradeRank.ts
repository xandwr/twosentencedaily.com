const GRADE_ORDER = ['A+','A','A-','B+','B','B-','C+','C','C-','D+','D','D-','F'];

export function gradeRank(grade: string | null): number {
	if (!grade) return GRADE_ORDER.length;
	const i = GRADE_ORDER.indexOf(grade);
	return i === -1 ? GRADE_ORDER.length : i;
}

export function gradeColor(grade: string | null): string {
	if (!grade) return 'text-gray-400';
	const letter = grade[0];
	if (letter === 'A') return 'text-emerald-500';
	if (letter === 'B') return 'text-sky-500';
	if (letter === 'C') return 'text-amber-500';
	if (letter === 'D') return 'text-orange-500';
	return 'text-red-500'; // F
}
