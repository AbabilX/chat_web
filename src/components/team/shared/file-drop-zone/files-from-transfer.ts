/** Files from a paste or drop. Clipboard items first (screenshots), then FileList. */
export function filesFromDataTransfer(
  data: DataTransfer | null | undefined,
): File[] {
  if (!data) return [];
  const files: File[] = [];
  const items = data.items;
  if (items?.length) {
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.kind === "file") {
        const file = item.getAsFile();
        if (file) files.push(file);
      }
    }
    if (files.length > 0) return files;
  }
  return Array.from(data.files ?? []);
}

export function hasDraggedFiles(e: {
  dataTransfer?: DataTransfer | null;
}): boolean {
  return Array.from(e.dataTransfer?.types ?? []).includes("Files");
}
