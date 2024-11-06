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
            <tr v-for="event in events" :key="event.id">
              <td>
                <input
                  type="checkbox"
                  :checked="isEventSelected(event.id)"
                  @change="toggleSelection(event.id, $event)"
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
  private selectedEvents: Set<number> = new Set();
  private selectedTotals: string | null = null;

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

  isEventSelected(eventId: number): boolean {
    return this.selectedEvents.has(eventId);
  }

  toggleSelection(eventId: number, event: Event) {
    event.stopPropagation();
    if (this.selectedEvents.has(eventId)) {
      this.selectedEvents.delete(eventId);
    } else {
      this.selectedEvents.add(eventId);
    }
  }

  showSelectedTotals() {
    const selectedEventsData = this.events.filter((event) =>
      this.selectedEvents.has(event.id)
    );

    const totals: { [key: string]: number } = {};

    selectedEventsData.forEach((event) => {
      if (!totals[event.type]) {
        totals[event.type] = 0;
      }
      totals[event.type] += event.totalAmount;
    });

    this.selectedTotals = Object.entries(totals)
      .map(([type, total]) => `${type}: ${total}`)
      .join(", ");
  }
}
