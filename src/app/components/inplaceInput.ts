/**
 * Компонент для inplace-редактирования.
 */
import Component from "vue-class-component";
import {Prop} from "vue-property-decorator";
import {UI} from "../app/ui";

@Component({
    // language=Vue
    template: `
        <v-layout @click="focus" :class="['inplace-custom-input', isEditMode ? 'active-inplace-custom-input' : '']" justify-space-between>
            <input ref="inplaceInput" v-model.trim="editableValue" @keyup.enter="emitCompleteEvent"
                   @keyup.esc="closeInput" :maxlength="maxLength" :placeholder="placeholder">
            <v-btn v-show="!isEditMode" @click="setEditMode" ref="editBtn" flat icon color="indigo">
                <i class="profile-edit"></i>
            </v-btn>
            <v-layout v-if="isEditMode" class="initial-flex btn-action-section" align-center>
                <v-btn @click="emitCompleteEvent()" small flat icon color="indigo">
                    <v-icon>done</v-icon>
                </v-btn>
                <v-btn @click="closeInput()" small flat icon color="indigo">
                    <v-icon>clear</v-icon>
                </v-btn>
            </v-layout>
        </v-layout>
    `
})
export class InplaceInput extends UI {

    $refs: {
        editBtn: any,
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
        window.addEventListener("click", (event: any) => {
            if (event.path.find((element: object) => element === this.$refs.editBtn.$vnode.elm)) {
                this.$refs.inplaceInput.focus();
                this.isEditMode = true;
            } else {
                this.$refs.inplaceInput.blur();
                this.isEditMode = false;
            }
        });
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
        this.updateEditableValue();
        this.$refs.inplaceInput.blur();
        this.isEditMode = false;
    }

}