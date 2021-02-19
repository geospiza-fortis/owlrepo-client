import { writable } from "svelte/store";

// LastUpload component
export let lastUpload = writable({ img: null, task_id: null });
export let navbarIndex = writable(0);
