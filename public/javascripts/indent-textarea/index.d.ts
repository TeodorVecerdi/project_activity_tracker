export declare function indent(element: HTMLTextAreaElement): void;
export declare function unindent(element: HTMLTextAreaElement): void;
export declare function eventHandler(event: KeyboardEvent): void;
declare type WatchableElements = string | HTMLTextAreaElement | Iterable<HTMLTextAreaElement>;
export declare function watch(elements: WatchableElements): void;
export {};
