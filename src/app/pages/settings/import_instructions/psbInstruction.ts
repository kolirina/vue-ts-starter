import Component from "vue-class-component";
import {UI} from "../../../app/ui";

@Component({
    // language=Vue
    template: `
        <div>
            <p class="import-default-text">
                Для импорта вы можете использовать отчеты, присылаемые брокером вам на электронную почту в формате xls.
                <br/>
                Для получения отчета за произвольный или весь период ведения счета обратитесь к вашему персональному менеджеру, отправив
                письмо с просьбой, и указав следующие детали:
                <div class="import-format-requirements-ul">
                    <ul>
                        <li>параметры счета (№ XXX/ИИС)</li>
                        <li>дату начала отчета (01.01.2016)</li>
                        <li>ФИО Владельца</li>
                    </ul>
                </div>
                <div class="import-format-requirements-ul">
                    Полученный файл используйте для импорта.
                </div>
            </p>
        </div>
    `
})
export class PsbInstruction extends UI {
}
