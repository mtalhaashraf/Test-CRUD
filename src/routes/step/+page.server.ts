import { fetchInstructions } from '$lib/actions/instruction';
import { fetchSteps } from '$lib/actions/step';
import prisma from '$lib/prisma';

export const load = async () => {
	const steps = await fetchSteps();
	const instructions = await fetchInstructions();

	return {
		steps,
		instructions
	};
};

export const actions = {
	create: async ({ request }) => {
		const formData = await request.formData();
		const title = formData.get('title');
		const type = formData.get('type');
		const description = formData.get('description');
		const attached_file = formData.get('file');
		const step_nr = formData.get('step_nr');
		const instruction = formData.get('instruction');
		const user_id = formData.get('user_id');

		if (!title || !type || !step_nr || !user_id) {
			return { success: false, error: 'Missing required fields', data: null };
		}

		if (type.toString() !== 'text' && !attached_file) {
			return { success: false, error: 'Attached file is required', data: null };
		}

		if (!['text', 'pdf', 'image', 'video'].includes(type.toString())) {
			return { success: false, error: 'Invalid type', data: null };
		}

		await prisma.step.create({
			data: {
				title: title.toString(),
				type: type.toString() as any,
				description: description?.toString() || null,
				attached_file: attached_file?.toString() || null,
				step_nr: Number(step_nr),
				instruction_id: Number(instruction) || null,
				created_by: Number(user_id),
				created_at: new Date()
			}
		});

		const data = await fetchSteps();

		return {
			success: true,
			error: null,
			data
		};
	},
	edit: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id');
		const title = formData.get('title');
		const type = formData.get('type');
		const description = formData.get('description');
		const attached_file = formData.get('file');
		const step_nr = formData.get('step_nr');
		const instruction = formData.get('instruction');
		const user_id = formData.get('user_id');

		if (!title || !type || !step_nr || !user_id || !id) {
			return { success: false, error: 'Missing required fields', data: null };
		}

		if (type.toString() !== 'text' && !attached_file) {
			return { success: false, error: 'Attached file is required', data: null };
		}

		if (!['text', 'pdf', 'image', 'video'].includes(type.toString())) {
			return { success: false, error: 'Invalid type', data: null };
		}

		await prisma.step.update({
			where: {
				id: Number(id)
			},
			data: {
				title: title.toString(),
				type: type.toString() as any,
				description: description?.toString() || null,
				attached_file: type.toString() === 'text' ? null : attached_file?.toString() || null,
				step_nr: Number(step_nr),
				instruction_id: Number(instruction) || null,
				updated_by: Number(user_id),
				updated_at: new Date()
			}
		});

		const data = await fetchSteps();

		return {
			success: true,
			error: null,
			data
		};
	},
	delete: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id');
		const user_id = formData.get('user_id');

		if (!id || !user_id) {
			return { success: false, error: 'Missing required fields', data: null };
		}

		await prisma.step.update({
			where: {
				id: Number(id)
			},
			data: {
				deleted_at: new Date(),
				deleted_by: Number(user_id)
			}
		});

		const data = await fetchSteps();

		return {
			success: true,
			error: null,
			data
		};
	}
};
