export const trimLongText = (text: string, maxLen: number = 16) => {
    if (text.length > maxLen) return text.slice(0, maxLen) + "...";
    return text;
};
