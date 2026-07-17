import { writable } from "svelte/store";

// LastUpload component
export const screenshotPath = writable("C://MapleLegendsHD/Screenshots");
export const batchPath = writable("C://MapleLegendsHD/OwlrepoScreenshots");
export const trashOnProcessing = writable(true);

export const isProcessing = writable(false);
export const isProcessingBatch = writable(false);
export const shouldPruneProcessed = writable(false);
