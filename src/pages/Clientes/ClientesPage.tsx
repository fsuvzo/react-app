// src/pages/Clientes/ClientesPage.tsx
import { useMemo, useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    MaterialReactTable,
    type MRT_ColumnDef,
} from 'material-react-table';
import {
    Box,
    IconButton,
    Tooltip,
    Typography,
    Alert,
    Checkbox,
    useMediaQuery,
    Snackbar,
} from '@mui/material';
import {
    Edit as EditIcon,
    ToggleOn as ToggleOnIcon,
    ToggleOff as ToggleOffIcon,
    FileDownload as FileDownloadIcon,
    Add as AddIcon,
} from '@mui/icons-material';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { MRT_Localization_ES } from 'material-react-table/locales/es';
import { ClienteModal } from './ClienteModal';
import { Cliente } from './cliente.types';
import {
    fetchClientes,
    fetchClientesActivos,
    toggleHabilitado,
} from './cliente.api';

export default function ClientesPage() {
    const qc = useQueryClient();
    const isSmallScreen = useMediaQuery('(max-width:900px)');

    /* ---------------- snackbar global ---------------- */
    const [snackbar, setSnackbar] = useState<{
        message: string;
        severity: 'success' | 'error';
    } | null>(null);

    /* ---------------- modal state -------------------- */
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'insert' | 'edit'>('insert');
    const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);

    /* ---------------- filtro habilitado -------------- */
    // undefined = todos, 1 = solo habilitados
    const [habilitadoFilter, setHabilitadoFilter] = useState<0 | 1 | undefined>(1);

    /* ---------------- query clientes ---------------- */
    const {
        data = [],
        isLoading,
        isError,
        error,
    } = useQuery({
        queryKey: ['clientes', habilitadoFilter ?? 'todos'],
        queryFn: () =>
            habilitadoFilter === 1 ? fetchClientesActivos() : fetchClientes(),
        staleTime: 60_000,
    });

    /* ---------------- toggle habilitado -------------- */
    const mutation = useMutation({
        mutationFn: ({ id, habilitado }: { id: number; habilitado: 0 | 1 }) =>
            toggleHabilitado(id, habilitado),
        onSuccess: (_, { habilitado }) => {
            // invalida todas las variantes de la lista
            qc.invalidateQueries({ queryKey: ['clientes'] });
            setSnackbar({
                severity: 'success',
                message: habilitado
                    ? 'Cliente habilitado correctamente'
                    : 'Cliente deshabilitado correctamente',
            });
        },
        onError: () =>
            setSnackbar({
                severity: 'error',
                message: 'Ocurrió un error al cambiar el estado del cliente',
            }),
    });

    /* ---------------- columnas ---------------------- */
    const [columnVisibility, setColumnVisibility] = useState<
        Record<string, boolean>
    >({
        puerto_bd: !isSmallScreen,
        puerto_escucha: !isSmallScreen,
    });

    useEffect(() => {
        setColumnVisibility({
            puerto_bd: !isSmallScreen,
            puerto_escucha: !isSmallScreen,
        });
    }, [isSmallScreen]);

    const columns = useMemo<MRT_ColumnDef<Cliente>[]>(
        () => [
            {
                header: 'ID',
                accessorKey: 'id',
                size: 80,
                minSize: 50,
                maxSize: 100,
            },
            {
                header: 'Nombre',
                accessorKey: 'nombre_cliente',
                size: 180,
                minSize: 120,
            },
            { header: 'BD', accessorKey: 'nombre_bd', size: 150, minSize: 100 },
            { header: 'Ciudad', accessorKey: 'ciudad_cliente', size: 120 },
            {
                header: 'Puerto BD',
                accessorKey: 'puerto_bd',
                size: 100,
                Cell: ({ cell }) => cell.getValue<number | null>() ?? '—',
            },
            {
                header: 'Puerto Escucha',
                accessorKey: 'puerto_escucha',
                size: 120,
                Cell: ({ cell }) => cell.getValue<number | null>() ?? '—',
            },
            {
                header: 'Activo',
                accessorKey: 'habilitado',
                size: 80,
                Cell: ({ row }) =>
                    Number(row.original.habilitado) ? 'Sí' : 'No',

                // Checkbox de filtro ⇒ dispara filtro interno + refetch backend
                Filter: ({ column }) => {
                    const value = column.getFilterValue() as number | undefined;

                    return (
                        <Checkbox
                            checked={value === 1}
                            onChange={(e) => {
                                const val = e.target.checked ? 1 : undefined;
                                column.setFilterValue(val);
                                setHabilitadoFilter(val);
                            }}
                            aria-label="Filtrar activos"
                        />
                    );
                },

                // Conversión antes de comparar (por si backend devuelve '0'/'1')
                filterFn: (row, id, value) => {
                    if (value == null) return true;
                    return Number(row.getValue(id)) === value;
                },
            },
        ],
        [],
    );

    /* ---------------- export excel ------------------ */
    const exportExcel = () => {
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Clientes');
        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        saveAs(
            new Blob([wbout], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            }),
            'clientes.xlsx',
        );
    };

    /* ---------------- render ------------------------ */
    return (
        <Box
            p={2}
            sx={{
                width: '100%',
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
            }}
        >
            {/* ---- encabezado ---- */}
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
                            background:
                                'linear-gradient(45deg, primary.main, secondary.main)',
                            borderRadius: 2,
                        },
                    }}
                >
                    Módulo de Clientes
                </Typography>
                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 1 }}
                >
                    Centro de administración y gestión de clientes
                </Typography>
            </Box>

            {isError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {(error as Error).message}
                </Alert>
            )}

            {/* ---- tabla ---- */}
            <Box
                sx={{
                    flex: 1,
                    width: '100%',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                <MaterialReactTable
                    columns={columns}
                    data={data}
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
                            backgroundColor: 'action.hover',
                        },
                    }}
                    // sin filtros iniciales: backend ya filtra por habilitado
                    enableRowActions
                    positionActionsColumn="last"
                    renderRowActions={({ row }) => (
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <Tooltip title="Editar Cliente">
                                <IconButton
                                    color="primary"
                                    size="small"
                                    onClick={() => {
                                        setModalMode('edit');
                                        setEditingCliente(row.original);
                                        setIsModalOpen(true);
                                    }}
                                >
                                    <EditIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>

                            <Tooltip
                                title={
                                    row.original.habilitado
                                        ? 'Deshabilitar'
                                        : 'Habilitar'
                                }
                            >
                                <IconButton
                                    color={
                                        row.original.habilitado
                                            ? 'success'
                                            : 'warning'
                                    }
                                    size="small"
                                    onClick={() =>
                                        mutation.mutate({
                                            id: row.original.id,
                                            habilitado: row.original.habilitado
                                                ? 0
                                                : 1,
                                        })
                                    }
                                >
                                    {row.original.habilitado ? (
                                        <ToggleOnIcon fontSize="small" />
                                    ) : (
                                        <ToggleOffIcon fontSize="small" />
                                    )}
                                </IconButton>
                            </Tooltip>
                        </Box>
                    )}
                    renderTopToolbarCustomActions={() => (
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                            }}
                        >
                            <Tooltip title="Nuevo Cliente">
                                <IconButton
                                    color="primary"
                                    onClick={() => {
                                        setModalMode('insert');
                                        setEditingCliente(null);
                                        setIsModalOpen(true);
                                    }}
                                >
                                    <AddIcon />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Exportar Excel">
                                <IconButton
                                    onClick={exportExcel}
                                    color="primary"
                                >
                                    <FileDownloadIcon />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    )}
                    renderBottomToolbarCustomActions={({ table }) => {
                        const total = data.length;
                        const visible =
                            table.getFilteredRowModel().rows.length;
                        return (
                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    p: 1,
                                }}
                            >
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    Mostrando {visible} de {total} registros
                                </Typography>
                            </Box>
                        );
                    }}
                />
            </Box>

            {/* ---- modal ---- */}
            <ClienteModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                mode={modalMode}
                cliente={editingCliente ?? undefined}
                onSnackbar={setSnackbar}
            />

            {/* ---- snackbar global ---- */}
            <Snackbar
                open={!!snackbar}
                autoHideDuration={3000}
                onClose={() => setSnackbar(null)}
                message={snackbar?.message}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                }}
                ContentProps={{
                    sx: {
                        bgcolor:
                            snackbar?.severity === 'success'
                                ? 'success.main'
                                : 'error.main',
                    },
                }}
            />
        </Box>
    );
}
