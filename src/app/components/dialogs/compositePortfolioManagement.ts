import Component from "vue-class-component";
import {CustomDialog} from "../../platform/dialogs/customDialog";


@Component({
    // language=Vue
    template: `
        <v-dialog v-model="showed" max-width="600px">
            <v-card class="dialog-wrap">
                <v-icon class="closeDialog" @click.native="close">close</v-icon>

                <div class="">
                    <v-card-title>
                        <span class="import-dialog-wrapper__title-text">Формирование составного портфеля</span>
                    </v-card-title>
                    <v-card-text>
                        <div>
                            <p class="import-dialog-wrapper__description-text import-default-text">
                                Произошла ошибка импорта:
                            </p>
                        </div>
                    </v-card-text>
                    <v-card-actions>
                        <v-btn color="primary" dark>
                            Указать текущие остатки
                        </v-btn>
                    </v-card-actions>
                </div>
            </v-card>
        </v-dialog>
    `
})
export class CompositePortfolioManagement extends CustomDialog<CompositePortfolioManagement, void> {

}
