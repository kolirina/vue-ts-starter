import {Inject} from "typescript-ioc";
import Component from "vue-class-component";
import {namespace} from "vuex-class/lib/bindings";
import {UI} from "../../app/ui";
import {ImportErrorsDialog} from "../../components/dialogs/importErrorsDialog";
import {ImportGeneralErrorDialog} from "../../components/dialogs/importGeneralErrorDialog";
import {ImportResponse, ImportService} from "../../services/importService";
import {ClientInfo, Portfolio, Status} from "../../types/types";
import {MutationType} from "../../vuex/mutationType";
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
                        <h1>Импорт сделок</h1>
                        <p>
                            Здесь вы можете быстро перенести все ваши сделки в автоматическом режиме. Для этого выберите вашего брокера или торговый терминал и
                            ознакомьтесь с инструкцией
                            по созданию файла для импорта.
                        </p>
                        <p>
                            Если в списке нет вашего брокера или терминала, вы всегда можете осуществить импорт через универсальный формат
                            <a @click="selectedProvider = providers.INTELINVEST">CSV</a>
                            или обратиться к нам через обратную связь, по <a href="mailto:web@intelinvest.ru" target="_blank">почте</a> или
                            в группе <a href="http://vk.com/intelinvest" target="_blank">вконтакте</a>.
                        </p>
                    </div>
                    <div class="providers">
                        <div v-for="provider in providers" :key="provider" @click="selectedProvider = provider"
                             :class="['item', provider.toLowerCase(), selectedProvider === provider ? 'active' : '']"></div>
                    </div>

                    <import-instructions :provider="selectedProvider" @selectProvider="onSelectProvider"></import-instructions>

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
                            <li v-for="(file, index) in files" :key="index">{{ file.name }}</li>
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
    @MainStore.Action(MutationType.RELOAD_PORTFOLIO)
    private reloadPortfolio: (id: string) => Promise<void>;
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
        if (this.files && this.files.length && this.selectedProvider) {
            const data = new FormData();
            this.files.forEach(file => data.append("files", file, file.name));
            const response = await this.importService.importReport(this.selectedProvider, this.portfolio.id, data);
            await this.handleUploadResponse(response);
        }
    }

    private async handleUploadResponse(response: ImportResponse): Promise<void> {
        console.log(response);
        if (response.status === Status.ERROR) {
            this.$snotify.error(response.message, "Ошибка");
            return;
        }
        if (response.generalError) {
            await new ImportGeneralErrorDialog().show({generalError: response.generalError, router: this.$router});
            return;
        }
        if (response.errors && response.errors.length) {
            await new ImportErrorsDialog().show({
                errors: response.errors, router: this.$router,
                validatedTradesCount: response.validatedTradesCount
            });
        }
        if (response.validatedTradesCount) {
            await this.reloadPortfolio(this.portfolio.id);
        }
    }

    /**
     * Обрабатывает событие выбора провайдера из стороннего компонента
     * @param provider выбранный провайдер
     */
    private onSelectProvider(provider: DealsImportProvider): void {
        this.selectedProvider = provider;
    }
}

/** Форматы поддерживаемых брокеров и отчетов */
export enum DealsImportProvider {
    ALFADIRECT = "ALFADIRECT",
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
    ATON = "ATON",
    QUIK = "QUIK"
}
