import Component from "vue-class-component";
import {namespace} from "vuex-class/lib/bindings";
import {UI} from "../../app/ui";
import {ClientInfo} from "../../types/types";
import {StoreType} from "../../vuex/storeType";

const MainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
        <v-container fluid>
            Импорт сделок
            <v-card>
                <v-card-text>
                    <div class="attachments">
                        <file-drop-area @drop="onFileAdd" class="attachments-file-drop">
                            <div class="attachments-file-drop__content">
                                Перетащите<br>
                                или <file-link @select="onFileAdd" multiple>загрузите</file-link> файл
                            </div>
                        </file-drop-area>
                    </div>
                </v-card-text>
            </v-card>
        </v-container>
    `
})
export class ImportPage extends UI {

    @MainStore.Getter
    private clientInfo: ClientInfo;

    /**
     * Событие при добавлении вложений
     * @param {FileList} fileList список файлов
     */
    private onFileAdd(fileList: File[]): void {
    }
}
