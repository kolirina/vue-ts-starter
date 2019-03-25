const messages = {
    after: (field: string, target?: string): string => `В поле должна быть дата после ${target}.`,
    alpha_dash: (field: string): string => `Поле может содержать только буквы, цифры и дефис.`,
    alpha_num: (field: string): string => `Поле может содержать только буквы и цифры.`,
    alpha_spaces: (field: string): string => `Поле может содержать только буквы и пробелы.`,
    alpha: (field: string): string => `Поле может содержать только буквы.`,
    before: (field: string, target?: string[]): string => {
        const inclusive = !!target[1];
        return `В поле дата должна быть меньше ${inclusive ? "или равна" : ""} ${target[0]}.`;
    },
    between: (field: string, min?: number, max?: number): string => `Поле должно быть между ${min} и ${max}.`,
    confirmed: (field: string, confirmedField?: string): string => `Поле не совпадает с ${confirmedField}.`,
    credit_card: (field: string): string => `Поле должно быть действительным номером карты`,
    date_between: (field: string, min?: number, max?: number): string => `Поле должно быть между ${min} и ${max}.`,
    date_format: (field: string, format?: string): string => `Поле должно быть в формате ${format}.`,
    decimal: (field: string, [decimals = "*"] = []): string => `Поле должно быть числовым и может содержать ${decimals === "*"
        ? "" : decimals} десятичных числа.`,
    digits: (field: string, length?: number): string => `Поле должно быть числовым и точно содержать ${length} цифры.`,
    dimensions: (field: string, width?: number, height?: number): string => `Поле должно быть ${width} пикселей на ${height} пикселей.`,
    email: (field: string): string => `Поле должно быть действительным электронным адресом.`,
    ext: (field: string, [...args]): string => `Поле должно быть действительным файлом. (${args})`,
    image: (field: string): string => `Поле должно быть изображением.`,
    in: (field: string): string => `Поле должно быть допустимым значением.`,
    ip: (field: string): string => `Поле должно быть действительным IP-адресом.`,
    max: (field: string, length?: number): string => `Поле не может быть более ${length} символов.`,
    max_value: (field: string, max?: number): string => `Поле должно быть ${max} или менее.`,
    mimes: (field: string, [...args]): string => `Поле должно иметь действительный тип файла. (${args})`,
    min: (field: string, length?: number): string => `Поле должно быть не менее ${length} символов.`,
    min_value: (field: string, min?: number): string => `Поле должно быть ${min} или больше.`,
    not_in: (field: string): string => `Поле должно быть допустимым значением.`,
    numeric: (field: string): string => `Поле должно быть числом.`,
    regex: (field: string): string => `Поле имеет ошибочный формат.`,
    required: (field: string): string => `Поле обязательно для заполнения.`,
    size: (field: string, size?: number): string => `Поле должно быть меньше, чем ${size}.`,
    url: (field: string): string => `Поле имеет ошибочный формат URL.`
};

export const ruLocale = {
    name: "ru",
    messages,
    attributes: {}
};
