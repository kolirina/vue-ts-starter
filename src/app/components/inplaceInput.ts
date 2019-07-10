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
            <v-layout wrap class="content">
                <v-text-field
                        v-model.trim="editableValue"
                        type="text"
                        ref="inplaceInput"
                        :placeholder="placeholder"
                        :maxlength="maxLength"
                        class="inplace-input-field">
                </v-text-field>
                <v-btn @click="emitCompleteEvent" :disabled="editableValue === value" color="#EBEFF7" class="save-btn">
                    Сохранить изменения
                </v-btn>
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

    /** Значение отображаемое в режиме просмотра */
    @Prop({default: "", type: String})
    private placeholder: string;

    /** Значение введенное пользователем */
    private editableValue: string = null;
    /** Режим редактирования */
    private isEditMode: boolean = false;

    /**
     * Инициализирует данные компонента
     * @inheritDoc
     */
    created(): void {
        this.editableValue = this.value;
    }

    /**
     * Инициирует событие, в котором передает измененное значение
     */
    private emitCompleteEvent(): void {
        if (this.editableValue.length > this.maxLength) {
            throw new Error("Размер вводимого значения не должен превышать " + this.maxLength);
        }
        if (this.editableValue !== this.value) {
            this.$emit("input", this.editableValue);
        }
    }
}