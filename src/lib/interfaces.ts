export interface Asset {
	id: number;
	name: string;
	file: string;
	instructions: { id: number; title: string }[];
	created_by: string;
	updated_by: string;
}

export interface User {
	id: number;
	name: string;
	created_at: Date;
}

export interface Step {
	id: number;
	title: string;
	type: string;
	description: string | null;
	attached_file: string | null;
	step_nr: number;
	instruction: { id: number; title: string };
	created_by: string;
	updated_by: string | undefined;
}

export interface Instruction {
	id: number;
	title: string;
	description: string;
	preview: string | null;
	duration: number;
	assets: { name: string; id: number }[];
	created_by: string;
	updated_by: string;
}
