import prisma from '$lib/prisma';

export const fetchAssets = async () => {
	const assets = await prisma.asset.findMany({
		include: {
			asset_instruction_asset_instruction_assetToasset: {
				include: {
					instruction_asset_instruction_instructionToinstruction: {
						select: {
							title: true,
							id: true
						}
					}
				}
			},
			user_asset_created_byTouser: { select: { name: true } },
			user_asset_updated_byTouser: { select: { name: true } }
		},
		where: { deleted_at: { equals: null } }
	});

	return assets.map((e) => ({
		id: Number(e.id),
		name: e.name,
		file: e.file,
		instructions: e.asset_instruction_asset_instruction_assetToasset.map((f) => ({
			title: f.instruction_asset_instruction_instructionToinstruction.title,
			id: Number(f.instruction_asset_instruction_instructionToinstruction.id)
		})),
		created_by: e.user_asset_created_byTouser?.name || '',
		updated_by: e.user_asset_updated_byTouser?.name || ''
	}));
};
