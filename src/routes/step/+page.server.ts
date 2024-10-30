import { fetchInstructions } from '$lib/actions/instruction';
import { fetchSteps } from '$lib/actions/step';
import prisma from '$lib/prisma';
import { saveImage } from '$lib/s3-client.js';

export const load = async () => {
	const steps = await fetchSteps();
	const instructions = await fetchInstructions();
console.log('Steps >> ',steps)
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

		if (!['text', 'pdf', 'image', 'video'].includes(type.toString())) {
			return { success: false, error: 'Invalid type', data: null };
		}

		if (type.toString() !== 'text' && !attached_file) {
			return { success: false, error: 'Attached file is required', data: null };
		}

		const newStep = await prisma.step.create({
			data: {
				title: title.toString(),
				type: type.toString() as any,
				description: description?.toString() || null,
				step_nr: Number(step_nr),
				instruction_id: Number(instruction) || null,
				created_by: Number(user_id),
				created_at: new Date()
			}
		});

		if (type.toString() !== 'text') {

			const filename = `${newStep.title.toLocaleLowerCase().replaceAll(' ', '_')}_${newStep.id}.${attached_file?.name.split('.').pop()}`;
			const respFile = await saveImage(
				`steps/${filename}`,
				'crud',
				Buffer.from(await attached_file!.arrayBuffer(), 'utf-8'),
				attached_file!.type
			);
	
			if (respFile.error) {
				await prisma.step.delete({ where: { id: newStep.id } });
				return {
					success: false,
					error: 'Issue saving file to S3. Please try again',
					data: null
				};
			}
	
			if (respFile.success) {
				await prisma.step.update({
					where: {
						id: newStep.id
					},
					data: {
						attached_file: filename
					}
				});
			}
		}
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

		// if (type.toString() !== 'text' && !attached_file) {
		// 	return { success: false, error: 'Attached file is required', data: null };
		// }

		if (!['text', 'pdf', 'image', 'video'].includes(type.toString())) {
			return { success: false, error: 'Invalid type', data: null };
		}

		const editedStep = await prisma.step.update({
			where: {
				id: Number(id)
			},
			data: {
				title: title.toString(),
				type: type.toString() as any,
				description: description?.toString() || null,
				step_nr: Number(step_nr),
				instruction_id: Number(instruction) || null,
				updated_by: Number(user_id),
				updated_at: new Date()
			}
		});

		if (attached_file && type.toString() !== 'text') {
			const filename = `${editedStep.title
				.toString()
				.toLocaleLowerCase()
				.replaceAll(' ', '_')}_${editedStep.id}.${attached_file.name.split('.').pop()}`;
			const respFile = await saveImage(
				`steps/${filename}`,
				'crud',
				Buffer.from(await attached_file.arrayBuffer(), 'utf-8'),
				attached_file.type
			);

			if (respFile.error) {
				const data = fetchSteps()
				return {
					success: true,
					error: 'Issue saving file to S3. Please try again',
					data
				};
			}

			if (respFile.success) {
				await prisma.step.update({
					where: {
						id: editedStep.id
					},
					data: {
						attached_file: filename
					}
				});
			}
		} else {
			await prisma.step.update({
				where: {
					id: editedStep.id
				},
				data: {
					attached_file: null
				}
			});
		}

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
