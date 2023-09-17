import {Component, UI} from "@intelinvest/platform/src/app/ui";

@Component({
    // language=Vue
    template: `
          <v-container fluid class="selectable">
          <template label="Delete me in realization">
                Events page
                events size: {{ events.length }}<br/>
                <pre>
                    todo вывести таблицу с событиями, колонки: Дата (date), Сумма (totalAmount), Количество (quantity), Название (label), Комментарий (comment), Период (period)
                </pre>
          </template>
          <!-- todo вывести таблицу с событиями, колонки: Дата (date), Сумма (totalAmount), Количество (quantity), Название (label), Комментарий (comment), Период (period) -->
          </v-container>
    `
})
export class EventsPage extends UI {

    private events: any = [];

    async created(): Promise<void> {
        const params = {
            method: "GET",
            headers: {
                "Content-Type": "application/json;charset=UTF-8"
            }
        };
        const response = await fetch("http://localhost:3004/events", params);
        this.events = await response.json();
    }
}
