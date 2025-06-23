// src/helpers/swal.ts
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { createTheme } from '@mui/material/styles';

const muiTheme = createTheme(); // o importa tu tema real
const Z_INDEX = muiTheme.zIndex.appBar + 100;

// Creamos una clase dinámica que modificará el z-index del contenedor
const style = document.createElement('style');
style.innerHTML = `
  .swal-custom-zindex {
    z-index: ${Z_INDEX} !important;
  }
`;
document.head.appendChild(style);

export const SwalReact = withReactContent(
    Swal.mixin({
        customClass: {
            container: 'swal-custom-zindex',
        },
    })
);
