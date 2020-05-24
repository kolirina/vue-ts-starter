import {Component, UI} from "../../../app/ui";
import {ImageDialog} from "../../../components/dialogs/imageDialog";

@Component({
    // language=Vue
    template: `
        <div>
            Отчеты из терминала QUIK это универсальный вариант, подходящий к разным<br>
            брокерам, которые дают возможность загрузить отчет через терминал.
            <div class="import-default-text-margin-t">Для получения файла импорта в терминале QUIK</div>
            Перейдите в меню <b>Расширения</b> → <b>Отчеты</b> → <b>Отчет по всем сделкам клиента</b>
            Сформируйте отчет за требуемый вам период.
            Полученный файл используйте для импорта.<br/>
            Если у Вас отсутствует в приложении данный пункт меню, значит брокер отключил получение отчетов через QUIK,
            обратитесь в техническу поддержку брокера для получения отчета по сделкам.

            <div class="info-block">
                Отчеты из терминала не включают в себя движение денежных средств, рекомендуем после импорта внести соответствующие сделки
                Зачисления на брокерский счет и списания
            </div>

            <div class="import-instructions__gallery">
                <figure>
                    <img :src="IMAGES[0]" alt="5" @click.stop="openImageDialog">
                </figure>
                <figure>
                    <img :src="IMAGES[1]" alt="6" @click.stop="openImageDialog">
                </figure>
                <figure>
                    <img :src="IMAGES[2]" alt="6" @click.stop="openImageDialog">
                </figure>
            </div>
        </div>
    `
})
export class QuikInstruction extends UI {

    private IMAGES: string[] = [
        "./img/import_instructions/quik/1.png",
        "./img/import_instructions/quik/2.png",
        "./img/import_instructions/quik/3.png"
    ];

    private async openImageDialog(): Promise<void> {
        await new ImageDialog().show((event as any).target.attributes[0].nodeValue);
    }
}
