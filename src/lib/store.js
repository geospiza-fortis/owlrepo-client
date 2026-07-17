import { writable } from "svelte/store";

// LastUpload component
export const lastUpload = writable({ img: null, task_id: null });
