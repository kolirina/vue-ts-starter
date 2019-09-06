/*
 * STRICTLY CONFIDENTIAL
 * TRADE SECRET
 * PROPRIETARY:
 *       "Intelinvest" Ltd, TIN 1655386205
 *       420107, REPUBLIC OF TATARSTAN, KAZAN CITY, SPARTAKOVSKAYA STREET, HOUSE 2, ROOM 119
 * (c) "Intelinvest" Ltd, 2019
 *
 * ������ ���������������
 * ������������ �����
 * �����������:
 *       ��� "���������������� ����������", ��� 1655386205
 *       420107, ���������� ���������, ����� ������, ����� �������������, ��� 2, ��������� 119
 * (c) ��� "���������������� ����������", 2019
 */

export class Tours {

    static readonly INTRO_STEPS: TourStep[] = [
        {
            target: `[data-v-step="0"]`,
            content: "Добро пожаловать в Intelinvest - сервис учёта и контроля инвестиций.Чтобы начать заполнять свой портфель,кликните на эту кнопку и загрузите отчёт о сделках вашего брокера.",
            params: {
                placement: "top"
            }
        },
        {
            target: `[data-v-step="1"]`,
            content: "Try it, you'll love it!<br>You can put HTML in the steps and completely customize the DOM to suit your needs.",
            params: {
                placement: "top"
            }
        },
        {
            target: `[data-v-step="2"]`,
            content: "Try it, you'll love it!<br>You can put HTML in the steps and completely customize the DOM to suit your needs.",
            params: {
                placement: "top"
            }
        }
    ];
}

export interface TourStep {
    target: string;
    content: string;
    params?: TourStepParams;
}

export interface TourStepParams {
    placement?: string;
}