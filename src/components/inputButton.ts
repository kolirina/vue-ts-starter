/**
 * Кнопка, которую можно перевести в режим ввода текста
 */
import Component from "vue-class-component";
import {UI} from "../app/UI";
import {Model, Prop, Watch} from "vue-property-decorator";

@Component({
    // language=Vue
    template: `
        <div class="input-button">
            <transition name="fade" mode="in-out">
                <div v-if="inputMode || progress" class="input-button__field-wrapper">
                    <v-text-field ref="input"
                                  :placeholder="placeholder"
                                  :readonly="progress"
                                  :value="value"
                                  @input="$emit('input', $event.target.value)"
                                  @keyup.enter="onSubmit"
                                  @blur="onBlur"
                                  @keyup.esc="onEscape"
                                  @click.stop></v-text-field>
                    <transition name="fade">
                        <v-btn v-if="!!value"
                               dark
                               color="primary"
                               :title="text"
                               @mousedown.prevent="onSubmit"
                               @click.stop
                               :title="text">
                            <v-icon light>{{ progress ? 'fa-spinner fa-spin' : iconClass }}</v-icon>
                        </v-btn>
                    </transition>
                </div>
                <v-btn v-else dark color="primary" @click.stop="$emit('update:inputMode', true)">
                    {{text}}
                </v-btn>
            </transition>
        </div>
    `
})
export class InputButton extends UI {

    $refs: {
        /** Поле ввода */
        input: HTMLInputElement
    };

    /** Значение поля ввода */
    @Model("input", {type: String, required: true})
    private value: string;

    /**
     * Нужно ли отображать компонент в режиме ввода текста.
     * Используйте sync для двойного связывания.
     */
    @Prop({type: Boolean, required: true})
    private inputMode: boolean;

    /** Значение поля ввода после перевода компонента в режим ввода текста */
    @Prop({type: String, default: null})
    private initValue: string;

    /** Текст на кнопке */
    @Prop({type: String, default: ""})
    private text: string;

    /** Максимальная длина текста в поле ввода */
    @Prop({type: Number, default: null})
    private maxLength: number;

    /** Текст для отображения на фоне поля ввода */
    @Prop({type: String, default: ""})
    private placeholder: string;

    /** Класс иконки для отображения на кнопке отправки */
    @Prop({type: String, default: "fa-check"})
    private iconClass: string;

    /** Отображать ли компонент в режиме выполнения операции */
    @Prop({type: Boolean, default: false})
    private progress: boolean;

    /**
     * Обрабатывает изменение параметра отображения компонента в режиме ввода текста
     * @param {boolean} newInputMode новое значение параметра
     */
    @Watch("inputMode")
    private onInputModeChange(newInputMode: boolean): void {
        if (newInputMode) {
            this.$emit("input", this.initValue);
            this.$nextTick(() => {
                const input = this.$refs.input;
                input.focus();
                input.selectionStart = input.selectionEnd = input.value.length;
            });
        }
    }

    /**
     * Обрабатывает событие нажатия на кнопку Escape
     */
    private onEscape(): void {
        if (this.progress) {
            return;
        }
        this.$emit("update:inputMode", false);
    }

    /**
     * Обрабатывает событие снятия фокуса с поля ввода
     */
    private onBlur(): void {
        if (this.progress) {
            return;
        }
        if (this.value && this.value !== this.initValue) {
            return;
        }
        this.$emit("update:inputMode", false);
    }

    /**
     * Обрабатывает событие отправки введенного значения
     */
    private async onSubmit(): Promise<void> {
        if (this.progress) {
            return;
        }
        if (!this.value) {
            return;
        }
        this.$emit("submit", this.value);
    }
}