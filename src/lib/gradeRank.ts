const GRADE_ORDER = ['A+','A','A-','B+','B','B-','C+','C','C-','D+','D','D-','F'];

export function gradeRank(grade: string | null): number {
	if (!grade) return GRADE_ORDER.length;
	const i = GRADE_ORDER.indexOf(grade);
	return i === -1 ? GRADE_ORDER.length : i;
}
