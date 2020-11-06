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
import {Component} from "../../app/ui";
import {CustomDialog} from "../../platform/dialogs/customDialog";

/**
 * Диалог подтверждения
 */
@Component({
    // language=Vue
    template: `
        <v-dialog v-model="showed" max-width="400px" closable>
            <v-card class="dialog-wrap">
                <v-icon class="closeDialog" @click.native="close">close</v-icon>

                <v-card-title class="headline">Добавление категории</v-card-title>
                <v-card-text>
                    <v-text-field label="Название категории" v-model="categoryName" :counter="50" ref="input"
                                  v-validate="'required|max:50'" :error-messages="errors.collect('categoryName')" name="categoryName"
                                  @keydown.enter="closeDialog"></v-text-field>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="primary" @click.native="closeDialog">Добавить</v-btn>
                    <v-btn @click.native="close">Отмена</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    `
})
export class CreateTagCategoryDialog extends CustomDialog<void, string> {

    $refs: {
        input: any;
    };

    private categoryName = "";

    mounted(): void {
        setTimeout(() => {
            try {
                this.$refs.input?.$refs?.input?.focus();
            } catch (e) {
                // mute
            }
        });
    }

    private async closeDialog(): Promise<void> {
        this.$validator.errors.clear();
        const valid = await this.$validator.validateAll();
        if (!valid) {
            return;
        }
        this.close(this.categoryName);
    }

}
