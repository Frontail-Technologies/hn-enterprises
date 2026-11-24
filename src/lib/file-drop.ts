import { toast } from "sonner";

/**
 * Some apps (VS Code's file list, some editors) drag only a file's address,
 * not the file itself - and a web page can't read a file from its address.
 * Returns the dropped files, or tells the user how to drop it instead.
 */
export function filesFromDrop(dataTransfer: DataTransfer): File[] {
  const files = Array.from(dataTransfer.files);
  if (!files.length && (dataTransfer.types.includes("text/uri-list") || dataTransfer.types.includes("text/plain"))) {
    toast.info("That app didn't hand over the file", {
      description: "Drag it from Windows File Explorer instead, or click the box to choose it.",
    });
  }
  return files;
}
