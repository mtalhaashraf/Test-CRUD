import { writable } from 'svelte/store';
import type { Step } from '$lib/interfaces';

const steps = writable<Step[]>([]);

export { steps };
