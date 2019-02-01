import Component from "vue-class-component";
import { TableHeader } from "../../types/types";
import { CustomDialog } from "./customDialog";
import { Prop } from "vue-property-decorator";

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
          <template v-for="header in data">
            <v-checkbox v-if="!header.ghost" :label="header.text" v-model="header.active" @change="onCheckboxChange()"></v-checkbox>
          </template>
        </v-card-text>
      </v-card>
    </v-dialog>
  `
})
export class TableSettingsDialog extends CustomDialog<TableHeader[], void> {
  onCheckboxChange() {
    console.log(this.headers);
  }
}
