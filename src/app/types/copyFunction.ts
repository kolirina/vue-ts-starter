export const CopyFunction = (input: HTMLInputElement): boolean => {
    input.focus();
    document.execCommand("selectAll");
    return document.execCommand("copy");
};
