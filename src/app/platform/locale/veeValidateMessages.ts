const messages = {
    after: (field: string, target?: string) => `В поле должна быть дата после ${target}.`,
    alpha_dash: (field: string) => `Поле может содержать только буквы, цифры и дефис.`,
    alpha_num: (field: string) => `Поле может содержать только буквы и цифры.`,
    alpha_spaces: (field: string) => `Поле может содержать только буквы и пробелы.`,
    alpha: (field: string) => `Поле может содержать только буквы.`,
    before: (field: string, target?: string) => `В поле должна быть дата до ${target}.`,
    between: (field: string, min?: number, max?: number) => `Поле должно быть между ${min} и ${max}.`,
    confirmed: (field: string, confirmedField?: string) => `Поле не совпадает с ${confirmedField}.`,
    credit_card: (field: string) => `Поле должно быть действительным номером карты`,
    date_between: (field: string, min?: number, max?: number) => `Поле должно быть между ${min} и ${max}.`,
    date_format: (field: string, format?: string) => `Поле должно быть в формате ${format}.`,
    decimal: (field: string, [decimals = "*"] = []) => `Поле должно быть числовым и может содержать ${decimals === "*"
        ? "" : decimals} десятичных числа.`,
    digits: (field: string, length?: number) => `Поле должно быть числовым и точно содержать ${length} цифры.`,
    dimensions: (field: string, width?: number, height?: number) => `Поле должно быть ${width} пикселей на ${height} пикселей.`,
    email: (field: string) => `Поле должно быть действительным электронным адресом.`,
    ext: (field: string, [...args]) => `Поле должно быть действительным файлом. (${args})`,
    image: (field: string) => `Поле должно быть изображением.`,
    in: (field: string) => `Поле должно быть допустимым значением.`,
    ip: (field: string) => `Поле должно быть действительным IP-адресом.`,
    max: (field: string, length?: number) => `Поле не может быть более ${length} символов.`,
    max_value: (field: string, max?: number) => `Поле должно быть ${max} или менее.`,
    mimes: (field: string, [...args]) => `Поле должно иметь действительный тип файла. (${args})`,
    min: (field: string, length?: number) => `Поле должно быть не менее ${length} символов.`,
    min_value: (field: string, min?: number) => `Поле должно быть ${min} или больше.`,
    not_in: (field: string) => `Поле должно быть допустимым значением.`,
    numeric: (field: string) => `Поле должно быть числом.`,
    regex: (field: string) => `Поле имеет ошибочный формат.`,
    required: (field: string) => `Поле обязательно для заполнения.`,
    size: (field: string, size?: number) => `Поле должно быть меньше, чем ${size}.`,
    url: (field: string) => `Поле имеет ошибочный формат URL.`
};

export const ruLocale = {
    name: "ru",
    messages,
    attributes: {}
};