import Component from "vue-class-component";
import {UI} from "../../../app/ui";

@Component({
    // language=Vue
    template: `
        <div>
            <p class="import-default-text">
                Используйте отчеты в формате xls.
                Импорт позволит вам загрузить в сервис сделки, указанные в разделе отчета: 3. TRANSACTIONS
            </p>
        </div>
    `
})
export class BcsCyprusInstruction extends UI {
}
