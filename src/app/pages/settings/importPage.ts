import Component from "vue-class-component";
import {namespace} from "vuex-class/lib/bindings";
import {UI} from "../../app/ui";
import {ClientInfo, Portfolio} from "../../types/types";
import {StoreType} from "../../vuex/storeType";
import {Inject} from "typescript-ioc";
import {ImportService} from "../../services/importService";

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
                                или
                                <file-link @select="onFileAdd" multiple>загрузите</file-link>
                                файл
                            </div>
                        </file-drop-area>
                    </div>
                    <v-btn color="primary" @click="uploadFile">Загрузить</v-btn>
                </v-card-text>
            </v-card>
        </v-container>
    `
})
export class ImportPage extends UI {

    @MainStore.Getter
    private clientInfo: ClientInfo;
    @MainStore.Getter
    private portfolio: Portfolio;
    @Inject
    private importService: ImportService;

    private files: File[] = [];

    /**
     * Событие при добавлении вложений
     * @param {FileList} fileList список файлов
     */
    private onFileAdd(fileList: File[]): void {
        console.log(fileList);
        this.files = fileList;
    }

    private async uploadFile(): Promise<void> {
        if (this.files && this.files.length) {
            const data = new FormData();
            this.files.forEach(file => data.append("files", file, file.name));
            await this.importService.importReport("INTELINVEST", this.portfolio.id, data);
        }
    }
}
