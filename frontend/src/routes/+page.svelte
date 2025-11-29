<script lang="ts">
	import { goto } from '$app/navigation';
	import Header from '$lib/Header.svelte';

	let selectedDoc: string = '';

	const docTypes = [
		{ label: 'CARE', route: '/care' },
		{ label: 'Relax', route: '/relax' }
	];

	function continueToDoc() {
		if (!selectedDoc) return;
		const doc = docTypes.find((d) => d.label === selectedDoc);
		if (doc) goto(doc.route);
	}

	const breadcrumbs = [{ label: 'Main' }];
</script>

<Header {breadcrumbs} />

<div class="p-8 flex flex-col items-center gap-6">
	<div class="w-72">
		<label for="docType" class="label mb-2">Select Document Type:</label>
		<select id="docType" class="select w-full" bind:value={selectedDoc}>
			<option disabled selected value="">-- Select one --</option>
			{#each docTypes as doc}
				<option value={doc.label}>{doc.label}</option>
			{/each}
		</select>
	</div>

	<button class="btn btn-primary w-40" on:click={continueToDoc}> Continue </button>
</div>
