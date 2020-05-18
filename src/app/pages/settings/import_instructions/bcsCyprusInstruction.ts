import {Component, UI} from "../../../app/ui";

@Component({
    // language=Vue
    template: `
        <div>
            Используйте отчеты в формате xls.<br>
            Импорт позволит вам загрузить в сервис сделки, указанные в разделе отчета: 3. TRANSACTIONS
        </div>
    `
})
export class BcsCyprusInstruction extends UI {
}
