import { useMemo, useState, useEffect } from 'react';
import { AsignarVehiculoModal } from './AsignarVehiculoModal';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import { useQuery } from '@tanstack/react-query';
import {
    MaterialReactTable,
    type MRT_ColumnDef,
    type MRT_Cell,
} from 'material-react-table';
import {
    Box,
    IconButton,
    Tooltip,
    Typography,
    Alert,
    useMediaQuery,
} from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { MRT_Localization_ES } from 'material-react-table/locales/es';
import { EquipoGPS } from './equipo_gps.types';
import { fetchEquiposGPS } from './equipo_gps.api';
import { fetchClientes } from '../Clientes/cliente.api';
import { Cliente } from '../Clientes/cliente.types';
import { EquipoGPSModal } from './EquipoGPSModal';
import Swal from 'sweetalert2';
import { useQueryClient } from '@tanstack/react-query';

export default function EquiposGPSPage() {
    const queryClient = useQueryClient();
    const isSmallScreen = useMediaQuery('(max-width:900px)');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [asignacionModalOpen, setAsignacionModalOpen] = useState(false);
    const [currentEquipo, setCurrentEquipo] = useState<EquipoGPS | undefined>();

    // Obtener equipos GPS
    const { data: equipos = [], isLoading, isError, error } = useQuery<EquipoGPS[], Error>({
        queryKey: ['equiposGPS'],
        queryFn: () => fetchEquiposGPS({ limit: '10000' }),
        staleTime: 60_000,
    });

    // Obtener lista de clientes
    const { data: clientes = [] } = useQuery<Cliente[]>({
        queryKey: ['clientes'],
        queryFn: fetchClientes,
        staleTime: 60_000,
    });

    // Crear mapa de ID a nombre de cliente
    const clientesMap = useMemo(() => {
        const map = new Map<number, string>();
        clientes.forEach(cliente => {
            map.set(cliente.id, cliente.nombre_cliente);
        });
        return map;
    }, [clientes]);

    const handleAsignarVehiculo = (equipo: EquipoGPS) => {
        setCurrentEquipo(equipo);
        setAsignacionModalOpen(true);
    };

    const handleAsignacionExitosa = () => {
        queryClient.invalidateQueries({ queryKey: ['equiposGPS'] });
        Swal.fire({
            title: 'Operación exitosa',
            text: 'El vehículo ha sido asignado correctamente',
            icon: 'success',
            confirmButtonText: 'Aceptar'
        });
    };

    const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>({
        ciudad: !isSmallScreen,
        chip: !isSmallScreen,
        compania: !isSmallScreen,
        id_cliente: !isSmallScreen,
    });

    useEffect(() => {
        setColumnVisibility({
            ciudad: !isSmallScreen,
            chip: !isSmallScreen,
            compania: !isSmallScreen,
            id_cliente: !isSmallScreen,
        });
    }, [isSmallScreen]);

    const columns = useMemo<MRT_ColumnDef<EquipoGPS>[]>(() => [
        { header: 'ID', accessorKey: 'id', size: 65 },
        { header: 'Modelo', accessorKey: 'modelo', size: 90 },
        { header: 'Estado', accessorKey: 'estado', size: 90 },
        { header: 'Fecha Asignación', accessorKey: 'fecha_asignacion', size: 120 },
        { header: 'Ciudad', accessorKey: 'ciudad', size: 100 },
        { header: 'IMEI', accessorKey: 'imei', size: 130 },
        { header: 'Chip', accessorKey: 'chip', size: 80 },
        { header: 'Compañía', accessorKey: 'compania', size: 90 },
        {
            header: 'Cliente',
            accessorKey: 'id_cliente',
            size: 150,
            Cell: ({ cell }: { cell: MRT_Cell<EquipoGPS> }) => {
                const idCliente = cell.getValue<number>();
                return clientesMap.get(idCliente) || 'Sin cliente';
            }
        },
    ], [clientesMap]);

    const exportExcel = async () => {
        try {
            // Preparar datos para exportar incluyendo el nombre del cliente
            const dataToExport = equipos.map(equipo => ({
                ...equipo,
                cliente: clientesMap.get(equipo.id_cliente) || 'Sin cliente'
            }));

            const ws = XLSX.utils.json_to_sheet(dataToExport);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'EquiposGPS');
            const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
            const blob = new Blob([wbout], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            });
            saveAs(blob, 'equipos_gps.xlsx');

            await Swal.fire({
                title: 'Exportación exitosa',
                text: 'Los datos se han exportado correctamente a Excel',
                icon: 'success',
                confirmButtonText: 'Aceptar'
            });
        } catch (err) {
            const error = err as Error;
            await Swal.fire({
                title: 'Error',
                text: error.message || 'Ocurrió un error al exportar los datos',
                icon: 'error',
                confirmButtonText: 'Aceptar',
            });
        }
    };

    const handleEdit = (equipo: EquipoGPS) => {
        setCurrentEquipo(equipo);
        setIsModalOpen(true);
    };

    const renderRowActions = ({ row }: { row: { original: EquipoGPS } }) => (
        <Box sx={{ display: 'flex', gap: '8px' }}>
            <Tooltip title="Editar">
                <IconButton onClick={() => handleEdit(row.original)}>
                    <EditIcon color="primary" fontSize="small" />
                </IconButton>
            </Tooltip>
            <Tooltip title="Asignar vehículo">
                <IconButton
                    onClick={() => handleAsignarVehiculo(row.original)}
                    disabled={!row.original.id_cliente} // Deshabilitar si no tiene cliente asignado
                >
                    <DirectionsCarIcon
                        color={row.original.id_cliente ? "secondary" : "disabled"}
                        fontSize="small"
                    />
                </IconButton>
            </Tooltip>
        </Box>
    );

    return (
        <Box p={2} sx={{
            width: '100%',
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
        }}>
            <Box p={2} sx={{ width: '100%', mb: 2 }}>
                <Typography
                    variant="h4"
                    fontWeight={600}
                    gutterBottom
                    sx={{
                        position: 'relative',
                        '&:after': {
                            content: '""',
                            position: 'absolute',
                            bottom: -8,
                            left: 0,
                            width: '80px',
                            height: '4px',
                            background: 'linear-gradient(45deg, primary.main, secondary.main)',
                            borderRadius: 2,
                        },
                    }}
                >
                    Módulo de Equipos GPS
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Administración del inventario — {equipos.length} registros cargados
                </Typography>
            </Box>

            {isError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {(error as Error).message}
                </Alert>
            )}

            <Box sx={{
                flex: 1,
                width: '100%',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <MaterialReactTable
                    columns={columns}
                    data={equipos}
                    localization={MRT_Localization_ES}
                    state={{ isLoading, columnVisibility }}
                    onColumnVisibilityChange={setColumnVisibility}
                    layoutMode="grid"
                    enableColumnResizing
                    columnResizeMode="onEnd"
                    enableFullScreenToggle={false}
                    enableGlobalFilter
                    globalFilterFn="contains"
                    enableColumnFilters
                    enableColumnVirtualization
                    enableRowVirtualization
                    rowVirtualizerOptions={{ overscan: 10 }}
                    muiTableContainerProps={{
                        sx: {
                            flex: 1,
                            maxHeight: 'none',
                            overflow: 'auto',
                            '&::-webkit-scrollbar': {
                                height: '8px',
                                width: '8px',
                            },
                            '&::-webkit-scrollbar-thumb': {
                                backgroundColor: 'text.disabled',
                                borderRadius: '4px',
                            },
                        },
                    }}
                    muiTablePaperProps={{
                        sx: {
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            borderRadius: '8px',
                            overflow: 'hidden',
                        },
                    }}
                    muiTableBodyCellProps={{
                        sx: {
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            fontSize: '0.85rem',
                            px: 1.5,
                        },
                    }}
                    muiTableHeadCellProps={{
                        sx: {
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            fontSize: '0.85rem',
                            fontWeight: 'bold',
                            px: 1.5,
                        },
                    }}
                    enableRowActions
                    positionActionsColumn="last"
                    renderRowActions={renderRowActions}
                    renderTopToolbarCustomActions={() => (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Tooltip title="Nuevo Equipo GPS">
                                <IconButton
                                    color="primary"
                                    onClick={() => {
                                        setCurrentEquipo(undefined);
                                        setIsModalOpen(true);
                                    }}
                                >
                                    <AddIcon />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Exportar Excel">
                                <IconButton onClick={exportExcel} color="primary">
                                    <FileDownloadIcon />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    )}
                    renderBottomToolbarCustomActions={({ table }) => {
                        const totalRows = equipos.length;
                        const visibleRows = table.getFilteredRowModel().rows.length;
                        return (
                            <Box sx={{ display: 'flex', justifyContent: 'center', p: 1 }}>
                                <Typography variant="body2" color="text.secondary">
                                    Mostrando {visibleRows} de {totalRows} registros
                                </Typography>
                            </Box>
                        );
                    }}
                />
            </Box>

            <EquipoGPSModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                equipo={currentEquipo}
            />

            <AsignarVehiculoModal
                open={asignacionModalOpen}
                onClose={() => setAsignacionModalOpen(false)}
                equipoId={currentEquipo?.id || 0}
                imei={currentEquipo?.imei || ''}
                onAsignacionExitosa={handleAsignacionExitosa}
            />
        </Box>
    );
}