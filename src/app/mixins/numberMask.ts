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
            const _this = this as any;
            return _this.mask ? _maskText(text, _this.masked, _this.dontFillMaskBlanks) : _this.maskNumber(text);
        },
        unmaskText: function unmaskText(text: string): string {
            const _this = this as any;
            return _this.mask && !_this.returnMaskedValue ? _unmaskText(text) : _this.unmaskNumber(text);
        },
        maskNumber: function maskNumber(text: string): string {
            const _this = this as any;
            if (text == null) return "";
            let floorPart = "";
            let decimalPart = "";
            let textIndex = 0;
            let isDot = false;
            while (textIndex < text.length) {
                const char = text[textIndex];
                if (!isDot && char.match(/[0-9]/)) {
                    floorPart += char;
                } else if (isDot && (decimalPart.length < _this.decimals) && char.match(/[0-9]/)) {
                    /* TODO Математическое округление precision */
                    decimalPart += char;
                } else if (!isDot && _this.decimals != 0 && char.match(/[.]/)) {
                    isDot = true;
                }
                textIndex++;
            }
            return floorPart.replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, "$1 ") + (isDot? "." : "") + decimalPart;
        },
        unmaskNumber: function unmaskNumber(text: string): string {
            return text ? text.replace(new RegExp(/ /, "g"), "") : text;
        },
        resetSelections: function resetSelections(input: any) {
            const _this = this as any;
            if (!input.selectionEnd) return;
            _this.selection = input.selectionEnd;
            _this.lazySelection = 0;
            if (_this.mask) for (var index = 0; index < _this.selection; index++) {
                isMaskDelimiter(input.value[index]) || _this.lazySelection++;
            } else for (var index = 0; index < _this.selection; index++) {
                (input.value[index] === " ") || _this.lazySelection++;
            }
        },
        updateRange: function updateRange() {
            const _this = this as any;
            if (!_this.$refs.input) return;
            var newValue = _this.maskText(_this.lazyValue);
            var selection = 0;
            _this.$refs.input.value = newValue;
            if (newValue) {
                for (var index = 0; index < newValue.length; index++) {
                    if (_this.lazySelection <= 0) break;
                    if (_this.mask) isMaskDelimiter(newValue[index]) || _this.lazySelection--;
                    else (newValue[index] === " ") || _this.lazySelection--;
                    selection++;
                }
            }
            _this.setCaretPosition(selection);
            _this.$emit("input", _this.returnMaskedValue ? _this.$refs.input.value : _this.lazyValue);
        }
    }
}