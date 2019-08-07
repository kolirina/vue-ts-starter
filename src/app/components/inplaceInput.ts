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
            <v-layout @click="focus" :class="['inplace-custom-input', isEditMode ? 'active-inplace-custom-input' : '']" justify-space-between @blur="closeInput">
                <input ref="inplaceInput" v-model.trim="editableValue" @focus="isEditMode = true" @keyup.enter="emitCompleteEvent"
                    @keyup.esc="closeInput" :maxlength="maxLength">
                <v-btn v-if="!isEditMode" @click="setEditMode" flat icon color="indigo">
                    <i class="profile-edit"></i>
                </v-btn>
                <v-layout v-if="isEditMode" class="initial-flex btn-action-section" align-center>
                    <v-btn @click.native="emitCompleteEvent()" small flat icon color="indigo">
                        <v-icon>done</v-icon>
                    </v-btn>
                    <v-btn @click.native="updateEditableValue()" small flat icon color="indigo">
                        <v-icon>clear</v-icon>
                    </v-btn>
                </v-layout>
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
    mounted(): void {
        this.updateEditableValue();
        console.log(this.$refs);
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
            this.closeInput();
        }
    }

    private focus(): void {
        this.$refs.inplaceInput.focus();
    }

    private updateEditableValue(): void {
        this.$nextTick(() => {
            this.editableValue = this.value;
        });
    }

    private setEditMode(): void {
        this.isEditMode = true;
    }

    private closeInput(): void {
        this.$nextTick(() => {
            this.updateEditableValue();
            this.$refs.inplaceInput.blur();
            this.isEditMode = false;
            console.log(this.isEditMode);
        });
    }

}