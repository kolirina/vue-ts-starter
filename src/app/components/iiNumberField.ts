import VTextField from "vuetify/lib/components/VTextField/VTextField";
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import NumberMask from "../mixins/numberMask"

@Component({
    extends: VTextField,
    name: "ii-number-field",
    // mixins: [NumberMask]
})
export default
class IINumberField extends Vue {

    private decimalPartLength = 2;

    private get internalValue() {
        const _this = this as any;
        return _this.lazyValue;
    }

    private set internalValue(val) {
        const _this = this as any;
        console.log("set internalValue", val);
        console.log(this.maskNumber(_this.unmaskNumber(val)));
        if (_this.mask) {
            _this.lazyValue = _this.unmaskText(_this.maskText(_this.unmaskText(val)));
            _this.setSelectionRange();
        } else {
            _this.lazyValue = _this.unmaskNumber(_this.maskNumber(_this.unmaskNumber(val)));
            _this.setSelectionRange();
            _this.$emit('input', _this.lazyValue);
        }
    }

    private onInput(e: any) {
        const _this = this as any;
        console.log("onInput", e.target.value);
        _this.internalChange = true;
        if (_this.mask) {
            _this.resetSelections(e.target);
        } else {
            if (e.target.selectionEnd) {
                _this.selection = e.target.selectionEnd;
                _this.lazySelection = 0;
                for (var index = 0; index < _this.selection; index++) {
                    (e.target.value[index] === " ") || _this.lazySelection++;
                }
            }
        }
        _this.internalValue = e.target.value;
        _this.badInput = e.target.validity && e.target.validity.badInput;
    }

    private maskNumber(text: string): string {
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
    }

    private unmaskNumber(text: string): string {
        return text ? text.replace(new RegExp(/ /, 'g'), '') : text;
        // return text
    }
}