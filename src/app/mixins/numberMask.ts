/*
    Mixin
    mask for IINumberField component
*/
import Maskable from "vuetify/lib/mixins/maskable";
import { isMaskDelimiter, maskText as _maskText, unmaskText as _unmaskText } from "vuetify/lib/util/mask";

export default {
    extends: Maskable,
    props: {
        decimals: {
            type: [Number, String],
            default: 6
        }
    },
    methods: {
        maskText: function maskText(text: string): string {
            return (this as any).mask ? _maskText(text, (this as any).masked, (this as any).dontFillMaskBlanks) : (this as any).maskNumber(text);
        },
        unmaskText: function unmaskText(text: string): string {
            return (this as any).mask && !(this as any).returnMaskedValue ? _unmaskText(text) : (this as any).unmaskNumber(text);
        },
        maskNumber: function maskNumber(text: string): string {
            if (text == null) {
                return "";
            }
            let floorPart = "";
            let decimalPart = "";
            let textIndex = 0;
            let isDot = false;
            while (textIndex < text.length) {
                const char = text[textIndex];
                if (!isDot && char.match(/[0-9]/)) {
                    floorPart += char;
                } else if (isDot && (decimalPart.length < (this as any).decimals) && char.match(/[0-9]/)) {
                    /* TODO Математическое округление precision */
                    decimalPart += char;
                } else if (!isDot && (this as any).decimals !== "0" && char.match(/[.]/)) {
                    isDot = true;
                }
                textIndex++;
            }
            return floorPart.replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, "$1 ") + (isDot ? "." : "") + decimalPart;
        },
        unmaskNumber: function unmaskNumber(text: string): string {
            return text ? text.replace(new RegExp(/ /, "g"), "") : text;
        },
        resetSelections: function resetSelections(input: any) {
            if (!input.selectionEnd) {
                return;
            }
            (this as any).selection = input.selectionEnd;
            (this as any).lazySelection = 0;
            if ((this as any).mask) {
                for (let index = 0; index < (this as any).selection; index++) {
                    isMaskDelimiter(input.value[index]) || (this as any).lazySelection++;
                }
            } else {
                for (let index = 0; index < (this as any).selection; index++) {
                    (input.value[index] === " ") || (this as any).lazySelection++;
                }
            }
        },
        updateRange: function updateRange() {
            if (!(this as any).$refs.input) {
                return;
            }
            const newValue = (this as any).maskText((this as any).lazyValue);
            let selection = 0;
            (this as any).$refs.input.value = newValue;
            if (newValue) {
                for (const newValueChar of newValue) {
                    if ((this as any).lazySelection <= 0) {
                        break;
                    }
                    if ((this as any).mask) {
                        isMaskDelimiter(newValueChar) || (this as any).lazySelection--;
                    } else {
                        (newValueChar === " ") || (this as any).lazySelection--;
                    }
                    selection++;
                }
            }
            (this as any).setCaretPosition(selection);
            (this as any).$emit("input", (this as any).returnMaskedValue ? (this as any).$refs.input.value : (this as any).lazyValue);
        }
    }
};