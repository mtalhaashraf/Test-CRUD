import prisma from '$lib/prisma';

export const fetchSteps = async () => {
	const steps = await prisma.step.findMany({
		orderBy: { id: 'asc' },
		include: {
			user_step_created_byTouser: { select: { name: true } },
			user_step_updated_byTouser: { select: { name: true } },
			instruction: { select: { title: true, id: true } }
		},
		where: {
			deleted_at: {
				equals: null
			}
		}
	});
	return steps.map((e) => ({
		id: Number(e.id),
		title: e.title,
		type: e.type,
		description: e.description,
		attached_file: e.attached_file,
		step_nr: Number(e.step_nr),
		instruction: { title: e.instruction?.title || '', id: Number(e.instruction?.id || 0) },
		created_by: e.user_step_created_byTouser?.name,
		updated_by: e.user_step_updated_byTouser?.name || ''
	}));
};
