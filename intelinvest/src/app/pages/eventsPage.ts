import { Component, Vue } from "vue-property-decorator";
import "../../assets/scss/index.scss";

@Component({
  template: `
    <v-container fluid class="selectable">
      <template v-if="events.length > 0">
        <h2>Events</h2>

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
              <td @click="goToEventDetail(event, index)">{{ event.date }}</td>
              <td @click="goToEventDetail(event, index)">
                {{ event.totalAmount }}
              </td>
              <td @click="goToEventDetail(event, index)">
                {{ event.quantity }}
              </td>
              <td @click="goToEventDetail(event, index)">{{ event.label }}</td>
              <td @click="goToEventDetail(event, index)">
                {{ event.comment }}
              </td>
              <td @click="goToEventDetail(event, index)">{{ event.period }}</td>
            </tr>
          </tbody>
        </table>

        <div v-if="selectedTotals" class="selectedTotals">
          <h3>Сумма по выбранным событиям:</h3>
          <p>{{ selectedTotals }}</p>
        </div>
        <button
          @click="showSelectedTotals"
          :disabled="selectedEvents.length === 0"
        >
          Показать выбранные
        </button>
      </template>

      <template v-else>
        <p>Загрузка событий...</p>
      </template>
    </v-container>
  `,
})
export default class EventsPage extends Vue {
  private events: any[] = [];
  private selectedEvents: number[] = [];
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

  isEventSelected(index: number): boolean {
    return this.selectedEvents.includes(index);
  }

  toggleSelection(index: number, event: Event) {
    event.stopPropagation();
    const eventIndex = this.selectedEvents.indexOf(index);
    if (eventIndex > -1) {
      this.selectedEvents.splice(eventIndex, 1);
    } else {
      this.selectedEvents.push(index);
    }
  }

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

  goToEventDetail(event: any, index: number) {
    const eventDetails = JSON.stringify(event);
    this.$router.push({
      name: "event-detail",
      params: { eventData: eventDetails },
    });
  }
}
