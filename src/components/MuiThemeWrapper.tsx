// 3. Crea un nuevo componente: components/MuiThemeWrapper.tsx
import React from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { useTheme } from '../context/ThemeContext';
import { createMuiTheme } from '../theme/muiTheme';

interface MuiThemeWrapperProps {
    children: React.ReactNode;
}

export const MuiThemeWrapper: React.FC<MuiThemeWrapperProps> = ({ children }) => {
    const { theme } = useTheme();
    const muiTheme = createMuiTheme(theme === 'dark');

    return (
        <MuiThemeProvider theme={muiTheme}>
            {children}
        </MuiThemeProvider>
    );
};