import { fetchUsers } from '$lib/actions/user';
import prisma from '$lib/prisma';

export const actions = {
	create: async ({ request }) => {
		const formData = await request.formData();
		const name = formData.get('name');

		if (!name) {
			return { success: false, error: 'Name is required', data: null };
		}

		await prisma.user.create({
			data: {
				name: name?.toString() || ''
			}
		});

		const data = await fetchUsers();

		return {
			success: true,
			error: null,
			data
		};
	},
	edit: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id');
		const name = formData.get('name');

		if (!name) {
			return { success: false, error: 'Name is required', data: null };
		}

		await prisma.user.update({
			where: {
				id: Number(id)
			},
			data: {
				name: name?.toString() || '',
				updated_at: new Date(),
			}
		});

		const data = await fetchUsers();

		return {
			success: true,
			error: null,
			data
		};

	},
	delete: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id');

		await prisma.user.update({
			where: {
				id: Number(id)
			},
			data: {
				deleted_at: new Date(),
			}
		});

		const data = await fetchUsers();

		return {
			success: true,
			error: null,
			data
		};
	}
};
