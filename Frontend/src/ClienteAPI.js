class ClienteAPI {

    baseURL = "http://localhost:3000"

    async subirVideo(idUsuario, video) {
        try {
            const url = `${this.baseURL}/usuarios/${idUsuario}/video`;
            const formData = new FormData();
            formData.append('video', video);

            const response = await fetch(url, {
                method: 'PATCH',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token'),
                },
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Error al subir el video');
            }

            return await response.json();
        } catch (error) {
            console.error('Error subiendo video:', error.message);
            throw error;
        }
    }

    async registro(usuario) {
        try {
            const url = `${this.baseURL}/usuarios`;
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(usuario)
            });

            return await response.json();
        } catch (error) {
            console.error('Error al registrar usuario:', error.message);
            throw error;
        }
    }

    async login(email, password) {
        try {
            const url = `${this.baseURL}/login`;
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            return await response.json();
        } catch (error) {
            console.error('Error al iniciar sesión:', error.message);
            throw error;
        }
    }

    async actualizarDatosUsuario(id, usuario) {
        try {
            const url = `${this.baseURL}/usuarios/${id}`;
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token'),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(usuario)
            });

            if (!response.ok) {
                throw new Error('Error al actualizar datos de usuario');
            }

            return await response.json();
        } catch (error) {
            console.error('Error al actualizar datos de usuario:', error.message);
            throw error;
        }
    }

    async borrarCuenta(id) {
        try {
            const url = `${this.baseURL}/usuarios/${id}`;
            const response = await fetch(url, {
                method: 'DELETE',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token'),
                },
            });

            return response.status;
        } catch (error) {
            console.error('Error al borrar cuenta de usuario:', error.message);
            throw error;
        }
    }

    async obtenerInformacionUsuario(id) {
        try {
            const url = `${this.baseURL}/usuarios/${id}`;
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error('Error al obtener información de usuario');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error al obtener información de usuario:', error.message);
            throw error;
        }
    }

    async buscarUsuarioPorNick(nick) {
        try {
            const url = `${this.baseURL}/usuarios/buscar/${nick}`;
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token'),
                },
            });

            return await response.json();
        } catch (error) {
            console.error('Error al buscar usuario por nick:', error.message);
            throw error;
        }
    }

    async enviarPeticionAmistad(idEmisor, idReceptor) {
        try {
            const url = `${this.baseURL}/usuarios/${idEmisor}/peticiones/${idReceptor}`;
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token'),
                },
            });

            if (!response.ok) {
                throw new Error('Error al enviar petición de amistad: ' + response.message);
            }

            return await response.json();
        } catch (error) {
            console.error('Error al enviar petición de amistad:', error.message);
            throw error;
        }
    }

    async verListadoPeticionesAmistadUsuario(id) {
        try {
            const url = `${this.baseURL}/usuarios/${id}/peticiones`;
            const response = await fetch(url,{
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token'),
                },
            });

            if (!response.ok) {
                throw new Error('Error al ver listado de peticiones de amistad de usuario');
            }

            return await response.json();
        } catch (error) {
            console.error('Error al ver listado de peticiones de amistad de usuario:', error.message);
            throw error;
        }
    }

    async aceptarPeticionAmistad(idPeticion) {
        try {
            const url = `${this.baseURL}/peticiones/${idPeticion}/aceptar`;
            const response = await fetch(url, {
                method: 'DELETE',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token'),
                },
            });

            return response.status;
        } catch (error) {
            console.error('Error al aceptar petición de amistad:', error.message);
            throw error;
        }
    }

    async rechazarPeticionAmistad(idPeticion) {
        try {
            const url = `${this.baseURL}/peticiones/${idPeticion}/rechazar`;
            const response = await fetch(url, {
                method: 'DELETE',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token'),
                },
            });

            return response.status;
        } catch (error) {
            console.error('Error al rechazar petición de amistad:', error.message);
            throw error;
        }
    }

    async borrarRelacionAmistad(id1, id2) {
        try {
            const url = `${this.baseURL}/amistad/${id1}/${id2}`;
            const response = await fetch(url, {
                method: 'DELETE',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token'),
                },
            });

            return response.status;
        } catch (error) {
            console.error('Error al borrar relacion de amistad:', error.message);
            throw error;
        }
    }

    async verListadoAmigos(id) {
        try {
            const url = `${this.baseURL}/usuarios/${id}/amigos`;
            const response = await fetch(url,{
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token'),
                },
            });

            if (!response.ok) {
                throw new Error('Error al ver listado de amigos');
            }

            return await response.json();
        } catch (error) {
            console.error('Error al ver listado de amigos:', error.message);
            throw error;
        }
    }

    async verVideoUsuario(id) {
        try {
            const url = `${this.baseURL}/usuarios/${id}/video`;
            const response = await fetch(url,{
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token'),
                },
            });

            if (!response.ok) {
                throw new Error('Error al ver video de usuario');
            }

            return response.blob();
        } catch (error) {
            console.error('Error al ver video de usuario:', error.message);
            throw error;
        }
    }

    async publicarVideo(id, video) {
        try {
            const url = `${this.baseURL}/usuarios/${id}/video`;
            const formData = new FormData();
            formData.append('video', video);

            const response = await fetch(url, {
                method: 'PATCH',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token'),
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error('Error al publicar video de usuario');
            }

            return await response.json();
        } catch (error) {
            console.error('Error al publicar video de usuario:', error.message);
            throw error;
        }
    }

    async subirFoto(idUsuario, foto) {
        try {
            const url = `${this.baseURL}/usuarios/${idUsuario}/foto`;
            const formData = new FormData();
            formData.append('foto', foto);
    
            const response = await fetch(url, {
                method: 'PATCH',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token'),
                },
                body: formData,
            });
    
            if (!response.ok) {
                throw new Error('Error al subir la foto');
            }
    
            return await response.json();
        } catch (error) {
            console.error('Error subiendo foto:', error.message);
            throw error;
        }
    }

}

export default ClienteAPI;