import { api } from '@/helpers/api';
import {
    EquipoGPS,
    EquipoGPSApiRaw,
    EquipoGPSApiPayload,
    ApiSuccess,
} from './equipo_gps.types';
import { mapRawToEquipo } from './equipo_gps.utils';
import { Ciudad } from './equipo_gps.types';
import { AsignacionPayload } from './equipo_gps.types';
import { Vehiculo } from './equipo_gps.types';
import { Propietario } from './equipo_gps.types';
export const fetchEquiposGPS = async (filters?: Record<string, string>): Promise<EquipoGPS[]> => {
    const { data } = await api.get<ApiSuccess<EquipoGPSApiRaw[]>>('', {
        params: { action: 'get_equipos_gps', ...filters },
    });
    if (!data.success) throw new Error(data.message);
    return data.data.map(mapRawToEquipo);
};

export const insertEquipoGPS = async (payload: EquipoGPSApiPayload): Promise<ApiSuccess> => {
    const { data } = await api.post<ApiSuccess>('', payload, {
        params: { action: 'insert_equipo' },
    });
    return data;
};

export const fetchCiudades = async (): Promise<Ciudad[]> => {
    const { data } = await api.get<ApiSuccess<Ciudad[]>>('', {
        params: { action: 'ciudades' },
    });
    if (!data.success) throw new Error(data.message);
    return data.data;               // ← array de objetos {id, ciudad}
};


// equipo_gps.api.ts
export const asignarVehiculo = async (payload: AsignacionPayload): Promise<any> => {
    const response = await fetch('/api/backend.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            action: 'asignar_vehiculo',
            ...payload
        }),
    });
    return await response.json();
};

export const listarVehiculosParaAsignacion = async (idEquipo: number): Promise<{
    vehiculos: Vehiculo[];
    propietarios: Propietario[];
}> => {
    try {
        const response = await fetch('/api/backend.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'asignar_vehiculo',
                id_equipo: idEquipo,
                accion: 'listar'
            }),
        });

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const text = await response.text();
        if (!text) {
            throw new Error('Respuesta vacía del servidor');
        }

        const data = JSON.parse(text);

        if (!data.success) {
            throw new Error(data.error || 'Error al listar vehículos');
        }

        return data.data;
    } catch (error) {
        console.error('Error en listarVehiculosParaAsignacion:', error);
        throw error;
    }
};