// Mixins
import Maskable from 'vuetify/lib/mixins/maskable';
import { isMaskDelimiter, maskText as _maskText, unmaskText as _unmaskText } from 'vuetify/lib/util/mask';

export default {
    extends: Maskable,
    methods: {
        maskText: function maskText(text: string): string {
            console.log("maskText!!!");
            const _this = this as any;
            return _this.mask ? _maskText(text, _this.masked, _this.dontFillMaskBlanks) : _this.maskNumber(text);
        },
        unmaskText: function unmaskText(text: string): string {
            const _this = this as any;
            return _this.mask && !_this.returnMaskedValue ? _unmaskText(text) : _this.unmaskNumber(text);
        },
        maskNumber: function maskNumber(text: string): string {
            if (text == null) return "";
            let floorPart = "";
            let decimalPart = "";
            let textIndex = 0;
            let newText = "";
            let isDot = false;
            while (textIndex < text.length) {
                const char = text[textIndex];
                if (!isDot && char.match(/[0-9]/)) {
                    floorPart += char;
                } else if (isDot && (decimalPart.length < this.decimalPartLength) && char.match(/[0-9]/)) {
                    decimalPart += char;
                } else if (!isDot && char.match(/[.]/)) {
                    isDot = true;
                }
                textIndex++;
            }
            floorPart = floorPart.replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1 ');
            return floorPart + (isDot? "." : "") + decimalPart;
        },
        unmaskNumber: function unmaskNumber(text: string): string {
            return text ? text.replace(new RegExp(/ /, 'g'), '') : text;
            // return text
        }
    }
}