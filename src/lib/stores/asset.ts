import { writable } from "svelte/store";
import type { Asset } from "$lib/interfaces";

const assets = writable<Asset[]>([]);

export { assets };