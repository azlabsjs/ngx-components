/**
 * Recursively loop through files in a given filesystem directory object
 *
 * @internal
 *
 * @param directory
 */
export function recursiveReaddir(directory: FileSystemDirectoryEntry) {
  async function asBlob(fileEntry: FileSystemFileEntry) {
    try {
      return new Promise<File>((resolve, reject) =>
        fileEntry.file(resolve, reject)
      );
    } catch (err) {
      throw new Error(`Error converting a fileEntry to a File: ${err}`);
    }
  }
  return new Promise<File[]>((resolve, reject) => {
    const files: File[] = [];
    const directoryReader = directory.createReader();
    function readEntries() {
      directoryReader.readEntries(async (items) => {
        // All files i
        if (!items.length) {
          resolve(files);
        } else {
          const fileEntries = items.filter(
            (item) => item.isFile
          ) as FileSystemFileEntry[];
          for (const entry of fileEntries) {
            files.push(await asBlob(entry));
          }
          readEntries();
        }
      });
    }
    readEntries();
  });
}

/**
 * Recursively loop through file entry in data transfer items
 *
 * @internal
 *
 * @param items
 * @param fileList
 */
export async function getTransferredFileEntries(
  items: DataTransferItemList,
  fileList: FileList
) {
  const droppedFiles: File[] = [];
  const droppedDirectories = [];
  // seperate dropped files from dropped directories for easier handling
  for (let i = 0; i < items.length; i++) {
    const entry = items[i].webkitGetAsEntry();
    if (entry && entry.isFile) {
      droppedFiles.push(fileList[i]);
      continue;
    }
    if (entry && entry.isDirectory) {
      droppedDirectories.push(entry);
      continue;
    }
  }
  // create a DataTransfer
  const droppedFilesList = new DataTransfer();
  droppedFiles.forEach((droppedFile) => {
    droppedFilesList.items.add(droppedFile);
  });

  // Process each dropped directory
  if (droppedDirectories.length) {
    const directoryFilePromises = droppedDirectories.map((directory) =>
      recursiveReaddir(directory as FileSystemDirectoryEntry)
    );
    await Promise.all(directoryFilePromises).then(
      (allExtractedFiles: any[]) => {
        allExtractedFiles
          .reduce((a, b) => [...a, ...b])
          .forEach((extractedFile: File) => {
            droppedFilesList.items.add(extractedFile);
          });
      }
    );
  }
  return droppedFilesList.files;
}
