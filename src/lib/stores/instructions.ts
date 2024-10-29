import { writable } from 'svelte/store';
import type { Instruction } from '$lib/interfaces';

const instructions = writable<Instruction[]>([]);

export { instructions };
