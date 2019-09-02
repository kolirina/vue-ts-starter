import {Component, Vue} from "vue-property-decorator";
import VTextField from "vuetify/lib/components/VTextField/VTextField";
import {NumberMask} from "../mixins/numberMask";

@Component({
    extends: VTextField,
    name: "ii-number-field",
    mixins: [NumberMask]
})
export class IINumberField extends Vue {

    private get internalValue(): any {
        return (this as any).lazyValue;
    }

    private set internalValue(val: any) {
        (this as any).lazyValue = (this as any).unmaskText((this as any).maskText((this as any).unmaskText(val)));
        (this as any).setSelectionRange();
    }

    private onInput(e: any): void {
        (this as any).internalChange = true;
        (this as any).resetSelections(e.target);
        (this as any).internalValue = this.delimiterСheck(e.target.value);
        (this as any).badInput = e.target.validity && e.target.validity.badInput;
    }

    private delimiterСheck(value: string): string {
        if (value.includes(",")) {
            return value.replace(",", ".");
        }
        return value;
    }
}
