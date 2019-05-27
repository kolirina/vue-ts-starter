import Component from "vue-class-component";
import {CustomDialog} from "../../platform/dialogs/customDialog";
import {PortfolioParams} from "../../services/portfolioService";
import {TableHeader} from "../../types/types";

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
                    <div class="btn-days-select-wrapper pl-3 pt-4 margB30">
                        <v-btn-toggle v-model="selectedDays" multiple light>
                            <v-btn v-for="day in data.days" :value="day" :key="day" depressed class="btn-item">
                                {{ day }}
                            </v-btn>
                        </v-btn-toggle>
                    </div>
                    <div class="pl-3">
                        <v-data-table v-if="data.portfolios"
                                    :items="data.portfolios"
                                    v-model="backupPortfolio.selectedPortfolios"
                                    item-key="id"
                                    select-all hide-actions
                                    class="portfolio-choose-table">
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
                                    <div class="pr-0">
                                        <v-checkbox v-model="props.selected" primary hide-details></v-checkbox>
                                    </div>
                                    <div class="text-xs-left pl-0">{{ props.item.name }}</div>
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
export class BackupPortfolioDialog extends CustomDialog<BackupPortfolioData, BackupPortfolio> {

    private backupPortfolio: BackupPortfolio = {
        selectedDaysInner: [],
        selectedPortfolios: []
    };

    mounted(): void {
        this.backupPortfolio.selectedDaysInner = this.data.selectedDaysInner;
        this.backupPortfolio.selectedPortfolios = this.data.selectedPortfolios;
    }

    private toggleAll(): void {
        if (this.backupPortfolio.selectedPortfolios.length) {
            this.backupPortfolio.selectedPortfolios = [];
        } else {
            this.backupPortfolio.selectedPortfolios = this.data.portfolios;
        }
    }

    private get selectedDays(): string[] {
        return this.backupPortfolio.selectedDaysInner;
    }

    private set selectedDays(newValue: string[]) {
        if (newValue.length === 0) {
            return;
        }
        this.backupPortfolio.selectedDaysInner = newValue;
    }

    private applyConfig(): void {
        this.close(this.backupPortfolio);
    }
}

export type BackupPortfolioData = {
    portfolios: PortfolioParams[];
    days: string[];
    selectedDaysInner: string[];
    selectedPortfolios: PortfolioParams[];
};

export type BackupPortfolio = {
    selectedDaysInner: string[];
    selectedPortfolios: PortfolioParams[];
};