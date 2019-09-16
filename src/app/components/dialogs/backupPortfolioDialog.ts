import dayjs from "dayjs";
import Component from "vue-class-component";
import {CustomDialog} from "../../platform/dialogs/customDialog";
import {PortfolioParams} from "../../services/portfolioService";
import {PortfolioBackup} from "../../types/types";

@Component({
    // language=Vue
    template: `
        <v-dialog v-model="showed" max-width="600px">
            <v-card class="dialog-wrap">
                <v-icon class="closeDialog" @click.native="close">close</v-icon>
                <v-card-title class="pb-3">
                    <span class="dialog-header-text pl-3">Настройка бэкапа портфеля</span>
                </v-card-title>
                <v-card-text class="pt-0 fs14">
                    <div class="pl-3">
                        Отправка бэкапов осуществляется по выбранным дням в 9:30 минут.
                    </div>
                    <div class="btn-days-select-wrapper pl-3 margB30">
                        <v-btn-toggle v-model="selectedDaysInner" multiple light>
                            <v-btn v-for="day in days" :value="day" :key="day" depressed class="btn-item">
                                {{ getLabel(day) }}
                            </v-btn>
                        </v-btn-toggle>
                    </div>
                    <div class="pl-3">
                        <v-data-table v-if="data.portfolios"
                                      :items="data.portfolios"
                                      v-model="selectedPortfolios"
                                      item-key="id"
                                      select-all hide-actions
                                      class="data-table portfolio-choose-table">
                            <template v-slot:headers="props">
                                <v-layout align-center>
                                    <v-checkbox
                                            :input-value="props.all"
                                            :indeterminate="props.indeterminate"
                                            primary
                                            hide-details
                                            @click.stop="toggleAll"
                                            class="select-all fg-0"
                                    ></v-checkbox>
                                    <i v-if="props.all" class="exp-panel-arrow select-all-icon"></i>
                                    <i v-else class="exp-panel-arrow none-select-all-icon"></i>
                                </v-layout>
                            </template>
                            <template #items="props">
                                <v-layout align-center>
                                    <div>
                                        <v-checkbox v-model="props.selected" :label="props.item.name" primary hide-details class="portfolio-choose-checkbox"></v-checkbox>
                                    </div>
                                </v-layout>
                            </template>
                        </v-data-table>
                    </div>
                </v-card-text>
                <v-card-actions class="pr-3">
                    <v-spacer></v-spacer>
                    <div class="pr-3 pb-3">
                        <v-btn color="primary" @click.native="applyConfig()" dark>
                            Сохранить
                        </v-btn>
                    </div>
                </v-card-actions>
            </v-card>
        </v-dialog>
    `
})
export class BackupPortfolioDialog extends CustomDialog<BackupPortfolioData, PortfolioBackup> {

    /** Дни для выбора расписания */
    private days: number[] = [2, 3, 4, 5, 6, 7, 1];
    /** Выбранный день по умолчанию */
    private selectedDaysInner: number[] = [7];
    /** Список параметров всех портфелей */
    private selectedPortfolios: PortfolioParams[] = [];

    mounted(): void {
        this.selectedDaysInner = [...this.data.portfolioBackup.days];
        this.selectedPortfolios = this.data.portfolios.filter(portfolio => this.data.portfolioBackup.portfolioIds.includes(portfolio.id));
    }

    private toggleAll(): void {
        if (this.selectedPortfolios.length) {
            this.selectedPortfolios = [];
        } else {
            this.selectedPortfolios = this.data.portfolios;
        }
    }

    private applyConfig(): void {
        const portfolioIds = this.selectedPortfolios.map(portfolio => portfolio.id);
        const portfolioBackup: PortfolioBackup = {id: this.data.portfolioBackup.id, days: this.selectedDaysInner, portfolioIds};
        this.close(portfolioBackup);
    }

    private getLabel(index: number): string {
        const chars = dayjs().day(index - 1).format("ddd").split("");
        return `${chars[0].toUpperCase()}${chars[1]}`;
    }
}

export type BackupPortfolioData = {
    portfolios: PortfolioParams[];
    portfolioBackup: PortfolioBackup;
};