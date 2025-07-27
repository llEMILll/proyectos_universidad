document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('nav ul li a');
    const sections = document.querySelectorAll('.container section');

    // Referencias a formularios y listas
    const eventForm = document.getElementById('event-form');
    const eventMessage = document.getElementById('event-message');
    const eventList = document.getElementById('event-list');
    const noEventsMessage = document.getElementById('no-events-message');
    const eventLocationSelect = document.getElementById('event-location'); // Nuevo: el select de ubicaciones

    const locationForm = document.getElementById('location-form');
    const locationMessage = document.getElementById('location-message');
    const locationList = document.getElementById('location-list');
    const noLocationsMessage = document.getElementById('no-locations-message');

    const contactForm = document.getElementById('contact-form');
    const contactMessage = document.getElementById('contact-message');
    const contactList = document.getElementById('contact-list');
    const noContactsMessage = document.getElementById('no-contacts-message');

    const fullEventList = document.getElementById('full-event-list');
    const noFullEventsMessage = document.getElementById('no-full-events-message');

    // --- Funciones de Utilidad ---

    // Función para mostrar mensajes de feedback
    const showFeedback = (messageElement, type, text) => {
        messageElement.classList.remove('success', 'error');
        messageElement.classList.add(type);
        messageElement.textContent = text;
        messageElement.style.display = 'block';
        setTimeout(() => {
            messageElement.style.display = 'none';
        }, 5000);
    };

    // Función para obtener datos de localStorage
    const getData = (key) => {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    };

    // Función para guardar datos en localStorage
    const saveData = (key, data) => {
        localStorage.setItem(key, JSON.stringify(data));
    };

    // Función para encontrar un elemento por su ID en un array
    const findItemById = (items, id) => {
        return items.find(item => item.id === id);
    };

    // --- Funcionalidad de Navegación ---

    const showSection = (id) => {
        sections.forEach(section => {
            section.classList.remove('active-section');
        });
        document.getElementById(id).classList.add('active-section');
        
        // Cargar listas al cambiar de sección
        if (id === 'event-management' || id === 'event-consultation') {
            populateLocationSelect(); // Importante: Rellenar el select de ubicaciones
            renderEventList(eventList, 'events');
            renderEventList(fullEventList, 'events'); // Renderizar también para la consulta
        } else if (id === 'location-management') {
            renderLocationList();
        } else if (id === 'contact-management') {
            renderContactList();
        }
        // No es necesario cargar listas para 'help-section'
    };

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            navLinks.forEach(nav => nav.classList.remove('active'));
            e.target.classList.add('active');

            const sectionIdMap = {
                'nav-events': 'event-management',
                'nav-locations': 'location-management',
                'nav-contacts': 'contact-management',
                'nav-consultation': 'event-consultation',
                'nav-help': 'help-section' // Mapeo para la nueva sección de ayuda
            };
            const targetSectionId = sectionIdMap[e.target.id];
            if (targetSectionId) {
                showSection(targetSectionId);
            }
        });
    });

    // --- Gestión de Eventos ---

    // Función para poblar el <select> de ubicaciones
    const populateLocationSelect = () => {
        const locations = getData('locations');
        eventLocationSelect.innerHTML = '<option value="">Selecciona un lugar</option>'; // Opción por defecto
        if (locations.length === 0) {
            // Deshabilitar o mostrar mensaje si no hay ubicaciones
            eventLocationSelect.disabled = true;
            eventLocationSelect.innerHTML = '<option value="">No hay ubicaciones registradas</option>';
            return;
        }
        eventLocationSelect.disabled = false;
        locations.forEach(location => {
            const option = document.createElement('option');
            option.value = location.id; // Guardamos el ID de la ubicación
            option.textContent = location.title;
            eventLocationSelect.appendChild(option);
        });
    };

    const renderEventList = (targetListElement, storageKey) => {
        const events = getData(storageKey);
        const locations = getData('locations'); // Obtener todas las ubicaciones para buscar detalles
        targetListElement.innerHTML = ''; // Limpiar la lista existente

        const noItemsMsgElement = targetListElement.querySelector('.no-items') || (targetListElement.id === 'event-list' ? noEventsMessage : noFullEventsMessage);

        if (events.length === 0) {
            if (noItemsMsgElement) {
                noItemsMsgElement.style.display = 'block';
                targetListElement.appendChild(noItemsMsgElement); // Asegurar que el mensaje esté dentro del ul si no lo estaba
            }
            return;
        } else {
            if (noItemsMsgElement) {
                noItemsMsgElement.style.display = 'none';
            }
        }

        events.forEach((event, index) => {
            // Buscar los detalles completos de la ubicación
            const eventLocation = findItemById(locations, event.locationId);
            const locationName = eventLocation ? eventLocation.title : 'Ubicación Desconocida';
            const locationAddress = eventLocation ? eventLocation.address : 'N/A';
            const locationCoordinates = eventLocation ? eventLocation.coordinates : 'N/A';

            const li = document.createElement('li');
            li.setAttribute('data-index', index); // Mantener el índice para eliminación por posición en el array
            li.setAttribute('data-id', event.id); // También añadir el ID para futuras referencias

            li.innerHTML = `
                <div>
                    <strong>${event.title}</strong>
                    <span>Invitados: ${event.guests || 'N/A'}</span>
                    <span>Fecha y Hora: ${new Date(event.datetime).toLocaleString()} (${event.timezone})</span>
                    <span>Lugar: ${locationName}</span>
                    <span>Dirección del Lugar: ${locationAddress}</span>
                    <span>Coordenadas: ${locationCoordinates}</span>
                    <span>Clasificación: ${event.classification || 'N/A'}</span>
                    <span>Descripción: ${event.description || 'Sin descripción'}</span>
                </div>
                <button class="btn-delete" data-type="${storageKey}" data-id="${event.id}">Eliminar</button>
            `;
            targetListElement.appendChild(li);
        });
    };

    eventForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // Validar que se ha seleccionado una ubicación
        if (!eventLocationSelect.value) {
            showFeedback(eventMessage, 'error', 'Por favor, selecciona un lugar para el evento.');
            return;
        }

        const eventData = {
            id: Date.now(), // ID único para el evento
            title: document.getElementById('event-title').value,
            guests: document.getElementById('event-guests').value,
            datetime: document.getElementById('event-datetime').value,
            timezone: document.getElementById('event-timezone').value,
            description: document.getElementById('event-description').value,
            repeat: document.getElementById('event-repeat').value,
            reminder: document.getElementById('event-reminder').value,
            classification: document.getElementById('event-classification').value,
            locationId: eventLocationSelect.value // Guardamos el ID de la ubicación seleccionada
        };

        const events = getData('events');
        events.push(eventData);
        saveData('events', events);
        showFeedback(eventMessage, 'success', '¡Evento guardado exitosamente!');
        eventForm.reset();
        eventLocationSelect.value = ''; // Resetear el selector también
        renderEventList(eventList, 'events'); // Actualizar la lista
        renderEventList(fullEventList, 'events'); // Actualizar la lista de consulta
    });

    // --- Gestión de Ubicaciones ---

    const renderLocationList = () => {
        const locations = getData('locations');
        locationList.innerHTML = '';
        if (locations.length === 0) {
            noLocationsMessage.style.display = 'block';
            locationList.appendChild(noLocationsMessage); // Asegurar que el mensaje esté dentro del ul
            return;
        }
        noLocationsMessage.style.display = 'none';

        locations.forEach((location) => { // Eliminado el index ya que eliminaremos por ID
            const li = document.createElement('li');
            li.setAttribute('data-id', location.id); // Usamos el ID como identificador principal
            li.innerHTML = `
                <div>
                    <strong>${location.title}</strong>
                    <span>Dirección: ${location.address}</span>
                    <span>Coordenadas: ${location.coordinates || 'N/A'}</span>
                </div>
                <button class="btn-delete" data-type="locations" data-id="${location.id}">Eliminar</button>
            `;
            locationList.appendChild(li);
        });
    };

    locationForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const locationData = {
            id: Date.now(), // ID único para la ubicación
            title: document.getElementById('location-title').value,
            address: document.getElementById('location-address').value,
            coordinates: document.getElementById('location-coordinates').value
        };

        const locations = getData('locations');
        locations.push(locationData);
        saveData('locations', locations);
        showFeedback(locationMessage, 'success', '¡Ubicación guardada exitosamente!');
        locationForm.reset();
        renderLocationList(); // Actualizar la lista de ubicaciones
        populateLocationSelect(); // Re-poblar el select de eventos para que la nueva ubicación aparezca
    });

    // --- Gestión de Contactos ---

    const renderContactList = () => {
        const contacts = getData('contacts');
        contactList.innerHTML = '';
        if (contacts.length === 0) {
            noContactsMessage.style.display = 'block';
            contactList.appendChild(noContactsMessage); // Asegurar que el mensaje esté dentro del ul
            return;
        }
        noContactsMessage.style.display = 'none';

        contacts.forEach((contact) => { // Eliminado el index
            const li = document.createElement('li');
            li.setAttribute('data-id', contact.id); // Usamos el ID
            li.innerHTML = `
                ${contact.photo ? `<img src="${contact.photo}" alt="Foto de ${contact.fullname}" class="contact-photo-thumbnail">` : ''}
                <div>
                    <strong>${contact.fullname}</strong>
                    <span>ID: ${contact.idNumber || 'N/A'}</span>
                    <span>Email: ${contact.email}</span>
                    <span>Teléfono: ${contact.phone || 'N/A'}</span>
                </div>
                <button class="btn-delete" data-type="contacts" data-id="${contact.id}">Eliminar</button>
            `;
            contactList.appendChild(li);
        });
    };

    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const contactData = {
            id: Date.now(), // ID único
            fullname: document.getElementById('contact-fullname').value,
            idNumber: document.getElementById('contact-id').value,
            email: document.getElementById('contact-email').value,
            phone: document.getElementById('contact-phone').value,
            photo: document.getElementById('contact-photo').value
        };

        const contacts = getData('contacts');
        contacts.push(contactData);
        saveData('contacts', contacts);
        showFeedback(contactMessage, 'success', '¡Contacto guardado exitosamente!');
        contactForm.reset();
        renderContactList(); // Actualizar la lista
    });

    // --- Funcionalidad de Eliminación General por ID ---

    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-delete')) {
            const itemType = e.target.dataset.type;
            const itemIdToDelete = parseInt(e.target.dataset.id); // Obtener el ID del elemento a eliminar
            
            let items = getData(itemType);
            
            if (confirm(`¿Estás seguro de que quieres eliminar este ${itemType.slice(0, -1)}?`)) {
                // Filtrar el array para eliminar el elemento por su ID
                items = items.filter(item => item.id !== itemIdToDelete);
                saveData(itemType, items); // Guardar el array actualizado

                // Volver a renderizar la lista correspondiente
                if (itemType === 'events') {
                    renderEventList(eventList, 'events');
                    renderEventList(fullEventList, 'events');
                } else if (itemType === 'locations') {
                    renderLocationList();
                    populateLocationSelect(); // Re-poblar el select de eventos por si se eliminó una ubicación usada
                    // Opcional: Podrías querer invalidar eventos que usaban esta ubicación eliminada o marcarlas como "ubicación eliminada"
                } else if (itemType === 'contacts') {
                    renderContactList();
                }
                showFeedback(
                    document.getElementById(`${itemType.slice(0, -1)}-message`) || eventMessage, // Mensaje para la sección correcta
                    'success',
                    `Elemento eliminado exitosamente de ${itemType}.`
                );
            }
        }
    });

    // --- Inicialización: Cargar datos al cargar la página y mostrar la sección de eventos ---
    populateLocationSelect(); // Asegurarse de que el selector de eventos esté lleno al inicio
    renderEventList(eventList, 'events');
    renderLocationList();
    renderContactList();
    renderEventList(fullEventList, 'events'); // Cargar para la sección de consulta también
    showSection('event-management'); // Asegurar que la sección de eventos esté activa al inicio
});