/**
 * Ссылка для выбора файлов
 */
import Component from 'vue-class-component';
import {Prop} from 'vue-property-decorator';
import {UI} from '../../app/UI';
import {CommonUtils} from '../../utils/commonUtils';
import {FileUtils} from '../../utils/fileUtils';

@Component({
    // language=Vue
    template: `
        <div class="file-link">
            <input :id="inputId" ref="input" style="display: none;" type="file" name="files" :multiple="multiple" :accept="accept" @change="onChange"/>
            <label :for="inputId" class="file-link__text">
                <slot></slot>
            </label>
        </div>`
})
export class FileLink extends UI {

    /** Событие выбора файлов */
    private static readonly SELECT = 'select';

    /** Ссылка на поле ввода */
    $refs: {
        input: HTMLInputElement
    };

    /** Можно ли выбрать несколько файлов */
    @Prop({type: Boolean, default: false})
    private multiple: boolean;

    /** Фильтр на типы файлов, которые можно выбрать */
    @Prop({type: String})
    private accept: string;

    /** Идентификатор поля ввода */
    private inputId = 'file-link-' + CommonUtils.uuid();

    /**
     * Обрабатывает изменение выбранных файлов
     */
    private onChange(): void {
        this.$emit(FileLink.SELECT, FileUtils.fileListToFileArray(this.$refs.input.files));
        // необходимо сбрасывать значение, чтобы событие change отрабатывало на этом же файле (если он был удален после загрузки)
        this.$refs.input.value = null;
    }
}