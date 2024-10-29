import prisma from '$lib/prisma';

export const fetchUsers = async () => {
	const users = await prisma.user.findMany({
		orderBy: { name: 'asc' },
		where: { deleted_at: { equals: null } }
	});
	return users.map((e) => ({ ...e, id: Number(e.id) }));
};
