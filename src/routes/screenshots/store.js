import { writable } from "svelte/store";

// LastUpload component
export let screenshotPath = writable("C://MapleLegendsHD/Screenshots");
export let batchPath = writable("C://MapleLegendsHD/OwlrepoScreenshots");
export let trashOnProcessing = writable(true);

export let isProcessingBatch = writable(false);
export let shouldPruneProcessed = writable(false);
