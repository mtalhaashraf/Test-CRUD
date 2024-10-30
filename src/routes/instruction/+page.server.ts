import { fetchAssets } from '$lib/actions/asset';
import { fetchInstructions } from '$lib/actions/instruction';
import prisma from '$lib/prisma';
import { saveImage } from '$lib/s3-client';

export const load = async () => {
	const assets = await fetchAssets();
	const instructions = await fetchInstructions();

	return {
		instructions,
		assets
	};
};

export const actions = {
	create: async ({ request }) => {
		const formData = await request.formData();
		const title = formData.get('title');
		const description = formData.get('description');
		const preview = formData.get('file');
		const duration = formData.get('duration');
		const assets = formData.getAll('assets');
		const user_id = formData.get('user_id');

		if (!title || !description || !preview || !duration || !assets || !user_id) {
			return { success: false, error: 'Missing required fields', data: null };
		}

		const duration_num = Number(duration);
		if (isNaN(duration_num)) {
			return { success: false, error: 'Duration must be a number', data: null };
		}

		if (duration_num < 1) {
			return { success: false, error: 'Duration must be greater than 0', data: null };
		}

		const newInstruction = await prisma.instruction.create({
			data: {
				title: title.toString(),
				description: description.toString(),
				duration: duration_num,
				created_by: Number(user_id),
				created_at: new Date(),
				asset_instruction_asset_instruction_instructionToinstruction: {
					create: assets.map((assetId) => ({
						asset_asset_instruction_assetToasset: { connect: { id: Number(assetId) } } // Connect each asset by its ID
					}))
				}
			}
		});

		const filename = `${newInstruction.title.toLocaleLowerCase().replaceAll(' ', '_')}_${newInstruction.id}.${preview!.name.split('.').pop()}`;
		const respFile = await saveImage(
			`instructions/${filename}`,
			'crud',
			Buffer.from(await preview!.arrayBuffer(), 'utf-8'),
			preview!.type
		);

		if (respFile.error) {
			await prisma.instruction.delete({ where: { id: newInstruction.id } });
			return {
				success: false,
				error: 'Issue uploading file to storage,',
				data: null
			};
		}

		if (respFile.success) {
			await prisma.instruction.update({
				where: {
					id: newInstruction.id
				},
				data: {
					preview: filename
				}
			});
		}

		const data = await fetchInstructions();

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
		const description = formData.get('description');
		const preview = formData.get('file');
		const duration = formData.get('duration');
		const prev_assets = formData.getAll('prev_assets');
		const assets = formData.getAll('assets');
		const user_id = formData.get('user_id');

		if (!title || !description || !duration || !assets || !user_id) {
			return { success: false, error: 'Missing required fields', data: null };
		}

		const duration_num = Number(duration);
		if (isNaN(duration_num)) {
			return { success: false, error: 'Duration must be a number', data: null };
		}

		if (duration_num < 1) {
			return { success: false, error: 'Duration must be greater than 0', data: null };
		}

		const removeLinks = prev_assets.filter((item) => !assets.includes(item));
		const addLinks = assets.filter((item) => !prev_assets.includes(item));

		const editedInstruction = await prisma.instruction.update({
			where: {
				id: Number(id)
			},
			data: {
				title: title.toString(),
				description: description.toString(),
				duration: duration_num,
				updated_by: Number(user_id),
				updated_at: new Date(),
				asset_instruction_asset_instruction_instructionToinstruction: {
					create: addLinks.map((assetId) => ({
						asset_asset_instruction_assetToasset: { connect: { id: Number(assetId) } } // Connect each asset by its ID
					}))
				}
			}
		});

		await prisma.asset_instruction.deleteMany({
			where: {
				instruction: Number(id),
				asset: {
					in: removeLinks.map(Number) // Convert elements in removeLinks to numbers if necessary
				}
			}
		});

		if (preview) {
			const filename = `${editedInstruction.title
				.toLocaleLowerCase()
				.replaceAll(' ', '_')}_${editedInstruction.id}.${preview.name.split('.').pop()}`;
			const respFile = await saveImage(
				`instructions/${filename}`,
				'crud',
				Buffer.from(await preview.arrayBuffer(), 'utf-8'),
				preview.type
			);

			if (respFile.error) {
				const data = await fetchInstructions();

				return {
					success: true,
					error: 'Issue uploading file to storage,',
					data
				};
			}

			if (respFile.success) {
				await prisma.instruction.update({
					where: {
						id: editedInstruction.id
					},
					data: {
						preview: filename
					}
				});
			}
		}

		const data = await fetchInstructions();

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

		await prisma.instruction.update({
			where: {
				id: Number(id)
			},
			data: {
				deleted_at: new Date(),
				deleted_by: Number(user_id)
			}
		});

		const data = await fetchInstructions();

		return {
			success: true,
			error: null,
			data
		};
	}
};
