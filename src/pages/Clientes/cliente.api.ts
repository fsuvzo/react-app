import {
    ClienteApiPayload,
    ClienteApiPayloadEdit,
    ApiSuccess,
    Cliente,
    ClienteApiRaw,
} from './cliente.types';
import { api } from '@/helpers/api';
import { mapRawToCliente } from './cliente.utils';

import { Ciudad } from './cliente.types';
/* ===========================================================
   fetchClientes – con logs para depuración
   =========================================================== */

export const fetchClientes = async (): Promise<Cliente[]> => {
    const { data } = await api.get<ApiSuccess<ClienteApiRaw[]>>('', {
        params: { action: 'get_clientes' },          // ← sin filtro
    });
    if (!data.success) throw new Error(data.message);
    return data.data.map(mapRawToCliente);
};

/* ── B. solo habilitados ───────────────────────────────── */
export const fetchClientesActivos = async (): Promise<Cliente[]> => {
    const { data } = await api.get<ApiSuccess<ClienteApiRaw[]>>('', {
        params: { action: 'get_cliente', habilitado: '1' },
    });
    if (!data.success) throw new Error(data.message);
    return data.data.map(mapRawToCliente);
};

export const insertCliente = async (
    payload: ClienteApiPayload,
): Promise<ApiSuccess> => {
    console.log('[insertCliente] payload:', payload);
    const { data } = await api.post<ApiSuccess>('', payload, {
        params: { action: 'insert_cliente' },
    });
    return data;
};

export const updateCliente = async (
    payload: ClienteApiPayloadEdit,
): Promise<ApiSuccess> => {
    console.log('[updateCliente] payload:', payload);
    const { data } = await api.post<ApiSuccess>('', payload, {
        params: { action: 'update_cliente' },
    });
    return data;
};

export const toggleHabilitado = async (
    id: number,
    habilitado: 0 | 1,
): Promise<void> => {
    console.log('[toggleHabilitado] id/habilitado:', id, habilitado);
    await api.post(
        '',
        { id, habilitado },
        { params: { action: 'cambiar_estado_cliente' } },
    );
};


export const fetchCiudades = async (): Promise<Ciudad[]> => {
    const { data } = await api.get<ApiSuccess<Ciudad[]>>('', {
        params: { action: 'ciudades' },
    });
    if (!data.success) throw new Error(data.message);
    return data.data;
};
