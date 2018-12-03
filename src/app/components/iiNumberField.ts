import VTextField from "vuetify/lib/components/VTextField/VTextField";
import {Vue, Component} from "vue-property-decorator";
import NumberMask from "../mixins/numberMask";

@Component({
    extends: VTextField,
    name: "ii-number-field",
    mixins: [NumberMask]
})
export default
class IINumberField extends Vue {

    private get internalValue() {
        const _this = this as any;
        return _this.lazyValue;
    }

    private set internalValue(val) {
        const _this = this as any;
        _this.lazyValue = _this.unmaskText(_this.maskText(_this.unmaskText(val)));
        _this.setSelectionRange();
    }

    private onInput(e: any) {
        const _this = this as any;
        _this.internalChange = true;
        _this.resetSelections(e.target);
        _this.internalValue = e.target.value;
        _this.badInput = e.target.validity && e.target.validity.badInput;
    }
}