import {Component, UI} from "../app/ui";
import axios from "axios";

@Component({
    // language=Vue
    template: `
        <v-container fluid class="selectable">
          main page
          events size: {{ events.length }}
        <!-- todo вывести таблицу с событиями, колонки: Дата (date), Сумма (totalAmount), Количество (quantity), Название (label), Комментарий (comment), Период (period) -->
        </v-container>
    `
})
export class MainPage extends UI {

    private events: any = [];

    async created(): Promise<void> {
        this.events = (await axios.get('http://localhost:3004/events')).data;
    }
}
