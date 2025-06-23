export interface EquipoGPS {
    id: number;
    modelo: string;
    estado: string;
    fecha_asignacion: string;
    ciudad: string;
    imei: string;
    chip: string;
    compania: string;
    id_cliente: number;
}

export interface EquipoGPSApiRaw {
    id: string | number;
    modelo: string;
    estado: string;
    fecha_asignacion: string;
    ciudad: string;
    imei: string;
    chip: string;
    compania: string;
    id_cliente: string | number;
}

export interface EquipoGPSForm {
    modelo: string;
    estado: string;
    fecha_asignacion: string;
    ciudad: string;
    imei: string;
    chip: string;
    compania: string;
    id_cliente: string; // capturado como string para input
}

export interface EquipoGPSApiPayload {
    modelo: string;
    estado: string;
    fecha_asignacion: string;
    ciudad: string;
    imei: string;
    chip: string;
    compania: string;
    id_cliente: number;
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

// en equipo_gps.types.ts
export interface EquipoGPSModalProps {
    isOpen: boolean;
    onClose: () => void;
    equipo?: EquipoGPS;
}

export type Vehiculo = {
    id: number;
    nro_serie: string;
    modelo: string;
    nro_interno: string;
    patente: string;
    FechaHoraRecepcionUltimaPos: string;
    ultimo_imei: string;
};

export type Propietario = {
    id: number;
    rut: string;
    nombre: string;
};

export type AsignacionPayload = {
    id_equipo: number;
    accion: 'listar' | 'asignar_existente' | 'crear_nuevo';
    id_vehiculo?: number;
    patente?: string;
    nro_interno?: string;
    rut_propietario?: string;
    fecha_vencimiento?: string;
};

