export const jsonRequestParams = (method: string, body: Record<string, any>) => {
  return {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };
};

export const queryParams = (params: Record<string, any>) => {
  removeEmptyFields(params);
  return "?" + new URLSearchParams(params).toString();
};

const removeEmptyFields = (obj: Record<string, any>) => {
  for (const key in obj) {
    if (obj.hasOwnProperty(key) && [undefined, null, ""].includes(obj[key])) {
      delete obj[key];
    }
  }
};

export const getFileNameFromContentDisposition = (cd: string) => {
  const filenameStar = /filename\*\s*=\s*([^;]+)/i.exec(cd);
  if (filenameStar) {
    const v = filenameStar[1].trim();
    const parts = v.split("''");
    if (parts.length === 2) return decodeURIComponent(parts[1].replace(/(^"|"$)/g, ""));
    return v.replace(/(^"|"$)/g, "");
  }

  const filename = /filename\s*=\s*"([^"]+)"/i.exec(cd) || /filename\s*=\s*([^;]+)/i.exec(cd);
  return filename ? filename[1].trim().replace(/(^"|"$)/g, "") : null;
};
