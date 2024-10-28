import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { cubicOut } from 'svelte/easing';
import type { TransitionConfig } from 'svelte/transition';
import prisma from './prisma';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

type FlyAndScaleParams = {
	y?: number;
	x?: number;
	start?: number;
	duration?: number;
};

export const flyAndScale = (
	node: Element,
	params: FlyAndScaleParams = { y: -8, x: 0, start: 0.95, duration: 150 }
): TransitionConfig => {
	const style = getComputedStyle(node);
	const transform = style.transform === 'none' ? '' : style.transform;

	const scaleConversion = (valueA: number, scaleA: [number, number], scaleB: [number, number]) => {
		const [minA, maxA] = scaleA;
		const [minB, maxB] = scaleB;

		const percentage = (valueA - minA) / (maxA - minA);
		const valueB = percentage * (maxB - minB) + minB;

		return valueB;
	};

	const styleToString = (style: Record<string, number | string | undefined>): string => {
		return Object.keys(style).reduce((str, key) => {
			if (style[key] === undefined) return str;
			return str + `${key}:${style[key]};`;
		}, '');
	};

	return {
		duration: params.duration ?? 200,
		delay: 0,
		css: (t) => {
			const y = scaleConversion(t, [0, 1], [params.y ?? 5, 0]);
			const x = scaleConversion(t, [0, 1], [params.x ?? 0, 0]);
			const scale = scaleConversion(t, [0, 1], [params.start ?? 0.95, 1]);

			return styleToString({
				transform: `${transform} translate3d(${x}px, ${y}px, 0) scale(${scale})`,
				opacity: t
			});
		},
		easing: cubicOut
	};
};

export const fetchUsers = async () => {
	const users = await prisma.user.findMany({ orderBy: { name: 'asc' } });
	return users;
};

export const fetchSteps = async () => {
	const steps = await prisma.step.findMany({
		orderBy: { id: 'asc' },
		include: {
			user_step_created_byTouser: { select: { name: true } },
			user_step_updated_byTouser: { select: { name: true } },
			instruction: { select: { title: true } }
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
		instruction: e.instruction?.title || '',
		created_by: e.user_step_created_byTouser?.name,
		updated_by: e.user_step_updated_byTouser?.name || ''
	}));
};

export const fetchAssets = async () => {
	const assets = await prisma.asset.findMany({
		include: {
			asset_instruction_asset_instruction_assetToasset: {
				include: {
					instruction_asset_instruction_instructionToinstruction: {
						select: {
							title: true
						}
					}
				}
			},
			user_asset_created_byTouser: { select: { name: true } },
			user_asset_updated_byTouser: { select: { name: true } }
		}
	});

	return assets.map((e) => ({
		id: Number(e.id),
		name: e.name,
		file: e.file,
		instructions: e.asset_instruction_asset_instruction_assetToasset.map(
			(f) => f.instruction_asset_instruction_instructionToinstruction.title
		),
		created_by: e.user_asset_created_byTouser?.name || '',
		updated_by: e.user_asset_updated_byTouser?.name || ''
	}));
};

export const fetchInstructions = async () => {
	const instructions = await prisma.instruction.findMany({
		include: {
			asset_instruction_asset_instruction_instructionToinstruction: {
				include: {
					asset_asset_instruction_assetToasset: {
						select: {
							name: true
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
		}
	});

	console.log(instructions[0].asset_instruction_asset_instruction_instructionToinstruction.map((f) => f.asset_asset_instruction_assetToasset.name));

	return instructions.map((e) => ({
		id: Number(e.id),
		title: e.title,
		description: e.description,
		preview: e.preview,
		duration: Number(e.duration),
		assets: e.asset_instruction_asset_instruction_instructionToinstruction.map(
			(f) => f.asset_asset_instruction_assetToasset.name
		),
		created_by: e.user_instruction_created_byTouser?.name || '',
		updated_by: e.user_instruction_updated_byTouser?.name || ''
	}));
};
