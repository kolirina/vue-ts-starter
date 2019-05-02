import {Inject} from "typescript-ioc";
import Component from "vue-class-component";
import {ShowProgress} from "../../platform/decorators/showProgress";
import {CustomDialog} from "../../platform/dialogs/customDialog";
import {ClientInfo} from "../../services/clientService";
import {Share} from "../../types/types";

/**
 * Диалог обратной связи
 */
@Component({
    // language=Vue
    template: `
        <v-dialog v-model="showed" max-width="600px">
            <v-card class="dialog-wrap">
                <v-icon class="closeDialog" @click.native="close">close</v-icon>

                <v-card-title class="pb-3">
                    <span class="dialog-header-text pl-3">Популярные бумаги</span>
                </v-card-title>
                <v-card-text class="pt-0">
                    <v-layout wrap class="px-3">
                        <v-flex v-for="paper in topPapers" :key="paper.ticker" xs12 sm6 md4 lg2>
                            <div @click="setPaper(paper)">
                                <v-chip class="fs14 top-paper-item">{{ paper.ticker }}</v-chip>
                            </div>
                        </v-flex>
                    </v-layout>
                </v-card-text>
                <v-card-actions class="pr-3">
                    <v-spacer></v-spacer>
                    <div class="pr-3">
                        <v-btn color="primary" @click.native="close" dark>
                            Закрыть
                        </v-btn>
                    </div>
                </v-card-actions>

            </v-card>
        </v-dialog>
    `
})
export class PopularPaperDialog extends CustomDialog<topStockParams, Share> {

    private share: Share = null;

    private topPapers: Share[] = [];

    /**
     * Инициализация данных диалога
     * @inheritDoc
     */
    mounted(): void {
        this.topPapers = this.data.topPapers;
    }

    private setPaper(paper: Share): void {
        this.close(paper);
    }

}

type topStockParams = {
    topPapers: Share[]
};