declare module "imask" {

    export type MaskOptions = {
        mask?: string | number | RegExp | MaskOptions[] | any;
        min?: number;
        max?: number;
        definitions?: "0" | "a" | "*";
        lazy?: boolean;
        placeholderChar?: string; // defaults to '_'
        groups?: any;
        scale?: number;  // digits after point, 0 for integers
        signed?: boolean;  // disallow negative
        thousandsSeparator?: string;  // any single char
        padFractionalZeros?: boolean;  // if true, then pads zeros at end to the length of scale
        normalizeZeros?: boolean;  // appends or removes zeros at ends
        radix?: string;  // fractional delimiter
        mapToRadix?: string[];  // symbols to process as radix
        prepare?: (val: any) => any;
        commit?: (value: any, masked: Masked) => void;
        parse?: any;
        validate?: () => boolean;
        dispatch?: (appended: string, masked: MaskedDynamic, flags: any) => MaskOptions;
        [key: string]: any;
    };

    export class IMask {
        new(el: Element, opts?: MaskOptions): InputMask;
    }

    export class InputMask {

        readonly mask: string;
        value: string;
        unmaskedValue: string;
        typedValue: string;
        readonly selectionStart: string;
        cursorPos: number;

        constructor(el: Element, opts?: MaskOptions);

        updateValue(): void;

        updateControl(): void;

        updateOptions(opts: MaskOptions): void;

        updateCursor(cursorPos: number): void;

        alignCursor(): void;

        alignCursorFriendly(): void;

        on(ev: string, handler: any): void;

        off(ev: string, handler: any): void;

        destroy(): void;
    }

    export class Masked {

        value: any;
        unmaskedValue: string;
        typedValue: any;
        rawInputValue: any;
        readonly isComplete: boolean;

        constructor(opts: MaskOptions);

        updateOptions(opts: MaskOptions): void;

        clone(): Masked;

        assign(source: any): any;

        reset(): void;

        resolve(value: any): any;
    }

    export class MaskedPattern extends Masked {
    }

    export class MaskedNumber extends Masked {
    }

    export class MaskedDate extends Masked {
    }

    export class MaskedRegExp extends Masked {
    }

    export class MaskedFunction extends Masked {
    }

    export class MaskedDynamic extends Masked {
        compiledMasks: MaskOptions[];
    }

    export function createMask(opts: MaskOptions): Masked;
}
