import {Inject} from "typescript-ioc";
import Component from "vue-class-component";
import {CustomDialog} from "../../platform/dialogs/customDialog";
import {TablesService} from "../../services/tablesService";
import {TableHeader} from "../../types/types";

/**
 * Диалог подтверждения
 */
@Component({
  // language=Vue
  template: `
    <v-dialog v-model="showed" max-width="600px">
        <v-card class="table-settings composite-dialog">
            <v-icon @click.native="close" class="closeDialog">close</v-icon>
            <v-card-title class="pb-0">
                <span class="dialog-header-text pl-3">Настройка колонок</span>
            </v-card-title>
            <v-card-text class="speaker-settings-content">
                <div class="choose-currency__description mb-3">
                  Выберите колонки для отображения.
                </div>
                <v-layout row>
                    <v-flex xs6>
                        <template v-for="header in column1">
                            <v-checkbox v-if="!header.ghost" :label="header.text" v-model="header.active"></v-checkbox>
                        </template>
                    </v-flex>
                    <v-flex xs6>
                        <template v-for="header in column2">
                            <v-checkbox v-if="!header.ghost" :label="header.text" v-model="header.active"></v-checkbox>
                        </template>
                    </v-flex>
                </v-layout>
            </v-card-text>
            <v-layout class="action-btn pt-0">
                <v-spacer></v-spacer>
                <v-btn @click.native="filterHeaders" color="primary" class="btn">ОК</v-btn>
            </v-layout>
        </v-card>
    </v-dialog>
  `
})
export class TableSettingsDialog extends CustomDialog<TableHeaderData, void> {

  private headers: TableHeader[] = [];
  private column1: TableHeader[] = [];
  private column2: TableHeader[] = [];

  @Inject
  private tablesService: TablesService;

  mounted(): void {
    this.headers = this.data.headers.map(el => ({...el}) );
    this.column1 = this.headers.slice(0, Math.ceil(this.headers.length / 2));
    this.column2 = this.headers.slice(Math.ceil(this.headers.length / 2));
  }

  private filterHeaders(): void {
    this.tablesService.setHeaders(this.data.tableName, this.headers);
    this.close();
  }
}

export interface TableHeaderData {
  tableName: string;
  headers: TableHeader[];
}