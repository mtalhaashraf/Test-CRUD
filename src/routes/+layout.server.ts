import { fetchUsers } from "$lib/actions/user";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async () => {
	const users_data = await fetchUsers();

	return { users_data };
};