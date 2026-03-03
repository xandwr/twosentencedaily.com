<script lang="ts">
	let {
		id,
		label,
		placeholder,
		value = $bindable(""),
		onsubmit = () => {},
	}: {
		id: string;
		label: string;
		placeholder: string;
		value: string;
		onsubmit?: () => void;
	} = $props();

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
			e.preventDefault();
			onsubmit();
		}
	}
</script>

<div>
	<label for={id} class="block text-xs font-medium text-gray-500 mb-1">
		{label}
	</label>
	<textarea
		{id}
		class="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm resize-none focus:outline-none focus:border-gray-400 transition-colors"
		rows={2}
		maxlength={150}
		{placeholder}
		bind:value
		onkeydown={handleKeydown}
	></textarea>
	<p class="text-right text-[11px] text-gray-300 mt-0.5">
		{value.length}/150
	</p>
</div>
