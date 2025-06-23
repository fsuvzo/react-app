// AsignarVehiculoModal.tsx
import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Autocomplete,
    Box,
    Tabs,
    Tab,
    Typography,
    CircularProgress,
} from '@mui/material';
import { Vehiculo, Propietario } from './equipo_gps.types';
import { listarVehiculosParaAsignacion, asignarVehiculo } from './equipo_gps.api';

interface AsignarVehiculoModalProps {
    open: boolean;
    onClose: () => void;
    equipoId: number;
    imei: string;
    onAsignacionExitosa: () => void;
}

export function AsignarVehiculoModal({
                                         open,
                                         onClose,
                                         equipoId,
                                         imei,
                                         onAsignacionExitosa,
                                     }: AsignarVehiculoModalProps) {
    const [tabValue, setTabValue] = useState(0);
    const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
    const [propietarios, setPropietarios] = useState<Propietario[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedVehiculo, setSelectedVehiculo] = useState<Vehiculo | null>(null);
    const [nuevoVehiculo, setNuevoVehiculo] = useState({
        patente: '',
        nro_interno: '',
        rut_propietario: '',
        fecha_vencimiento: '',
    });

    useEffect(() => {
        if (open) {
            cargarDatos();
        }
    }, [open]);

    const cargarDatos = async () => {
        setLoading(true);
        try {
            const data = await listarVehiculosParaAsignacion(equipoId);
            setVehiculos(data.vehiculos);
            setPropietarios(data.propietarios);
        } catch (error) {
            console.error('Error cargando datos:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAsignarExistente = async () => {
        if (!selectedVehiculo) return;

        setLoading(true);
        try {
            await asignarVehiculo({
                id_equipo: equipoId,
                accion: 'asignar_existente',
                id_vehiculo: selectedVehiculo.id
            });
            onAsignacionExitosa();
            onClose();
        } catch (error) {
            console.error('Error asignando vehículo:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCrearNuevo = async () => {
        if (!nuevoVehiculo.patente || !nuevoVehiculo.nro_interno || !nuevoVehiculo.rut_propietario) return;

        setLoading(true);
        try {
            await asignarVehiculo({
                id_equipo: equipoId,
                accion: 'crear_nuevo',
                ...nuevoVehiculo
            });
            onAsignacionExitosa();
            onClose();
        } catch (error) {
            console.error('Error creando vehículo:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>Asignar Vehículo - IMEI: {imei}</DialogTitle>
            <DialogContent dividers>
                <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
                    <Tab label="Asignar a existente" />
                    <Tab label="Crear nuevo vehículo" />
                </Tabs>

                <Box sx={{ pt: 3 }}>
                    {loading ? (
                        <Box display="flex" justifyContent="center" p={4}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <>
                            {tabValue === 0 && (
                                <>
                                    <Typography variant="subtitle1" gutterBottom>
                                        Seleccione un vehículo existente
                                    </Typography>
                                    <Autocomplete
                                        options={vehiculos}
                                        getOptionLabel={(option) => `${option.nro_interno} - ${option.patente}`}
                                        renderInput={(params) => (
                                            <TextField {...params} label="Buscar vehículo" variant="outlined" />
                                        )}
                                        value={selectedVehiculo}
                                        onChange={(_, newValue) => setSelectedVehiculo(newValue)}
                                        fullWidth
                                        sx={{ mb: 2 }}
                                    />
                                    {selectedVehiculo && (
                                        <Box sx={{ p: 2, border: '1px solid #eee', borderRadius: 1 }}>
                                            <Typography><strong>Número Interno:</strong> {selectedVehiculo.nro_interno}</Typography>
                                            <Typography><strong>Patente:</strong> {selectedVehiculo.patente}</Typography>
                                            <Typography><strong>Modelo:</strong> {selectedVehiculo.modelo}</Typography>
                                            <Typography><strong>Última Posición:</strong> {selectedVehiculo.FechaHoraRecepcionUltimaPos}</Typography>
                                        </Box>
                                    )}
                                </>
                            )}

                            {tabValue === 1 && (
                                <>
                                    <Typography variant="subtitle1" gutterBottom>
                                        Crear nuevo vehículo
                                    </Typography>
                                    <TextField
                                        label="Patente"
                                        value={nuevoVehiculo.patente}
                                        onChange={(e) => setNuevoVehiculo({...nuevoVehiculo, patente: e.target.value})}
                                        fullWidth
                                        required
                                        sx={{ mb: 2 }}
                                    />
                                    <TextField
                                        label="Número Interno"
                                        value={nuevoVehiculo.nro_interno}
                                        onChange={(e) => setNuevoVehiculo({...nuevoVehiculo, nro_interno: e.target.value})}
                                        fullWidth
                                        required
                                        sx={{ mb: 2 }}
                                    />
                                    <Autocomplete
                                        options={propietarios}
                                        getOptionLabel={(option) => `${option.nombre} (${option.rut})`}
                                        renderInput={(params) => (
                                            <TextField {...params} label="Propietario" variant="outlined" required />
                                        )}
                                        value={propietarios.find(p => p.rut === nuevoVehiculo.rut_propietario) || null}
                                        onChange={(_, newValue) => setNuevoVehiculo({
                                            ...nuevoVehiculo,
                                            rut_propietario: newValue?.rut || ''
                                        })}
                                        fullWidth
                                        sx={{ mb: 2 }}
                                    />
                                    <TextField
                                        label="Fecha Vencimiento Revisión Técnica"
                                        type="date"
                                        InputLabelProps={{ shrink: true }}
                                        value={nuevoVehiculo.fecha_vencimiento}
                                        onChange={(e) => setNuevoVehiculo({...nuevoVehiculo, fecha_vencimiento: e.target.value})}
                                        fullWidth
                                        sx={{ mb: 2 }}
                                    />
                                </>
                            )}
                        </>
                    )}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="secondary">
                    Cancelar
                </Button>
                <Button
                    onClick={tabValue === 0 ? handleAsignarExistente : handleCrearNuevo}
                    color="primary"
                    variant="contained"
                    disabled={loading || (tabValue === 0 && !selectedVehiculo) ||
                        (tabValue === 1 && (!nuevoVehiculo.patente || !nuevoVehiculo.nro_interno || !nuevoVehiculo.rut_propietario))}
                >
                    {loading ? <CircularProgress size={24} /> : 'Confirmar'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}