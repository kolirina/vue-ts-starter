import {Inject} from "typescript-ioc";
import Component from "vue-class-component";
import {TablesService} from "../../services/tablesService";
import {TableHeader} from "../../types/types";
import {CustomDialog} from "./customDialog";

/**
 * Диалог подтверждения
 */
@Component({
  // language=Vue
  template: `
    <v-dialog v-model="showed" max-width="600px">
      <v-card class="table-settings">
        <v-icon class="closeDialog" @click.native="close">close</v-icon>
        <v-card-title class="headline">Настройка колонок</v-card-title>
        <v-card-text class="table-settings-checkbox-wrap">
          <v-layout row>
            <v-flex xs6>
              <template v-for="header in column1">
                <v-checkbox class="table-settings-checkbox" v-if="!header.ghost" :label="header.text" v-model="header.active"></v-checkbox>
              </template>
            </v-flex>
            <v-flex xs6>
              <template v-for="header in column2">
                <v-checkbox class="table-settings-checkbox" v-if="!header.ghost" :label="header.text" v-model="header.active"></v-checkbox>
              </template>
            </v-flex>
          </v-layout>
        </v-card-text>
        <v-card-actions class="dialog-actions">
          <v-btn @click.native="filterHeaders" color="primary" light>ОК</v-btn>
        </v-card-actions>
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