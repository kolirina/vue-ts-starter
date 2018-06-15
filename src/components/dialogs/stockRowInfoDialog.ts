import {UI} from "../../app/UI";
import Component from "vue-class-component";
import {Prop, Watch} from "vue-property-decorator";
import {StockPortfolioRow} from "../../types/types";

@Component({
    // language=Vue
    template: `
        <v-dialog v-if="dialog" v-model="dialog" max-width="500px">
            <v-card>
                <v-card-title>
                    <span class="headline">Информация по позиции</span>
                </v-card-title>
                <v-card-text>
                    <v-container grid-list-md>
                        <v-layout wrap>
                            <v-flex xs12 sm6 md4>
                                {{ 'Вы держите акцию в портфеле:' + item.ownedDays + ' дня c ' + item.firstBuy }}
                            </v-flex>
                            <v-flex xs12 sm6 md4>
                                {{ 'Количество полных лотов' + item.lotCounts }}
                            </v-flex>
                        </v-layout>
                    </v-container>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" flat @click.native="close">Cancel</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    `
})
export class StockRowInfoDialog extends UI {

    @Prop({default: false, type: Boolean})
    private value: boolean;

    @Prop()
    private item: StockPortfolioRow;

    private dialog = false;

    private mounted(): void {
        this.dialog = this.value;
    }

    @Watch("value", {immediate: true})
    private onShowedChange(newValue: boolean): void {
        console.log("SHOWED>>>>", newValue);
        this.dialog = newValue;
    }

    private close(): void {
        this.dialog = false;
    }
}