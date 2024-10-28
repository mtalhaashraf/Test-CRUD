import { fetchAssets, fetchInstructions, fetchSteps, fetchUsers } from '$lib/utils';

export const load = async () => {
	const users = await fetchUsers();
	const steps = await fetchSteps();
	const assets = await fetchAssets();
	const instructions = await fetchInstructions();

	return {
		users: users.map((e) => ({ ...e, id: Number(e.id) })),
		steps,
		assets,
		instructions
	};
};
