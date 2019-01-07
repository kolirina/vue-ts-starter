import {Component, Prop, Vue} from "vue-property-decorator";
import Maskable from "vuetify/lib/mixins/maskable";
import {isMaskDelimiter, maskText as _maskText, unmaskText as _unmaskText} from "vuetify/lib/util/mask";

/** Mixin mask for IINumberField component */
@Component({
    extends: Maskable
})
export class NumberMask extends Vue {

    @Prop({type: String, default: "6"})
    decimals: string;

    private maskText(text: string): string {
        return (this as any).mask ? _maskText(text, (this as any).masked, (this as any).dontFillMaskBlanks) : (this as any).maskNumber(text);
    }

    private unmaskText(text: string): string {
        return (this as any).mask && !(this as any).returnMaskedValue ? _unmaskText(text) : (this as any).unmaskNumber(text);
    }

    private maskNumber(text: string): string {
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
    }

    private unmaskNumber(text: string): string {
        return text ? text.replace(new RegExp(/ /, "g"), "") : text;
    }

    private resetSelections(input: any): void {
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
    }

    private updateRange(): void {
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
