/**
 * Компонент для inplace-редактирования.
 */
import Component from "vue-class-component";
import {Prop} from "vue-property-decorator";
import {UI} from "../app/ui";

@Component({
    // language=Vue
    template: `
        <div class="inplace-input">
            <v-layout>
                <v-text-field
                    v-model.trim="editableValue"
                    @keyup.enter="emitCompleteEvent"
                    @click:append="emitCompleteEvent"
                    @keyup.esc="closeInput"
                    @focus="setEditMode(true)"
                    @blur="setEditMode(false)"
                        append-icon="done"
                        type="text"
                        ref="inplaceInput"
                        :maxlength="maxLength"
                        :class="['inplace-input-field', isEditMode ? '' : 'focus-content-input']">
                </v-text-field>
            </v-layout>
        </div>
    `
})
export class InplaceInput extends UI {

    $refs: {
        inplaceInput: HTMLInputElement
    };

    /** Максимальный размер введенного значения */
    @Prop({default: 50, type: Number})
    private maxLength: number;

    /** Значение отображаемое в режиме просмотра */
    @Prop({default: "", type: String})
    private value: string;

    /** Значение введенное пользователем */
    private editableValue: string = null;
    /** Режим редактирования */
    private isEditMode: boolean = false;

    /**
     * Инициализирует данные компонента
     * @inheritDoc
     */
    created(): void {
        this.getСurrentData();
    }
    /**
     * Инициирует событие, в котором передает измененное значение
     */
    private emitCompleteEvent(): void {
        if (this.editableValue.length > this.maxLength) {
            // throw new Error("Размер вводимого значения не должен превышать " + this.maxLength);
        }
        if (this.editableValue !== this.value) {
            this.$emit("input", this.editableValue);
                this.closeInput();
        }
    }

    private getСurrentData(): void {
        this.$nextTick(() => {
            this.editableValue = this.value;
        });
    }

    private setEditMode(type: boolean): void {
        this.getСurrentData();
        this.isEditMode = type;
    }

    private closeInput(): void {
        this.getСurrentData();
        this.$refs.inplaceInput.blur();
    }

}