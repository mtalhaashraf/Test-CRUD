import { writable } from 'svelte/store';
import type { User } from '$lib/interfaces';

const users = writable<User[]>([]);
const loggedInUser = writable<User | null>(null);

export { users, loggedInUser };