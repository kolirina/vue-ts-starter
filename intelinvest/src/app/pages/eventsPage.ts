import { Component, Vue } from "vue-property-decorator";

@Component({
  template: `
    <v-container fluid class="selectable">
      <template v-if="events.length > 0">
        <h2>Events page events size: {{ events.length }}</h2>
        <table
          border="1"
          style="width: 100%; border-collapse: collapse; margin-bottom: 20px;"
        >
          <thead>
            <tr>
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
              <td>{{ event.date }}</td>
              <td>{{ event.totalAmount }}</td>
              <td>{{ event.quantity }}</td>
              <td>{{ event.label }}</td>
              <td>{{ event.comment }}</td>
              <td>{{ event.period }}</td>
            </tr>
          </tbody>
        </table>
      </template>
      <template v-else>
        <p>Загрузка событий...</p>
      </template>
    </v-container>
  `,
})
export default class EventsPage extends Vue {
  private events: any[] = [];

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
}
