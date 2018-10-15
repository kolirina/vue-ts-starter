import {Inject} from "typescript-ioc";
import Component from "vue-class-component";
import {namespace} from "vuex-class/lib/bindings";
import {UI} from "../../app/ui";
import {ImportService} from "../../services/importService";
import {ClientInfo, Portfolio} from "../../types/types";
import {StoreType} from "../../vuex/storeType";
import {ImportInstructions} from "./importInstructions";

const MainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
        <v-container fluid>
            <v-card>
                <v-card-text>
                    <div class="import-wrapper">
                        <!--<h:form>-->
                        <h1>Импорт сделок</h1>
                        <p>
                            Здесь вы можете быстро перенести все ваши сделки в автоматическом режиме. Для этого выберите вашего брокера или торговый терминал и
                            ознакомьтесь с инструкцией
                            по созданию файла для импорта.
                        </p>
                        <p>
                            Если в списке нет вашего брокера или терминала, вы всегда можете осуществить импорт через универсальный формат
                            <p:commandLink value="CSV" onclick="selectCsvFormat('INTELINVEST')"/>
                            или обратиться к нам через обратную связь, по <a href="mailto:web@intelinvest.ru" target="_blank">почте</a> или
                            в группе <a href="http://vk.com/intelinvest" target="_blank">вконтакте</a>.
                        </p>
                    </div>
                    <div class="providers">
                        <div v-for="provider in providers" :key="provider" @click="selectedProvider = provider"
                             :class="['item', provider.toLowerCase(), selectedProvider === provider ? 'active' : '']"></div>
                    </div>

                    <import-instructions :provider="selectedProvider"></import-instructions>

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
                    <div v-if="files.length">
                        <ul>
                            <li v-for="file in files" :key="file">{{ file.name }}</li>
                        </ul>
                    </div>
                    <v-btn color="primary" @click="uploadFile">Загрузить</v-btn>
                </v-card-text>
            </v-card>
        </v-container>
    `,
    components: {ImportInstructions}
})
export class ImportPage extends UI {

    @MainStore.Getter
    private clientInfo: ClientInfo;
    @MainStore.Getter
    private portfolio: Portfolio;
    @Inject
    private importService: ImportService;
    /** Файлы для импорта */
    private files: File[] = [];
    /** Провайдеры отчетов */
    private providers = DealsImportProvider;
    /** Выбранный провайдер */
    private selectedProvider: DealsImportProvider = null;

    /**
     * Событие при добавлении вложений
     * @param {FileList} fileList список файлов
     */
    private onFileAdd(fileList: File[]): void {
        this.files = fileList;
        console.log(this.files[0].name);
    }

    private async uploadFile(): Promise<void> {
        if (this.files && this.files.length) {
            const data = new FormData();
            this.files.forEach(file => data.append("files", file, file.name));
            await this.importService.importReport("INTELINVEST", this.portfolio.id, data);
        }
    }
}

/** Форматы поддерживаемых брокеров и отчетов */
export enum DealsImportProvider {
    ALFADIRECT = "ALFADIRECT",
    QUIK = "QUIK",
    ITINVEST = "ITINVEST",
    OTKRYTIE = "OTKRYTIE",
    ZERICH = "ZERICH",
    PSBANK = "PSBANK",
    BCS = "BCS",
    BCS_CYPRUS = "BCS_CYPRUS",
    FINAM = "FINAM",
    FREEDOM_FINANCE = "FREEDOM_FINANCE",
    KITFINANCE = "KITFINANCE",
    URALSIB = "URALSIB",
    SBERBANK = "SBERBANK",
    VTB24 = "VTB24",
    INTERACTIVE_BROKERS = "INTERACTIVE_BROKERS",
    TINKOFF = "TINKOFF",
    NETTRADER = "NETTRADER",
    INTELINVEST = "INTELINVEST",
    ATON = "ATON"
}
