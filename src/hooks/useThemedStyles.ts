// 5. Opcional: Hook personalizado para usar en componentes
// hooks/useThemedStyles.ts
import { useTheme as useMuiTheme } from '@mui/material/styles';
import { useTheme } from '../context/ThemeContext';

export const useThemedStyles = () => {
    const { theme } = useTheme();
    const muiTheme = useMuiTheme();

    return {
        isDark: theme === 'dark',
        muiTheme,
        tableStyles: {
            container: {
                backgroundColor: muiTheme.palette.background.paper,
                color: muiTheme.palette.text.primary,
            },
            header: {
                backgroundColor: muiTheme.palette.action.hover,
                color: muiTheme.palette.text.primary,
            },
            row: {
                '&:hover': {
                    backgroundColor: muiTheme.palette.action.hover,
                },
            },
        },
    };
};