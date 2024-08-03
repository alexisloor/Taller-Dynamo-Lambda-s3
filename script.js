// Configura AWS S3
AWS.config.update({
    accessKeyId: '********', 
    secretAccessKey: '**********',
    sessionToken: '*******************',
    region: 'us-east-1'
});

const s3 = new AWS.S3();
const bucketName = 'alexisimg';

// Función para subir archivos y registrar datos
document.getElementById('formulario-registro').addEventListener('submit', function(evento) {
    evento.preventDefault();
    
    // Obtener valores del formulario
    const nombre = document.getElementById('nombre').value;
    const apellido = document.getElementById('apellido').value;
    const cedula = document.getElementById('cedula').value;
    const correo = document.getElementById('correo').value;
    const foto = document.getElementById('file-upload').files[0];

    if (foto) {
        // Subir la foto a S3
        const params = {
            Bucket: bucketName,
            Key: foto.name,
            Body: foto
        };

        s3.upload(params, (err, data) => {
            if (err) {
                console.error('Error subiendo el archivo:', err);
            } else {
                console.log('Archivo subido con éxito:', data.Location);
                enviarDatos(nombre, apellido, cedula, correo, data.Location);
            }
        });
    } else {
        // Si no hay foto, enviar los datos sin la URL de la foto
        enviarDatos(nombre, apellido, cedula, correo, "");
    }
});

// Función para enviar los datos al API Gateway
const enviarDatos = (nombre, apellido, cedula, correo, fotoUrl) => {
    const data = {
        TableName: 'usuarios',  
        Item: {
            cedula: cedula,
            nombre: nombre,
            apellido: apellido,
            correo: correo,
            foto: fotoUrl // Enviar la URL de la foto
        }
    };
  
    // Enviar datos a la API Gateway
    fetch('https://wrn2vhqk3g.execute-api.us-east-1.amazonaws.com/default/saveuser', {
        method: 'POST',
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        console.log('Registro exitoso:', data);
        
    })
    .catch(error => {
        console.error('Error en el registro:', error);
    });
};

function cargarRegistros() {
    fetch('https://wrn2vhqk3g.execute-api.us-east-1.amazonaws.com/default/saveuser?TableName=usuarios', {
        method: 'GET',
    })
    .then(response => response.json())
    .then(data => {
        const registros = data.Items;
        const listaRegistros = document.getElementById('lista-registros');
        listaRegistros.innerHTML = '';  

        registros.forEach(registro => {
            const fila = listaRegistros.insertRow();
            
            const celdaNombre = fila.insertCell(0);
            const celdaApellido = fila.insertCell(1);
            const celdaCedula = fila.insertCell(2);
            const celdaCorreo = fila.insertCell(3);
            const celdaFoto = fila.insertCell(4);
            
            celdaNombre.textContent = registro.nombre;
            celdaApellido.textContent = registro.apellido;
            celdaCedula.textContent = registro.cedula;
            celdaCorreo.textContent = registro.correo;

            if (registro.foto) {
                const fotoImg = document.createElement('img');
                fotoImg.src = registro.foto;
                fotoImg.width = 50;
                celdaFoto.appendChild(fotoImg);
            }
        });
    })
    .catch(error => {
        console.error('Error al cargar los registros:', error);
    });
}

function mostrarSeccion(idSeccion) {
    document.getElementById('seccion-formulario').style.display = 'none';
    document.getElementById('seccion-lista').style.display = 'none';
    document.getElementById(idSeccion).style.display = 'block';
}

mostrarSeccion('seccion-formulario');

