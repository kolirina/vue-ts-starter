import Component from "vue-class-component";
import {CustomDialog} from "../../platform/dialogs/customDialog";
import {Share} from "../../types/types";

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
                        <v-flex v-for="paper in data" :key="paper.ticker" xs12 sm6 md4 lg2>
                            <div @click="close(paper)">
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
export class PopularPaperDialog extends CustomDialog<Share[], Share> {

    private topPapers: Share[] = [];

}