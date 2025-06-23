// helpers/api.ts
import axios from 'axios';

export const api = axios.create({
    baseURL: 'https://testzone.cvx-r.cl/backend/backend.php',
    timeout: 10_000,
});
