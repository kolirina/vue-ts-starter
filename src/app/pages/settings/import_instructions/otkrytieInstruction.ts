import {Component, UI} from "../../../app/ui";
import {ImageDialog} from "../../../components/dialogs/imageDialog";

@Component({
    // language=Vue
    template: `
        <div>
            Перейдите в личный кабинет брокера, в раздел <b>Отчеты и Налоги</b> → <b>Официальная отчетность</b> → <b>Отчеты и справки</b> →
            Настройте параметры отчета:
            <ul>
                <li>Тип отчета / справки выберите пункт Брокерский отчет</li>
                <li>Выберите нужный инвестиционный счет</li>
                <li>Портфель</li>
                <li>Укажите период</li>
                <li>Укажите формат отчета <strong>xml</strong></li>
                <li>Нажмите кнопку <strong>Заказать отчет / справку</strong></li>
            </ul>

            После успешного формирования отчета он появится в таблице ниже в статусе <b>готово</b>.

            Полученный файл используйте для импорта.

            <div class="import-instructions__gallery">
                <figure>
                    <img :src="IMAGES[0]" alt="0" @click.stop="openImageDialog">
                </figure>
                <figure>
                    <img :src="IMAGES[1]" alt="1" @click.stop="openImageDialog">
                </figure>
            </div>
        </div>
    `
})
export class OtkrytieInstruction extends UI {

    private IMAGES: string[] = [
        "./img/import_instructions/otkrytie/1.png",
        "./img/import_instructions/otkrytie/2.png"
    ];

    private async openImageDialog(): Promise<void> {
        await new ImageDialog().show((event as any).target.attributes[0].nodeValue);
    }
}
