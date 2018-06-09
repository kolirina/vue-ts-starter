import axios from 'axios';

export const HTTP = axios.create({
    baseURL: `http://test.intelinvest.ru/api/`,
    headers: {
        Authorization: 'Bearer {token}'
    }
});