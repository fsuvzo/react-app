export interface Cliente {
    id: number;
    nombre_cliente: string;
    nombre_bd: string;
    ciudad_cliente: string;
    puerto_bd: number | null;
    puerto_escucha: number | null;
    habilitado: 0 | 1;
}
export interface ClienteApiPayload {
    nombre_cliente: string;
    nombre_bd: string;
    ciudad_cliente: string;
    puerto_bd: number;
    puerto_escucha: number;
    habilitado: 0 | 1;
    id_cliente_intranet: number;
}

export interface ClienteApiPayloadEdit extends ClienteApiPayload {
    id: number;
}

export interface ClienteApiRaw {
    id: string | number;
    nombre_cliente: string;
    nombre_bd: string;
    ciudad_cliente: string;
    puerto_bd?: string | number | null;
    puerto_escucha?: string | number | null;
    habilitado: string | number;
}

export interface ClienteForm {
    nombre_cliente: string;
    nombre_bd: string;
    ciudad_cliente: string;
    puerto_bd: string;
    puerto_escucha: string;
    habilitado: 0 | 1;
    id_cliente_intranet: string;
}

export interface ApiSuccess<T = unknown> {
    success: true;
    data: T;
    message: string;
}

export interface ApiError {
    success: false;
    message: string;
}

export interface Ciudad {
    id: number;
    ciudad: string;
}

