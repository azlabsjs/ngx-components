const commonMimetype: { [prop: string]: string } = {
  'text/plain': 'txt',
  'application/javascript': 'js',
  'text/javascript': 'js',
  'application/json': 'json',
  'image/jpeg': 'jpeg',
  'image/png': 'png',
  'application/pdf': 'pdf',
  'application/zip': 'zip',
  'application/xml': 'xml',
  'text/html': 'html',
  'text/css': 'css',
  'image/svg+xml': 'svg',
  'application/vnd.ms-excel': 'xls',
  'application/vnd.ms-excel.sheet.binary.macroEnabled.12': 'xlsb',
  'application/vnd.ms-excel.sheet.macroEnabled.12': 'xlsm',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
};

/** @internal */
function extensionFromMimeType(mimetype: string, def: string = '') {
  const baseMimeType = mimetype.split(';')[0].trim();
  return commonMimetype[baseMimeType] ?? def;
}

/** @internal */
function createfilename(extension?: string) {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).slice(2, 8);
  return `${timestamp}-${randomPart}${extension ? `.${extension}` : ''}`;
}

/** creates a closure object which uses fecth api to query or load file from url */
export function createWithFetchAPI(
  logger: (message: unknown, ...options: any[]) => void = console.error
) {
  return async (url: string) => {
    try {
      const response = await fetch(url, {
        headers: {
          'Content-type': 'application/octet-stream',
          Accept: 'text/plain',
        },
      });

      const blob = await response.blob();
      const disposition = response.headers.get('Content-Disposition');
      let filename: string | undefined | null = null;

      if (disposition) {
        const filenameRegex = /filename\*?=['"]?(?:UTF-8''|)([^;"]+)['"]?/;
        const matches = filenameRegex.exec(disposition);
        if (matches && matches[1]) {
          filename = decodeURIComponent(matches[1].replace(/\+/g, ' '));
        }
      }

      const name =
        filename ??
        filename ??
        createfilename(extensionFromMimeType(blob.type));

      return new File([blob], name, {
        type: blob.type,
        lastModified: Date.now(),
      });
    } catch (error) {
      logger(error);
      return null;
    }
  };
}
