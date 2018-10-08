import Component from 'vue-class-component';
import {namespace} from 'vuex-class/lib/bindings';
import {UI} from '../../app/UI';
import {ClientInfo} from '../../types/types';
import {StoreType} from '../../vuex/storeType';

const MainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
        <v-container fluid>
            Импорт и экспорт
            <v-card>
                <v-card-text>

                </v-card-text>
            </v-card>
        </v-container>
    `
})
export class ExportPage extends UI {

    @MainStore.Getter
    private clientInfo: ClientInfo;

    private async mounted(): Promise<void> {
    }

    private onChange(file: any, fileList: any): void {
        console.log(file, fileList);
    }
}
