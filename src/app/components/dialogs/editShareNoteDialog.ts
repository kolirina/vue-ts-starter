/*
 * STRICTLY CONFIDENTIAL
 * TRADE SECRET
 * PROPRIETARY:
 *       "Intelinvest" Ltd, TIN 1655386205
 *       420107, REPUBLIC OF TATARSTAN, KAZAN CITY, SPARTAKOVSKAYA STREET, HOUSE 2, ROOM 119
 * (c) "Intelinvest" Ltd, 2018
 *
 * СТРОГО КОНФИДЕНЦИАЛЬНО
 * КОММЕРЧЕСКАЯ ТАЙНА
 * СОБСТВЕННИК:
 *       ООО "Интеллектуальные инвестиции", ИНН 1655386205
 *       420107, РЕСПУБЛИКА ТАТАРСТАН, ГОРОД КАЗАНЬ, УЛИЦА СПАРТАКОВСКАЯ, ДОМ 2, ПОМЕЩЕНИЕ 119
 * (c) ООО "Интеллектуальные инвестиции", 2018
 */
import Component from "vue-class-component";
import {CustomDialog} from "../../platform/dialogs/customDialog";
import {ShareType} from "../../types/types";

/**
 * Диалог подтверждения
 */
@Component({
    // language=Vue
    template: `
        <v-dialog v-model="showed" max-width="600px">
            <v-card class="dialog-wrap">
                <v-icon class="closeDialog" @click.native="close">close</v-icon>

                <v-card-title class="headline">{{ title }} {{ data.ticker }}</v-card-title>
                <v-card-text>
                    <v-textarea v-model="data.note" autofocus @keydown.ctrl.enter="close(data)"></v-textarea>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="primary" @click.native="close(data)">Сохранить</v-btn>
                    <v-btn @click.native="close">Отмена</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    `
})
export class EditShareNoteDialog extends CustomDialog<EditShareNoteDialogData, EditShareNoteDialogData> {

    private get title(): string {
        return `Заметка к ${this.data.shareType === ShareType.ASSET ? "активу" : "бумаге"}`;
    }
}

export interface EditShareNoteDialogData {
    ticker: string;
    note: string;
    shareType: ShareType;
}