import prisma from '$lib/prisma';

export const fetchInstructions = async () => {
	const instructions = await prisma.instruction.findMany({
		include: {
			asset_instruction_asset_instruction_instructionToinstruction: {
				include: {
					asset_asset_instruction_assetToasset: {
						select: {
							name: true,
							id: true
						}
					}
				}
			},
			user_instruction_created_byTouser: {
				select: { name: true }
			},
			user_instruction_updated_byTouser: {
				select: { name: true }
			}
		},
		where: {
			deleted_at: {
				equals: null
			}
		}
	});

	return instructions.map((e) => ({
		id: Number(e.id),
		title: e.title,
		description: e.description,
		preview: e.preview,
		duration: Number(e.duration),
		assets: e.asset_instruction_asset_instruction_instructionToinstruction.map((f) => ({
			name: f.asset_asset_instruction_assetToasset.name,
			id: Number(f.asset_asset_instruction_assetToasset.id)
		})),
		created_by: e.user_instruction_created_byTouser?.name || '',
		updated_by: e.user_instruction_updated_byTouser?.name || ''
	}));
};
