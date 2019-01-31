import Component from "vue-class-component";
import {TableHeader} from "../../types/types";
import {CustomDialog} from "./customDialog";
import {Prop} from "vue-property-decorator";

/**
 * Диалог подтверждения
 */
@Component({
    // language=Vue
    template: `
        <v-dialog v-model="showed" persistent max-width="300px">
            <v-card>
                <v-card-title class="headline">Настройка колонок</v-card-title>
                <v-card-text>
                  
                </v-card-text>
            </v-card>
        </v-dialog>
    `
})
export class TableSettingsDialog extends CustomDialog<TableHeader[], void> {
  mounted() {
    this.callback('asdfa', this.data);
  }
}