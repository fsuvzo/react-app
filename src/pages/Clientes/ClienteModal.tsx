import React, { useEffect, useState } from 'react';
import {
    Box,
    Button,
    TextField,
    Typography,
    CircularProgress,
    Alert,
    Snackbar,
} from '@mui/material';
import { Modal } from '@/components/ui/modal';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Cliente,
    ClienteForm,
    ClienteApiPayload,
    ClienteApiPayloadEdit,
    ApiSuccess,
} from './cliente.types';
import { insertCliente, updateCliente } from './cliente.api';
import { validateClienteForm } from './cliente.utils';

interface ClienteModalProps {
    isOpen: boolean;
    onClose: () => void;
    mode: 'insert' | 'edit';
    cliente?: Cliente;
    onSnackbar?: (s: { message: string; severity: 'success' | 'error' }) => void; // ← nuevo
}

const defaultForm: ClienteForm = {
    nombre_cliente: '',
    nombre_bd: '',
    ciudad_cliente: '',
    puerto_bd: '',
    puerto_escucha: '',
    habilitado: 1,
    id_cliente_intranet: '',
};

export const ClienteModal: React.FC<ClienteModalProps> = ({
                                                              isOpen,
                                                              onClose,
                                                              mode,
                                                              cliente,
                                                              onSnackbar = () => {},        // noop por defecto
                                                          }) => {
    const qc = useQueryClient();
    const [form, setForm] = useState<ClienteForm>(defaultForm);
    const [errors, setErrors] = useState<string[]>([]);
    const [successMessage, setSuccessMessage] = useState('');

    /* -------- carga inicial -------- */
    useEffect(() => {
        if (mode === 'edit' && cliente) {
            setForm({
                nombre_cliente: cliente.nombre_cliente,
                nombre_bd: cliente.nombre_bd,
                ciudad_cliente: cliente.ciudad_cliente,
                puerto_bd: cliente.puerto_bd?.toString() || '',
                puerto_escucha: cliente.puerto_escucha?.toString() || '',
                habilitado: cliente.habilitado,
                id_cliente_intranet: cliente.id.toString(),
            });
        } else {
            setForm(defaultForm);
        }
        setErrors([]);
        setSuccessMessage('');
    }, [mode, cliente, isOpen]);

    /* -------- mutación -------- */
    const mutation = useMutation<ApiSuccess, unknown, ClienteApiPayload | ClienteApiPayloadEdit>({
        mutationFn: (payload) =>
            mode === 'insert'
                ? insertCliente(payload as ClienteApiPayload)
                : updateCliente(payload as ClienteApiPayloadEdit),
        onSuccess: async (res) => {
            await qc.invalidateQueries({ queryKey: ['clientes'] });
            setSuccessMessage(res.message || 'Guardado con éxito');
            onSnackbar({ message: res.message || 'Guardado con éxito', severity: 'success' });
            setTimeout(onClose, 1000);
        },
        onError: (err) => {
            setErrors(['Error al guardar. Verifica los datos.']);
            onSnackbar({ message: 'Error al guardar el cliente', severity: 'error' });
            console.error(err);
        },
    });

    const handleChange =
        (field: keyof ClienteForm) => (e: React.ChangeEvent<HTMLInputElement>) =>
            setForm((p) => ({ ...p, [field]: e.target.value }));

    const handleSubmit = () => {
        const validation = validateClienteForm(form);
        if (validation.length) {
            setErrors(validation);
            return;
        }
        const payload: ClienteApiPayload | ClienteApiPayloadEdit = {
            nombre_cliente: form.nombre_cliente,
            nombre_bd: form.nombre_bd,
            ciudad_cliente: form.ciudad_cliente,
            puerto_bd: Number(form.puerto_bd),
            puerto_escucha: Number(form.puerto_escucha),
            habilitado: form.habilitado,
            id_cliente_intranet: Number(form.id_cliente_intranet),
            ...(mode === 'edit' && cliente ? { id: cliente.id } : {}),
        };
        mutation.mutate(payload);
    };

    /* -------- render -------- */
    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-lg p-6">
            <Typography variant="h6" mb={2}>
                {mode === 'insert' ? 'Nuevo Cliente' : 'Editar Cliente'}
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {errors.length > 0 && (
                    <Alert severity="error" onClose={() => setErrors([])}>
                        {errors.map((e, i) => (
                            <div key={i}>{e}</div>
                        ))}
                    </Alert>
                )}

                <TextField label="Nombre del Cliente" value={form.nombre_cliente} onChange={handleChange('nombre_cliente')} fullWidth />
                <TextField label="Nombre de la BD" value={form.nombre_bd} onChange={handleChange('nombre_bd')} fullWidth />
                <TextField label="Ciudad" value={form.ciudad_cliente} onChange={handleChange('ciudad_cliente')} fullWidth />
                <TextField label="Puerto BD" value={form.puerto_bd} onChange={handleChange('puerto_bd')} fullWidth />
                <TextField label="Puerto Escucha" value={form.puerto_escucha} onChange={handleChange('puerto_escucha')} fullWidth />
                {mode === 'edit' && (
                    <TextField label="ID Cliente Intranet" value={form.id_cliente_intranet} inputProps={{ readOnly: true }} fullWidth />
                )}

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, gap: 2 }}>
                    <Button variant="outlined" onClick={onClose} disabled={mutation.isPending}>
                        Cancelar
                    </Button>
                    <Button variant="contained" onClick={handleSubmit} disabled={mutation.isPending}>
                        {mutation.isPending ? <CircularProgress size={20} /> : mode === 'insert' ? 'Crear' : 'Guardar'}
                    </Button>
                </Box>
            </Box>

            <Snackbar
                open={!!successMessage}
                autoHideDuration={3000}
                onClose={() => setSuccessMessage('')}
                message={successMessage}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            />
        </Modal>
    );
};
