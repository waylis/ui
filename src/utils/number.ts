export const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 B";

    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    const value = bytes / Math.pow(1024, i);

    const display = parseFloat(value.toFixed(2)).toString();
    return `${display} ${sizes[i]}`;
};
