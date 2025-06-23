// src/pages/EquiposGPS/EquipoGPSModal.tsx
import React, { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/modal';
import {
    Box,
    Button,
    TextField,
    Typography,
    CircularProgress,
    MenuItem,
    Select as MuiSelect, // Renombrado aquí
    InputLabel,
    FormControl,
    SelectChangeEvent,
    Alert,
    Snackbar,
} from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchClientesActivos } from '../Clientes/cliente.api';
import { Cliente } from '../Clientes/cliente.types';
import {
    EquipoGPSForm,
    EquipoGPSApiPayload,
    ApiSuccess
} from './equipo_gps.types';
import { insertEquipoGPS } from './equipo_gps.api';
import { validateEquipoForm } from './equipo_gps.utils';
import Select from 'react-select'; // Este mantiene el nombre original
import { styled } from '@mui/system';
import type { EquipoGPSModalProps } from './equipo_gps.types';

/* --------- constantes --------- */
const defaultForm: EquipoGPSForm = {
    modelo: '',
    estado: 'Instalado',
    fecha_asignacion: '',
    ciudad: '',
    imei: '',
    chip: '',
    compania: 'VIRGIN',
    id_cliente: '',
};

const modelOptions = ['FMC130', 'FMS500Light', 'FM3612', 'FM1100'] as const;
const estadoOptions = ['Instalado', 'Baja'] as const;
const companyOptions = ['No asignado', 'VIRGIN', 'VODAFONE'] as const;

/* --------- Styled Components --------- */
const StyledFormControl = styled(FormControl)(({ theme }) => ({
    '& .react-select__control': {
        minHeight: '56px',
        boxShadow: 'none',
        '&:hover': {
            borderColor: theme.palette.primary.main,
        },
        borderColor: theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.23)' : 'rgba(255, 255, 255, 0.23)',
        borderRadius: '4px',
        padding: '0 4px',
    },
    '& .react-select__menu': {
        zIndex: 9999,
    },
    '& .react-select__option--is-focused': {
        backgroundColor: theme.palette.action.hover,
    },
    '& .react-select__option--is-selected': {
        backgroundColor: `${theme.palette.primary.main} !important`,
    },
    '& .react-select__single-value': {
        color: theme.palette.text.primary,
    },
    '& .react-select__placeholder': {
        color: theme.palette.text.disabled,
    },
    '& .react-select__input': {
        color: theme.palette.text.primary,
    },
}));

const StyledLabel = styled(InputLabel)(({ theme }) => ({
    backgroundColor: theme.palette.background.paper,
    padding: '0 4px',
    marginLeft: '-4px',
    marginTop: '-2px',
    fontSize: '0.875rem',
}));

/* ================================================= */
export const EquipoGPSModal: React.FC<EquipoGPSModalProps> = ({
                                                                  isOpen,
                                                                  onClose,
                                                                  equipo,
                                                              }) => {
    // const theme = useTheme();
    const qc = useQueryClient();

    const [form, setForm] = useState<EquipoGPSForm>(defaultForm);
    const [errors, setErrors] = useState<string[]>([]);
    const [successMessage, setSuccessMessage] = useState('');

    /* ---------- query clientes ---------- */
    const { data: clientes = [] } = useQuery<Cliente[]>({
        queryKey: ['clientes'],
        queryFn: fetchClientesActivos,
        staleTime: 60_000,
    });

    /* ---------- carga inicial ---------- */
    useEffect(() => {
        if (equipo) {
            setForm({
                modelo: equipo.modelo,
                estado: equipo.estado,
                fecha_asignacion: equipo.fecha_asignacion.slice(0, 10),
                ciudad: equipo.ciudad,
                imei: equipo.imei,
                chip: equipo.chip === '0' ? '' : equipo.chip,
                compania: equipo.compania,
                id_cliente: String(equipo.id_cliente),
            });
        } else {
            setForm({ ...defaultForm, fecha_asignacion: new Date().toISOString().slice(0, 10) });
        }
        setErrors([]);
        setSuccessMessage('');
    }, [equipo, isOpen]);

    /* ---------- mutación ---------- */
    const mutation = useMutation<ApiSuccess, Error, EquipoGPSApiPayload>({
        mutationFn: insertEquipoGPS,
        onSuccess: async (res) => {
            await qc.invalidateQueries({ queryKey: ['equiposGPS'] });
            setSuccessMessage(res.message || 'Equipo registrado correctamente');
            setTimeout(onClose, 1200);
        },
        onError: (err) => {
            setErrors([err.message || 'Ocurrió un error al guardar el equipo']);
        },
    });

    /* ---------- handlers ---------- */
    const handleTextChange =
        (field: keyof EquipoGPSForm) =>
            (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                setForm((p) => ({ ...p, [field]: e.target.value }));

    const handleSelectChange =
        (field: keyof EquipoGPSForm) =>
            (e: SelectChangeEvent<string>) =>
                setForm((p) => ({ ...p, [field]: e.target.value }));

    const handleClienteChange = (selectedOption: any) => {
        setForm((p) => ({ ...p, id_cliente: selectedOption?.value || '' }));
    };

    const handleSubmit = () => {
        const validation = validateEquipoForm(form);
        if (form.chip && !/^\d{9}$/.test(form.chip)) {
            validation.push('Chip debe tener 9 dígitos o estar vacío');
        }
        if (validation.length) {
            setErrors(validation);
            return;
        }
        const payload: EquipoGPSApiPayload = {
            modelo: form.modelo,
            estado: form.estado,
            fecha_asignacion: form.fecha_asignacion,
            ciudad: form.ciudad,
            imei: form.imei,
            chip: form.chip || '0',
            compania: form.compania,
            id_cliente: Number(form.id_cliente),
        };
        mutation.mutate(payload);
    };

    /* ---------- render ---------- */
    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-lg p-6">
            <Typography variant="h6" mb={2}>
                {equipo ? 'Editar Equipo GPS' : 'Registrar Equipo GPS'}
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {errors.length > 0 && (
                    <Alert severity="error" onClose={() => setErrors([])}>
                        {errors.map((e, i) => (
                            <div key={i}>{e}</div>
                        ))}
                    </Alert>
                )}

                {/* Modelo */}
                <FormControl fullWidth>
                    <InputLabel>Modelo</InputLabel>
                    <MuiSelect
                        value={form.modelo}
                        label="Modelo"
                        MenuProps={{ disablePortal: true }}
                        onChange={handleSelectChange('modelo')}
                    >
                        {modelOptions.map((m) => (
                            <MenuItem key={m} value={m}>
                                {m}
                            </MenuItem>
                        ))}
                    </MuiSelect>
                </FormControl>

                {/* Estado */}
                <FormControl fullWidth>
                    <InputLabel>Estado</InputLabel>
                    <MuiSelect
                        value={form.estado}
                        label="Estado"
                        MenuProps={{ disablePortal: true }}
                        onChange={handleSelectChange('estado')}
                    >
                        {estadoOptions.map((e) => (
                            <MenuItem key={e} value={e}>
                                {e}
                            </MenuItem>
                        ))}
                    </MuiSelect>
                </FormControl>

                {/* Fecha */}
                <TextField
                    label="Fecha Asignación"
                    type="date"
                    value={form.fecha_asignacion}
                    onChange={handleTextChange('fecha_asignacion')}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                />

                {/* Ciudad */}
                <TextField
                    label="Ciudad"
                    value={form.ciudad}
                    onChange={handleTextChange('ciudad')}
                    fullWidth
                />

                {/* IMEI */}
                <TextField
                    label="IMEI *"
                    value={form.imei}
                    onChange={handleTextChange('imei')}
                    required
                    fullWidth
                />

                {/* Chip */}
                <TextField
                    label="Chip (9 dígitos)"
                    value={form.chip}
                    onChange={handleTextChange('chip')}
                    fullWidth
                />

                {/* Compañía */}
                <FormControl fullWidth>
                    <InputLabel>Compañía</InputLabel>
                    <MuiSelect
                        value={form.compania}
                        label="Compañía"
                        MenuProps={{ disablePortal: true }}
                        onChange={handleSelectChange('compania')}
                    >
                        {companyOptions.map((c) => (
                            <MenuItem key={c} value={c}>
                                {c}
                            </MenuItem>
                        ))}
                    </MuiSelect>
                </FormControl>

                {/* Cliente con react-select */}
                <StyledFormControl fullWidth>
                    <StyledLabel shrink htmlFor="cliente-select">
                        Cliente *
                    </StyledLabel>
                    <Select
                        id="cliente-select"
                        classNamePrefix="react-select"
                        options={clientes.map(cl => ({
                            value: String(cl.id),
                            label: cl.nombre_cliente,
                        }))}
                        value={form.id_cliente ? {
                            value: form.id_cliente,
                            label: clientes.find(cl => String(cl.id) === form.id_cliente)?.nombre_cliente || '',
                        } : null}
                        onChange={handleClienteChange}
                        placeholder="Buscar cliente..."
                        isSearchable
                        noOptionsMessage={() => "No hay clientes disponibles"}
                        required
                    />
                </StyledFormControl>

                {/* Botones */}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                    <Button variant="outlined" onClick={onClose} disabled={mutation.isPending}>
                        Cancelar
                    </Button>
                    <Button variant="contained" onClick={handleSubmit} disabled={mutation.isPending}>
                        {mutation.isPending ? <CircularProgress size={20} /> : 'Guardar'}
                    </Button>
                </Box>
            </Box>

            {/* Snackbar éxito */}
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