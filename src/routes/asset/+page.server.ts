import { fetchAssets } from '$lib/actions/asset';
import { fetchInstructions } from '$lib/actions/instruction.js';
import prisma from '$lib/prisma';
import { saveImage } from '$lib/s3-client.js';

export const load = async () => {
	const assets = await fetchAssets();
	const instructions = await fetchInstructions();
	return {
		assets,
		instructions
	};
};

export const actions = {
	create: async ({ request }) => {
		const formData = await request.formData();
		const name = formData.get('name');
		const user_id = formData.get('user_id');
		const file = formData.get('file');
		const instructions = formData.getAll('instructions');

		if (!name || !user_id || !file) {
			return { success: false, error: 'Missing required fields', data: null };
		}

		const newAsset = await prisma.asset.create({
			data: {
				name: name?.toString() || '',
				created_by: Number(user_id),
				created_at: new Date(),
				asset_instruction_asset_instruction_assetToasset: {
					create: instructions.map((instruction_id) => ({
						instruction_asset_instruction_instructionToinstruction: {
							connect: {
								id: Number(instruction_id)
							}
						}
					}))
				}
			}
		});

		const filename = `${newAsset.name.toLocaleLowerCase().replaceAll(' ', '_')}_${newAsset.id}.${file!.name.split('.').pop()}`;
		const respFile = await saveImage(
			`assets/${filename}`,
			'crud',
			Buffer.from(await file!.arrayBuffer(), 'utf-8'),
			file!.type
		);

		if (respFile.error) {
			await prisma.asset.delete({ where: { id: newAsset.id } });
			return {
				success: false,
				error: 'Issue uploading file to storage,',
				data: null
			};
		}

		if (respFile.success) {
			await prisma.asset.update({
				where: {
					id: newAsset.id
				},
				data: {
					file: filename
				}
			});
		}
		const data = await fetchAssets();

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
		const user_id = formData.get('user_id');
		const file = formData.get('file');
		const instructions = formData.getAll('instructions');
		const prev_instructions = formData.getAll('prev_instructions');

		if (!name || !user_id || !id) {
			return { success: false, error: 'Missing required fields', data: null };
		}

		const removeLinks = prev_instructions.filter((item) => !instructions.includes(item));
		const addLinks = instructions.filter((item) => !prev_instructions.includes(item));

		const editedAsset = await prisma.asset.update({
			where: {
				id: Number(id)
			},
			data: {
				name: name?.toString() || '',
				updated_at: new Date(),
				updated_by: Number(user_id),
				asset_instruction_asset_instruction_assetToasset: {
					create: addLinks.map((instruction_id) => ({
						instruction_asset_instruction_instructionToinstruction: {
							connect: {
								id: Number(instruction_id)
							}
						}
					}))
				}
			}
		});

		await prisma.asset_instruction.deleteMany({
			where: {
				asset: Number(id),
				instruction: {
					in: removeLinks.map(Number)
				}
			}
		});

		if (file) {
			const filename = `${editedAsset.name.toString().toLocaleLowerCase().replaceAll(' ', '_')}_${editedAsset.id}.${file.name.split('.').pop()}`;
			const respFile = await saveImage(
				`assets/${filename}`,
				'crud',
				Buffer.from(await file!.arrayBuffer(), 'utf-8'),
				file!.type
			);

			if (respFile.error) {
				const data = await fetchAssets();

				return {
					success: true,
					error: 'Issue uploading file to storage,',
					data
				};
			}

			if (respFile.success) {
				await prisma.asset.update({
					where: {
						id: editedAsset.id
					},
					data: {
						file: filename
					}
				});
			}
		}

		const data = await fetchAssets();

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

		const resp = await prisma.asset.update({
			where: {
				id: Number(id)
			},
			data: {
				deleted_at: new Date(),
				deleted_by: Number(user_id)
			}
		});

		console.log(resp)

		const data = await fetchAssets();

		return {
			success: true,
			error: null,
			data
		};
	}
};
