// See https://kit.svelte.dev/docs/types#app
declare global {
	namespace App {
		// Locals available in hooks and load functions
		interface Locals {
			session: { id: string; user: { id: string; name: string; email: string; admin: boolean; clinic: boolean } } | null;
		}
		// Page data additions if needed
		interface PageData {
			session?: { id: string; user: { id: string; name: string; email: string; admin: boolean; clinic: boolean } } | null;
		}
	}
}
export {};
// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
