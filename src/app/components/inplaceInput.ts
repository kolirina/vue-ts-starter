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

            <template v-if="!editMode">
                <a v-if="emptyLinkText" style="color: darkgray" class="inplace-out underline" @click="onEdit" :title="emptyLinkText">{{ emptyLinkText }}</a>
                <v-layout row wrap>
                    <v-flex xs7>
                        <span v-if="!emptyLinkText"class="inplace-out" @dblclick="onEdit" title="Редактировать">{{ value }}</span>
                        <slot name="afterText"></slot>
                    </v-flex>
                    <v-flex xs4 offset-xs1 class="profile-edit">
                        <span  v-if="!emptyLinkText"  @click="onEdit">Изменить</span>
                    </v-flex>
                </v-layout>
            </template>
            <template v-else>
                <v-layout row wrap>
                    <v-flex xs7>
                        <v-text-field
                        v-model.trim="editableValue"
                        @keyup.enter="emitCompleteEvent"
                        @keyup.esc="dismissChanges"
                            type="text"
                            ref="inplaceInput"
                            class="inplace-input-field"
                            :maxlength="maxLength"
                            :placeholder="placeholder">
                        </v-text-field>
                    </v-flex>
                    <v-flex xs4 offset-xs1>
                        <div class="profile-icons">
                            <v-icon @click.stop="emitCompleteEvent">check_circle</v-icon>
                            <v-icon @click.stop="dismissChanges">cancel</v-icon>
                        </div>
                    </v-flex>
                </v-layout>
            </template>
        </div>
    `
})
export class InplaceInput extends UI {

    $refs: {
        inplaceInput: HTMLInputElement
    };

    @Prop({default: "", type: String})
    private placeholder: string;

    /** Максимальный размер введенного значения */
    @Prop({default: 50, type: Number})
    private maxLength: number;

    /** Значение отображаемое в режиме просмотра */
    @Prop({default: "", type: String})
    private value: string;

    /** Название ссылки (Отображается если начальное значение не задано) */
    @Prop({default: "", type: String})
    private emptyLinkText: string;

    /** Значение введенное пользователем */
    private editableValue = "";

    /** Первоначальное значение */
    private oldValue = "";

    /** Режим редактирования */
    private editMode = false;

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
            // throw new Error("Размер вводимого значения не должен превышать " + this.maxLength);
        }
        this.oldValue = this.editableValue;
        if (this.editableValue !== this.value) {
            this.$emit("input", this.editableValue);
        }
        this.closeInput();
    }

    private closeInput(): void {
        this.editMode = false;
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

    private dismissChanges(): void {
        this.closeInput();
        this.editableValue = this.oldValue;
    }
}