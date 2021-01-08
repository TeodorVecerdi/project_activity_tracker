import { insert } from '../text-field-edit/index.js';
/*

# Global notes

Indent and unindent affect characters outside the selection, so the selection has to be expanded (`newSelection`) before applying the replacement regex.

The `unindent` selection expansion logic is a bit convoluted and I wish a genius would rewrite it more efficiently.

*/
export function indent(element) {
    var _a;
    const { selectionStart, selectionEnd, value } = element;
    const selectedText = value.slice(selectionStart, selectionEnd);
    // The first line should be indented, even if it starts with `\n`
    // The last line should only be indented if includes any character after `\n`
    const lineBreakCount = (_a = /\n/g.exec(selectedText)) === null || _a === void 0 ? void 0 : _a.length;
    if (lineBreakCount > 0) {
        // Select full first line to replace everything at once
        const firstLineStart = value.lastIndexOf('\n', selectionStart - 1) + 1;
        const newSelection = element.value.slice(firstLineStart, selectionEnd - 1);
        const indentedText = newSelection.replace(/^|\n/g, // Match all line starts
        '$&\t');
        const replacementsCount = indentedText.length - newSelection.length;
        // Replace newSelection with indentedText
        element.setSelectionRange(firstLineStart, selectionEnd - 1);
        insert(element, indentedText);
        // Restore selection position, including the indentation
        element.setSelectionRange(selectionStart + 1, selectionEnd + replacementsCount);
    }
    else {
        insert(element, '\t');
    }
}
function findLineEnd(value, currentEnd) {
    // Go to the beginning of the last line
    const lastLineStart = value.lastIndexOf('\n', currentEnd - 1) + 1;
    // There's nothing to unindent after the last cursor, so leave it as is
    if (value.charAt(lastLineStart) !== '\t') {
        return currentEnd;
    }
    return lastLineStart + 1; // Include the first character, which will be a tab
}
// The first line should always be unindented
// The last line should only be unindented if the selection includes any characters after `\n`
export function unindent(element) {
    const { selectionStart, selectionEnd, value } = element;
    // Select the whole first line because it might contain \t
    const firstLineStart = value.lastIndexOf('\n', selectionStart - 1) + 1;
    const minimumSelectionEnd = findLineEnd(value, selectionEnd);
    const newSelection = element.value.slice(firstLineStart, minimumSelectionEnd);
    const indentedText = newSelection.replace(/(^|\n)\t/g, '$1');
    const replacementsCount = newSelection.length - indentedText.length;
    // Replace newSelection with indentedText
    element.setSelectionRange(firstLineStart, minimumSelectionEnd);
    insert(element, indentedText);
    // Restore selection position, including the indentation
    const wasTheFirstLineUnindented = value.slice(firstLineStart, selectionStart).includes('\t');
    const newSelectionStart = selectionStart - Number(wasTheFirstLineUnindented);
    element.setSelectionRange(selectionStart - Number(wasTheFirstLineUnindented), Math.max(newSelectionStart, selectionEnd - replacementsCount));
}
export function eventHandler(event) {
    if (event.defaultPrevented) {
        return;
    }
    const textarea = event.target;
    if (event.key === 'Tab' &&
        !event.metaKey &&
        !event.altKey &&
        !event.ctrlKey) {
        if (event.shiftKey) {
            unindent(textarea);
        }
        else {
            indent(textarea);
        }
        event.preventDefault();
    }
}
export function watch(elements) {
    if (typeof elements === 'string') {
        elements = document.querySelectorAll(elements);
    }
    else if (elements instanceof HTMLTextAreaElement) {
        elements = [elements];
    }
    for (const element of elements) {
        element.addEventListener('keydown', eventHandler);
    }
}
