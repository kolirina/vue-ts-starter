/**
 * Компонент для inplace-редактирования.
 */
import Component from "vue-class-component";
import {Prop} from "vue-property-decorator";
import {UI} from "../app/ui";

@Component({
    // language=Vue
    template: `
        <v-layout :class="['inplace-custom-input', editMode ? 'active-inplace-custom-input' : '']" justify-space-between>
            <input ref="inplaceInput" v-model.trim="editableValue" @keyup.enter="emitCompleteEvent"
                   :readonly="!editMode" @dblclick="onEdit"
                   @keyup.esc="dismissChanges" :maxlength="maxLength" :placeholder="placeholder"
                   v-click-outside="dismissChanges">
            <v-btn v-show="!editMode" @click.stop="onEdit" ref="editBtn" flat icon color="indigo">
                <i class="profile-edit"></i>
            </v-btn>
            <v-layout v-if="editMode" class="initial-flex btn-action-section" align-center>
                <v-btn @click="emitCompleteEvent" title="Сохранить" small flat icon color="indigo">
                    <v-icon>done</v-icon>
                </v-btn>
                <v-btn @click="dismissChanges" title="Отменить" small flat icon color="indigo">
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
    private editMode: boolean = false;
    /** Первоначальное значение */
    private oldValue = "";

    /**
     * Инициализирует данные компонента
     * @inheritDoc
     */
    created(): void {
        this.editableValue = this.value;
        this.oldValue = this.editableValue;
    }

    /**
     * Инициирует событие, в котором передает измененное значение
     */
    private emitCompleteEvent(): void {
        if (this.editableValue.length > this.maxLength) {
            throw new Error("Размер вводимого значения не должен превышать " + this.maxLength);
        }
        this.oldValue = this.editableValue;
        if (this.editableValue !== this.value) {
            this.$emit("input", this.editableValue);
        }
        this.closeInput();
    }

    private onEdit(): void {
        this.editMode = true;
        // если старого значения нет, значит оно было очищено, подставляем снова значение отображаемое в режиме просмотра
        this.editableValue = this.oldValue || this.value || "";
        this.$nextTick(() => {
            this.$refs.inplaceInput.setSelectionRange(0, this.editableValue.length);
            this.$refs.inplaceInput.focus();
        });
    }

    private closeInput(): void {
        this.editMode = false;
    }

    private dismissChanges(): void {
        this.closeInput();
        this.editableValue = this.oldValue;
    }
}