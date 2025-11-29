<script lang="ts">
	import Header from '$lib/Header.svelte';
	import { onMount } from 'svelte';

	// --- Types ---
	interface DealerConfig {
		nombre: string;
		razon: string;
		emp: number;
		direccion1: { linea1: string; linea2: string; linea3: string; telefono: string };
		direccion2?: { linea1: string; linea2: string; linea3: string; telefono: string };
		direccion3?: { linea1: string; linea2: string; linea3: string; telefono: string };
	}

	interface CareOption {
		Tipo: number;
		Nombre: string;
	}

	interface TemplateOption {
		name: string;
	}

	interface ContractData {
		cif: string;
		nombre: string;
		apellidos: string;
		telefono: string;
		email: string;
		direccion: string;
		codigoPostal: string;
		poblacion: string;
		provincia: string;
		matricula: string;
		modelo: string;
		chasis: string;
		fechaMatriculacion: string;
		contrato?: string;
		tipo?: number;
		importe?: number;
		formaDePago?: string;
		dia?: string;
		mes?: string;
		año?: string;
		[key: string]: any;
	}

	interface DualSourceData {
		contract: ContractData | null;
		dealer: ContractData | null;
	}

	// --- State ---
	const breadcrumbs = [{ label: 'Main', route: '/' }, { label: 'CARE' }];

	// Options
	let dealers: DealerConfig[] = [];
	let careOptions: CareOption[] = [];
	let templateOptions: TemplateOption[] = [];

	// Selections
	let selectedDealerId: number | null = null;
	let selectedCareType: number | null = null;
	let selectedTemplate: string = '';
	let cifInput: string = '';
	let vinInput: string = '';

	// Data
	let contractData: ContractData = createEmptyData();
	let dealerData: ContractData = createEmptyData();

	// Selection State (true = use contract, false = use dealer)
	const fields = [
		{ key: 'cif', label: 'CIF' },
		{ key: 'nombre', label: 'Nombre' },
		{ key: 'apellidos', label: 'Apellidos' },
		{ key: 'telefono', label: 'Teléfono' },
		{ key: 'email', label: 'Email' },
		{ key: 'direccion', label: 'Dirección' },
		{ key: 'codigoPostal', label: 'C. Postal' },
		{ key: 'poblacion', label: 'Población' },
		{ key: 'provincia', label: 'Provincia' },
		{ key: 'modelo', label: 'Modelo' },
		{ key: 'chasis', label: 'Chasis' },
		{ key: 'matricula', label: 'Matrícula' },
		{ key: 'fechaMatriculacion', label: 'F. Matriculación' },
		{ key: 'importe', label: 'Importe' },
		{ key: 'formaDePago', label: 'Forma Pago' },
		{ key: 'dia', label: 'Día' },
		{ key: 'mes', label: 'Mes' },
		{ key: 'año', label: 'Año' }
	];

	let selectedSource: Record<string, 'contract' | 'dealer'> = {};

	let loading = false;
	let error: string | null = null;
	let dataFetched = false;

	// --- Helpers ---
	function createEmptyData(): ContractData {
		return {
			cif: '',
			nombre: '',
			apellidos: '',
			telefono: '',
			email: '',
			direccion: '',
			codigoPostal: '',
			poblacion: '',
			provincia: '',
			matricula: '',
			modelo: '',
			chasis: '',
			fechaMatriculacion: '',
			contrato: '',
			tipo: 0,
			importe: 0,
			formaDePago: '',
			dia: '',
			mes: '',
			año: ''
		};
	}

	function getSelectedDealer() {
		return dealers.find((d) => d.emp === selectedDealerId);
	}

	// --- Lifecycle ---
	onMount(async () => {
		try {
			const [dealersRes, careRes] = await Promise.all([fetch('/api/dealers'), fetch('/api/care')]);

			if (dealersRes.ok) {
				dealers = await dealersRes.json();
				console.log('Dealers loaded:', dealers);
			} else {
				console.error('Failed to load dealers');
			}

			if (careRes.ok) {
				careOptions = await careRes.json();
			}

			// Initialize selection state
			fields.forEach((f) => (selectedSource[f.key] = 'contract'));
		} catch (e) {
			console.error('Error loading options', e);
			error = 'Error loading initial options.';
		}
	});

	// --- Reactivity ---
	$: if (selectedCareType) {
		loadTemplates(selectedCareType);
	} else {
		templateOptions = [];
		selectedTemplate = '';
	}

	async function loadTemplates(tipo: number) {
		try {
			const res = await fetch(`/api/templates/care/${tipo}`);
			if (res.ok) {
				templateOptions = await res.json();
			} else {
				templateOptions = [];
			}
		} catch (e) {
			console.error('Error loading templates', e);
		}
	}

	// --- Actions ---
	async function handleClientSearch() {
		if (!cifInput) {
			error = 'Please enter CIF.';
			return;
		}
		loading = true;
		error = null;

		// Reset data
		contractData = createEmptyData();

		try {
			const res = await fetch('/api/contract/search', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ cif: cifInput, mode: 'care' })
			});

			if (!res.ok) throw new Error('Search failed');

			const result: DualSourceData = await res.json();

			if (result.contract) {
				contractData = result.contract;

				// Auto-fill form if data found
				if (contractData.tipo) selectedCareType = contractData.tipo;
				if (contractData.chasis) vinInput = contractData.chasis;

				if (contractData['Emp']) {
					selectedDealerId = contractData['Emp'];
				}

				dataFetched = true;
			} else {
				error = 'No contract found in CARE. Please search in Dealer.';
			}
		} catch (e) {
			console.error(e);
			error = 'Error searching for contract data.';
		} finally {
			loading = false;
		}
	}

	async function handleDealerSearch() {
		if (!selectedDealerId || !vinInput) {
			error = 'Please select Dealer and enter VIN.';
			return;
		}
		loading = true;
		error = null;

		try {
			const res = await fetch('/api/contract/search', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					cif: cifInput,
					dealerId: selectedDealerId,
					vin: vinInput,
					mode: 'dealer'
				})
			});

			if (!res.ok) throw new Error('Dealer search failed');

			const result: DualSourceData = await res.json();

			if (result.dealer) {
				dealerData = result.dealer;
				dataFetched = true;
			} else {
				error = 'No data found in Dealer.';
			}
		} catch (e) {
			console.error(e);
			error = 'Error searching dealer data.';
		} finally {
			loading = false;
		}
	}

	async function handlePrint() {
		if (!selectedCareType || !selectedTemplate || !selectedDealerId) {
			alert('Please select Care Type, Dealer, and Template.');
			return;
		}

		const finalData: any = {};

		const dealer = getSelectedDealer();
		if (!dealer) return;

		finalData.agente = dealer.nombre;

		finalData.datosModelo = {
			direccion1: dealer.direccion1,
			direccion2: dealer.direccion2,
			direccion3: dealer.direccion3
		};

		fields.forEach((f) => {
			const key = f.key as keyof ContractData;
			const source = selectedSource[f.key];
			const val = source === 'contract' ? contractData[key] : dealerData[key];
			finalData[f.key] = val;
		});

		finalData.primeraMatriculacion = finalData.fechaMatriculacion;
		finalData.correoE = finalData.email;

		try {
			const res = await fetch(`/api/pdf/${selectedCareType}/${selectedTemplate}`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(finalData)
			});

			if (!res.ok) {
				const txt = await res.text();
				alert('Error printing: ' + txt);
				return;
			}

			const blob = await res.blob();
			const url = URL.createObjectURL(blob);
			window.open(url, '_blank');
		} catch (e) {
			console.error(e);
			alert('Error generating PDF');
		}
	}
</script>

<Header {breadcrumbs} />

<div class="p-6 max-w-7xl mx-auto">
	<!-- Row 1: Client Search -->
	<div class="flex items-end gap-4 mb-6">
		<div class="flex-1 max-w-xs">
			<label for="cif" class="label mb-1">Cliente (CIF/NIF):</label>
			<input id="cif" class="input w-full" bind:value={cifInput} placeholder="CIF..." />
		</div>
		<button class="btn btn-primary" on:click={handleClientSearch} disabled={loading}>
			{loading ? 'Buscando...' : 'Buscar Cliente'}
		</button>
	</div>

	<!-- Row 2: Dealer & VIN -->
	<div class="flex items-end gap-4 mb-6 flex-wrap">
		<div class="w-64">
			<label for="dealer" class="label mb-1">Concesionario:</label>
			<select id="dealer" class="input w-full" bind:value={selectedDealerId}>
				<option value={null}>-- Seleccione --</option>
				{#each dealers as d}
					<option value={d.emp}>{d.nombre} - {d.razon}</option>
				{/each}
			</select>
		</div>

		<div class="w-64">
			<label for="vin" class="label mb-1">VIN (Chasis):</label>
			<input id="vin" class="input w-full" bind:value={vinInput} placeholder="VIN..." />
		</div>

		<button
			class="btn btn-secondary"
			on:click={handleDealerSearch}
			disabled={loading || !selectedDealerId}
		>
			Buscar Concesionario
		</button>
	</div>

	<!-- Row 3: Care Type & Template -->
	<div class="flex items-end gap-4 mb-6 flex-wrap">
		<div class="w-48">
			<label for="tipo" class="label mb-1">Tipo Contrato:</label>
			<select id="tipo" class="input w-full" bind:value={selectedCareType}>
				<option value={null}>-- Seleccione --</option>
				{#each careOptions as opt}
					<option value={opt.Tipo}>{opt.Nombre}</option>
				{/each}
			</select>
		</div>

		<div class="w-64">
			<label for="template" class="label mb-1">Plantilla:</label>
			<select
				id="template"
				class="input w-full"
				bind:value={selectedTemplate}
				disabled={!selectedCareType}
			>
				<option value="">-- Seleccione --</option>
				{#each templateOptions as t}
					<option value={t.name}>{t.name}</option>
				{/each}
			</select>
		</div>

		<button class="btn btn-success" on:click={handlePrint} disabled={!dataFetched}>
			🖨️ Imprimir
		</button>
	</div>

	<!-- Dealer Address Display -->
	{#if selectedDealerId}
		{@const d = getSelectedDealer()}
		{#if d}
			<div class="mb-6 p-4 bg-gray-800 rounded text-sm text-gray-300">
				<p class="font-bold text-white mb-2">Dirección Concesionario:</p>
				<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
					<div>
						<span class="font-semibold">Dir 1:</span>
						{d.direccion1.linea1}, {d.direccion1.linea2}, {d.direccion1.linea3}
					</div>
					{#if d.direccion2}
						<div>
							<span class="font-semibold">Dir 2:</span>
							{d.direccion2.linea1}, {d.direccion2.linea2}, {d.direccion2.linea3}
						</div>
					{/if}
					{#if d.direccion3}
						<div>
							<span class="font-semibold">Dir 3:</span>
							{d.direccion3.linea1}, {d.direccion3.linea2}, {d.direccion3.linea3}
						</div>
					{/if}
				</div>
			</div>
		{/if}
	{/if}

	<!-- Error Message -->
	{#if error}
		<div class="p-4 mb-6 bg-red-900 text-red-100 rounded">
			{error}
		</div>
	{/if}

	<!-- Row 4+: Data Table -->
	{#if dataFetched}
		<div class="overflow-x-auto">
			<table class="w-full text-left border-collapse">
				<thead>
					<tr class="border-b border-gray-700">
						<th class="p-2 w-1/6">Campo</th>
						<th class="p-2 w-5/12 text-center bg-gray-800">Datos Contrato (CARE)</th>
						<th class="p-2 w-5/12 text-center bg-gray-900">Datos Concesionario</th>
					</tr>
				</thead>
				<tbody>
					{#each fields as field}
						<tr class="border-b border-gray-700 hover:bg-gray-800">
							<td class="p-2 font-medium">{field.label}</td>

							<!-- Contract Column -->
							<td class="p-2 relative">
								<div class="flex items-center gap-2">
									<input
										type="radio"
										name={`source-${field.key}`}
										value="contract"
										bind:group={selectedSource[field.key]}
										class="radio radio-sm radio-primary"
									/>
									<input
										class="input input-sm w-full"
										bind:value={contractData[field.key]}
										placeholder="Sin datos"
									/>
								</div>
							</td>

							<!-- Dealer Column -->
							<td class="p-2 relative">
								<div class="flex items-center gap-2">
									<input
										type="radio"
										name={`source-${field.key}`}
										value="dealer"
										bind:group={selectedSource[field.key]}
										class="radio radio-sm radio-secondary"
									/>
									<input
										class="input input-sm w-full"
										bind:value={dealerData[field.key]}
										placeholder="Sin datos"
									/>
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>
