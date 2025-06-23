import { EquipoGPSApiRaw, EquipoGPS } from './equipo_gps.types';

export const mapRawToEquipo = (raw: EquipoGPSApiRaw): EquipoGPS => ({
    id: Number(raw.id),
    modelo: raw.modelo,
    estado: raw.estado,
    fecha_asignacion: raw.fecha_asignacion,
    ciudad: raw.ciudad,
    imei: raw.imei,
    chip: raw.chip,
    compania: raw.compania,
    id_cliente: Number(raw.id_cliente),
});

export const validateEquipoForm = (form: { imei: string; id_cliente: string }): string[] => {
    const errors: string[] = [];
    if (!form.imei.trim()) errors.push('El IMEI es obligatorio');
    if (!form.id_cliente.trim() || isNaN(Number(form.id_cliente))) {
        errors.push('El ID de cliente asociado es obligatorio y debe ser numérico');
    }
    return errors;
};