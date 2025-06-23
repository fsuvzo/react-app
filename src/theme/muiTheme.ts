
// 1. Crea un nuevo archivo: theme/muiTheme.ts
import { createTheme } from '@mui/material/styles';

export const createMuiTheme = (isDark: boolean) => {
    return createTheme({
        palette: {
            mode: isDark ? 'dark' : 'light',
            primary: {
                main: '#1976d2',
            },
            secondary: {
                main: '#dc004e',
            },
            background: {
                default: isDark ? '#121212' : '#ffffff',
                paper: isDark ? '#1e1e1e' : '#ffffff',
            },
            text: {
                primary: isDark ? '#ffffff' : '#000000',
                secondary: isDark ? '#b3b3b3' : '#666666',
            },
        },
        components: {
            // Personalización específica para MaterialReactTable
            MuiTableContainer: {
                styleOverrides: {
                    root: {
                        backgroundColor: isDark ? '#1e1e1e' : '#ffffff',
                    },
                },
            },
            MuiTableHead: {
                styleOverrides: {
                    root: {
                        backgroundColor: isDark ? '#2d2d2d' : '#f5f5f5',
                    },
                },
            },
            MuiTableRow: {
                styleOverrides: {
                    root: {
                        '&:hover': {
                            backgroundColor: isDark ? '#333333' : '#f0f0f0',
                        },
                    },
                },
            },
            MuiPaper: {
                styleOverrides: {
                    root: {
                        backgroundColor: isDark ? '#1e1e1e' : '#ffffff',
                        color: isDark ? '#ffffff' : '#000000',
                    },
                },
            },
        },
    });
};