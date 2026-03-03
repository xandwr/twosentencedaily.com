/** Render LLM feedback markdown (bold, italic) to safe HTML. */
export function renderFeedback(text: string): string {
	// Escape HTML first
	const escaped = text
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');

	// **bold** then *italic* (order matters — bold first so ** doesn't get caught by *)
	return escaped
		.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
		.replace(/\*(.+?)\*/g, '<em>$1</em>');
}
