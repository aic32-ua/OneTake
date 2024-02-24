class ClienteAPI {

    baseURL = "http://localhost:3000"

    async subirVideo(idUsuario, video) {
        try {
            const url = `${this.baseURL}/usuarios/${idUsuario}/video`;
            const formData = new FormData();
            formData.append('video', video);

            const response = await fetch(url, {
                method: 'POST',
                // headers: {
                //     'Authorization': 'Bearer ' + localStorage.getItem('token'),
                // },
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Error al subir la foto de la serie');
            }

            return await response.json();
        } catch (error) {
            console.error('Error subiendo video:', error.message);
            throw error;
        }
    }

}

export default ClienteAPI;