import { Cliente, ClienteApiRaw, ClienteForm } from './cliente.types';

export const mapRawToCliente = (raw: ClienteApiRaw): Cliente => ({
    id: Number(raw.id),
    nombre_cliente: String(raw.nombre_cliente),
    nombre_bd: String(raw.nombre_bd),
    ciudad_cliente: String(raw.ciudad_cliente),
    puerto_bd: raw.puerto_bd ? Number(raw.puerto_bd) : null,
    puerto_escucha: raw.puerto_escucha ? Number(raw.puerto_escucha) : null,
    habilitado: Number(raw.habilitado) as 0 | 1,
});

export const validateClienteForm = (form: ClienteForm): string[] => {
    const errors: string[] = [];

    if (!form.nombre_cliente.trim()) errors.push('Nombre del cliente es obligatorio');
    if (!form.nombre_bd.trim()) errors.push('Nombre de la base de datos es obligatorio');
    if (!form.ciudad_cliente.trim()) errors.push('Ciudad del cliente es obligatoria');
    if (!form.puerto_bd.trim() || isNaN(Number(form.puerto_bd))) errors.push('Puerto BD inválido');
    if (!form.puerto_escucha.trim() || isNaN(Number(form.puerto_escucha))) errors.push('Puerto de escucha inválido');

    return errors;
};
