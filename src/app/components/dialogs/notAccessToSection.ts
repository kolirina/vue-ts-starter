import Component from "vue-class-component";
import {VueRouter} from "vue-router/types/router";
import {BtnReturn, CustomDialog} from "../../platform/dialogs/customDialog";

@Component({
    template: `
        <v-dialog v-model="showed" max-width="600px" ref="dialog" persistent :closable="false">
            <v-card class="dialog-wrap pa-5">
                <v-icon class="closeDialog" @click.native="close">close</v-icon>
                <v-layout justify-center class="wrap-registration-form">
                    <v-layout class="maxW275" column>
                        <div class="fs18 alignC mb-5">Данный функционал доступен на тарифе Профессионал.</div>
                        <div class="alignC mt-3">
                            <v-btn @click="tariffs" color="primary sign-btn maxW275">Перейти в раздел тарифов</v-btn>
                        </div>
                    </v-layout>
                </v-layout>
            </v-card>
        </v-dialog>
    `
})
export class NotAccessToSection extends CustomDialog<VueRouter, BtnReturn> {
    private tariffs(): void {
        this.data.push({path: "/settings/tariffs"});
        this.close();
    }
}
