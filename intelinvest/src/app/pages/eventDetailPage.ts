import { Component, Vue } from "vue-property-decorator";

@Component({
  template: `
    <v-container class="details-container">
      <h2>Детали события</h2>
      <div v-if="event">
        <p><strong>Дата:</strong> {{ event.date }}</p>
        <p><strong>Сумма:</strong> {{ event.totalAmount }}</p>
        <p><strong>Количество:</strong> {{ event.quantity }}</p>
        <p><strong>Название:</strong> {{ event.label }}</p>
        <p><strong>Комментарий:</strong> {{ event.comment }}</p>
        <p><strong>Период:</strong> {{ event.period }}</p>
      </div>
      <button @click="goToEvents">Назад</button>
      <div v-else>
        <p>Загрузка...</p>
      </div>
    </v-container>
  `,
})
export default class EventDetailPage extends Vue {
  private event: any = null;

  created() {
    const eventData = this.$route.query.eventData;
    if (eventData) {
      const eventDataString = Array.isArray(eventData)
        ? eventData[0]
        : eventData;
      this.event = JSON.parse(eventDataString);
    }
  }
  goToEvents() {
    this.$router.push({
      name: "events",
    });
  }
}
