import { Component, Vue } from "vue-property-decorator";

@Component({
  template: `
    <v-container fluid class="selectable">
      <template v-if="events.length > 0">
        <h2>Events page events size: {{ events.length }}</h2>

        <table
          class="events-table"
          style="width: 100%; border-collapse: collapse; margin-bottom: 20px; text-align: center;"
        >
          <thead>
            <tr>
              <th>Выбор</th>
              <th>Дата</th>
              <th>Сумма</th>
              <th>Количество</th>
              <th>Название</th>
              <th>Комментарий</th>
              <th>Период</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(event, index) in events" :key="index">
              <td>
                <input
                  type="checkbox"
                  :checked="isEventSelected(index)"
                  @change="toggleSelection(index, $event)"
                />
              </td>
              <td>{{ event.date }}</td>
              <td>{{ event.totalAmount }}</td>
              <td>{{ event.quantity }}</td>
              <td>{{ event.label }}</td>
              <td>{{ event.comment }}</td>
              <td>{{ event.period }}</td>
            </tr>
          </tbody>
        </table>

        <button
          @click="showSelectedTotals"
          :disabled="selectedEvents.length === 0"
        >
          Показать выбранные
        </button>

        <div v-if="selectedTotals">
          <h3>Сумма по выбранным событиям:</h3>
          <p>{{ selectedTotals }}</p>
        </div>
      </template>

      <template v-else>
        <p>Загрузка событий...</p>
      </template>
    </v-container>
  `,
})
export default class EventsPage extends Vue {
  private events: any[] = [];
  private selectedEvents: number[] = []; // Массив для хранения индексов выбранных событий
  private selectedTotals: string | null = null;

  // Асинхронная загрузка событий при создании компонента
  async created(): Promise<void> {
    const params = {
      method: "GET",
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
      },
    };
    try {
      const response = await fetch("http://localhost:3004/events", params);
      if (response.ok) {
        this.events = await response.json();
      } else {
        console.error("Ошибка при загрузке данных", response.status);
      }
    } catch (error) {
      console.error("Ошибка при запросе к серверу", error);
    }
  }

  // Проверяем, выбран ли конкретный элемент
  isEventSelected(index: number): boolean {
    return this.selectedEvents.includes(index);
  }

  // Обрабатываем изменение чекбокса
  toggleSelection(index: number, event: Event) {
    event.stopPropagation(); // Останавливаем всплытие события
    const eventIndex = this.selectedEvents.indexOf(index);
    if (eventIndex > -1) {
      // Если элемент уже выбран, снимаем выбор
      this.selectedEvents.splice(eventIndex, 1);
    } else {
      // Если элемент не выбран, добавляем в массив
      this.selectedEvents.push(index);
    }
  }

  // Метод для суммирования выбранных событий по типам
  showSelectedTotals() {
    const selectedEventsData = this.events.filter((_, index) =>
      this.selectedEvents.includes(index)
    );

    const totals: { [key: string]: number } = {};

    selectedEventsData.forEach((event) => {
      if (!totals[event.type]) {
        totals[event.type] = 0;
      }
      totals[event.type] += Number(event.totalAmount.split(" ")[1]);
    });

    this.selectedTotals = Object.entries(totals)
      .map(([type, total]) => `${type}: ${total}`)
      .join(", ");
  }
}
