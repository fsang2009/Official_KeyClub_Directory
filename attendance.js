import { database } from './firebaseconfig';
import { collection, addDoc, onSnapshot, getDocs, doc, getDoc, deleteDoc } from 'firebase/firestore';

document.addEventListener('DOMContentLoaded', () => {

    // DOM ELEMENTS
    const addEventButton = document.getElementById('add-event-button');
    const addEventModal = document.getElementById('add-event-modal');
    const addEventForm = document.getElementById('add-event-form');
    const closeEventModalButton = document.getElementById('event-modal-close-btn');
    const cancelEventModalButton = document.getElementById('event-modal-cancel-btn');
    const serviceEventList = document.getElementById('service-event-list');
    const meetingEventList = document.getElementById('meeting-event-list');


    // ADD EVENT MODAL
    const openEventModal = () => {
        addEventModal.classList.add('active');
    };

    const closeEventModal = () => {
        addEventModal.classList.remove('active');
    };

    addEventButton.addEventListener('click', () => {
        console.log('add event button event listener working');
        openEventModal();
    });

    closeEventModalButton.addEventListener('click', () => {
        console.log('closeEventModalButton working');
        closeEventModal();
    });

    cancelEventModalButton.addEventListener('click', closeEventModal);


    // DATE FORMATTER
    const formatEventDate = (dateString) => {
        const [year, month, day] = dateString.split('-');
        const date = new Date(Number(year), Number(month) - 1, Number(day));

        return {
            month: date.toLocaleString('en-US', { month: 'short' }).toUpperCase(),
            day
        };
    };


    // MEETING HTML
    const createMeetingEventHTML = (event, eventID) => {
        const date = formatEventDate(event.eventDate);

        return `
            <article class="event-row">
                <div class="event-date">
                    <span class="event-month">${date.month}</span>
                    <span class="event-day">${date.day}</span>
                </div>

                <div class="event-main-info">
                    <div class="event-name">${event.eventName}</div>

                    <div class="event-meta">
                        <span>${event.eventTime}</span>
                        <span class="meta-divider">•</span>
                        <span>${event.eventLocation}</span>
                    </div>

                    <div class="event-attendance">${event.volunteerTotal} attendees</div>
                </div>

                <div class="event-actions">
                    <span class="event-type-badge meeting">Meeting</span>

                    <button type="button" class="view-event1-button" data-id="${eventID}">
                        View Event
                    </button>

                    <button
                type="button"
                class="delete-event-button"
                data-id="${eventID}"
                aria-label="Delete event"
            >
                🗑
            </button>
                </div>
            </article>
        `;
    };


    // SERVICE HTML
    const createServiceEventHTML = (event, eventID) => {
        const date = formatEventDate(event.eventDate);

        return `
            <article class="event-row">
    <div class="event-date service-date">
        <span class="event-month">${date.month}</span>
        <span class="event-day">${date.day}</span>
    </div>

    <div class="event-main-info">
        <div class="event-name">${event.eventName}</div>

        <div class="event-meta">
            <span>${event.eventTime}</span>
            <span class="meta-divider">•</span>
            <span>${event.eventLocation}</span>
        </div>

        <div class="event-attendance">
            ${event.volunteerTotal} volunteers
        </div>
    </div>

    <div class="event-actions">
        <span class="event-type-badge service">Service</span>

        <div class="event-button-group">
            <button
                type="button"
                class="view-event1-button"
                data-id="${eventID}"
            >
                View Event
            </button>

            <button
                type="button"
                class="delete-event-button"
                data-id="${eventID}"
                aria-label="Delete event"
            >
                🗑
            </button>
        </div>
    </div>
</article>
        `;
    };


    // LIVE EVENT LIST
    const renderEventLists = () => {
        onSnapshot(collection(database, 'events'), (snapshot) => {
            let meetingHTML = '';
            let serviceHTML = '';

            snapshot.forEach((eventDoc) => {
                const eventData = eventDoc.data();
                const eventID = eventDoc.id;

                if (eventData.eventType === 'meeting') {
                    meetingHTML += createMeetingEventHTML(eventData, eventID);
                }

                if (eventData.eventType === 'service') {
                    serviceHTML += createServiceEventHTML(eventData, eventID);
                }
            });

            meetingEventList.innerHTML = meetingHTML;
            serviceEventList.innerHTML = serviceHTML;
        });
    };


    // ADD EVENT
    addEventForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const eventName = document.getElementById('event-name').value.trim();
        const eventDate = document.getElementById('event-date').value;
        const eventTime = document.getElementById('event-time').value;
        const eventType = document.getElementById('event-type').value;
        const eventLocation = document.getElementById('event-location').value.trim();
        const eventDescription = document.getElementById('event-description').value.trim();

        try {
            await addDoc(collection(database, 'events'), {
                eventName,
                eventDate,
                eventTime,
                eventType: eventType.toLowerCase(),
                eventLocation,
                eventDescription,
                volunteerTotal: 0
            });

            addEventForm.reset();
            closeEventModal();

        } catch (error) {
            console.error('Error adding event:', error);
        }
    });


    // SEARCH EVENTS
    const serviceEventSearch = document.getElementById('service-search-bar');
    const meetingEventSearch = document.getElementById('meeting-search-bar');


    // SERVICE SEARCH
    serviceEventSearch.addEventListener('input', async (event) => {
        const key = event.target.value;
        const cleanKey = key.toLowerCase().replace(/\s+/g, '');

        try {
            const querySnapshot = await getDocs(collection(database, 'events'));

            const fullEventsArray = querySnapshot.docs.map((eventDoc) => ({
                id: eventDoc.id,
                ...eventDoc.data()
            }));

            const serviceArray = fullEventsArray.filter((event) => {
                return event.eventType === 'service';
            });

            const liveRenderServiceArray = serviceArray.filter((event) => {
                const eventName = event.eventName.toLowerCase().replaceAll(' ', '');
                return eventName.includes(cleanKey);
            });

            let html = '';

            liveRenderServiceArray.forEach((event) => {
                html += createServiceEventHTML(event, event.id);
            });

            serviceEventList.innerHTML = html;

        } catch (error) {
            console.log(error);
        }
    });


    // MEETING SEARCH
    meetingEventSearch.addEventListener('input', async (event) => {
        const key = event.target.value;
        const cleanKey = key.toLowerCase().replace(/\s+/g, '');

        try {
            const querySnapshot = await getDocs(collection(database, 'events'));

            const fullEventsArray = querySnapshot.docs.map((eventDoc) => ({
                id: eventDoc.id,
                ...eventDoc.data()
            }));

            const meetingArray = fullEventsArray.filter((event) => {
                return event.eventType === 'meeting';
            });

            const liveRenderMeetingArray = meetingArray.filter((event) => {
                const eventName = event.eventName.toLowerCase().replaceAll(' ', '');
                return eventName.includes(cleanKey);
            });

            let html = '';

            liveRenderMeetingArray.forEach((event) => {
                html += createMeetingEventHTML(event, event.id);
            });

            meetingEventList.innerHTML = html;

        } catch (error) {
            console.log(error);
        }
    });


    // MEMBER COUNT
    let memberCount = 0;

    const getMemberCount = async () => {
        const snapshot = await getDocs(collection(database, 'users'));
        memberCount = snapshot.docs.length;
    };


    // MEETING DETAIL MODAL
    const meetingEventDetailModal = document.getElementById('meeting-modal');

    const meetingTitle = document.getElementById('meeting-title');
    const meetingDate = document.getElementById('meeting-date');
    const meetingTime = document.getElementById('meeting-time');
    const meetingLocation = document.getElementById('meeting-location');
    const meetingAttendance = document.getElementById('meeting-attendance');
    const meetingDescription = document.getElementById('meeting-description');
    const meetingSummaryAttendance = document.getElementById('summary-attendance');
    const meetingSummaryAbsence = document.getElementById('summary-absence');
    const meetingSummaryPercentage = document.getElementById('summary-attendance-percentage');


    // SERVICE DETAIL MODAL
    const serviceEventDetailModal = document.getElementById('service-modal');

    const serviceTitle = document.getElementById('service-title');
    const serviceDate = document.getElementById('service-date');
    const serviceTime = document.getElementById('service-time');
    const serviceLocation = document.getElementById('service-location');
    const serviceAttendance = document.getElementById('service-attendance');
    const serviceDescription = document.getElementById('service-description');
    const serviceSummaryAttendance = document.getElementById('service-summary-attendance');
    const serviceSummaryAbsence = document.getElementById('service-summary-absence');
    const serviceSummaryPercentage = document.getElementById('service-summary-attendance-percentage');


    // OPEN SELECTED EVENT
    const openSelectedEvent = async (event) => {
        const eventTarget = event.target.closest('.view-event1-button');
        if (!eventTarget) return;

        const selectedEventID = eventTarget.dataset.id;

        try {
            const eventRef = doc(database, 'events', selectedEventID);
            const eventSnapshot = await getDoc(eventRef);

            if (!eventSnapshot.exists()) {
                console.log('Event does not exist.');
                return;
            }

            const actualEventData = eventSnapshot.data();
            const attendance = actualEventData.volunteerTotal || 0;
            const absences = Math.max(memberCount - attendance, 0);
            const percentage = memberCount > 0
                ? Math.round(100 * (attendance / memberCount))
                : 0;


            // MEETING
            if (actualEventData.eventType === 'meeting') {
                meetingEventDetailModal.classList.add('active');

                meetingTitle.innerHTML = actualEventData.eventName;
                meetingDate.innerHTML = actualEventData.eventDate;
                meetingTime.innerHTML = actualEventData.eventTime;
                meetingLocation.innerHTML = actualEventData.eventLocation;
                meetingAttendance.innerHTML = attendance;
                meetingDescription.innerHTML = actualEventData.eventDescription;
                meetingSummaryAttendance.innerHTML = attendance;
                meetingSummaryAbsence.innerHTML = absences;
                meetingSummaryPercentage.innerHTML = `${percentage}%`;
            }


            // SERVICE
            else if (actualEventData.eventType === 'service') {
                serviceEventDetailModal.classList.add('active');

                serviceTitle.innerHTML = actualEventData.eventName;
                serviceDate.innerHTML = actualEventData.eventDate;
                serviceTime.innerHTML = actualEventData.eventTime;
                serviceLocation.innerHTML = actualEventData.eventLocation;
                serviceAttendance.innerHTML = attendance;
                serviceDescription.innerHTML = actualEventData.eventDescription;
                serviceSummaryAttendance.innerHTML = attendance;
                serviceSummaryAbsence.innerHTML = absences;
                serviceSummaryPercentage.innerHTML = `${percentage}%`;
            }

        } catch (error) {
            console.error('Error retrieving event:', error);
        }
    };


    // CLOSE MEETING MODAL
    const closeMeetingModalBtn = document.getElementById('close-meeting-modal');

    closeMeetingModalBtn.addEventListener('click', () => {
        meetingEventDetailModal.classList.remove('active');
    });


    // CLOSE SERVICE MODAL
    const closeServiceModalBtn = document.getElementById('close-service-modal');

    closeServiceModalBtn.addEventListener('click', () => {
        serviceEventDetailModal.classList.remove('active');
    });


    // VIEW EVENT LISTENERS
    const setupEventViewListener = () => {
        meetingEventList.addEventListener('click', openSelectedEvent);
        serviceEventList.addEventListener('click', openSelectedEvent);
    };




    // DELETE EVENT
const deleteEventModal = document.getElementById('delete-event-modal');
const deleteEventButton = document.getElementById('confirm-event-delete');
const cancelDeleteEventButton = document.getElementById('cancel-event-delete');

let eventIdToDelete = null;


// OPEN DELETE MODAL
const deleteSelectedEvent = (event) => {
    const deleteButton = event.target.closest('.delete-event-button');

    if (!deleteButton) return;

    eventIdToDelete = deleteButton.dataset.id;

    console.log('Selected event for deletion:', eventIdToDelete);

    deleteEventModal.classList.add('active');
};


// SETUP DELETE LISTENERS
const setupEventDeleteListener = () => {
    meetingEventList.addEventListener('click', deleteSelectedEvent);
    serviceEventList.addEventListener('click', deleteSelectedEvent);
};


// CONFIRM DELETE
deleteEventButton.addEventListener('click', async () => {
    if (!eventIdToDelete) return;

    try {
        const eventRef = doc(database, 'events', eventIdToDelete);

        await deleteDoc(eventRef);

        deleteEventModal.classList.remove('active');
        eventIdToDelete = null;

    } catch (error) {
        console.error('Error deleting event:', error);
    }
});


// CANCEL DELETE
cancelDeleteEventButton.addEventListener('click', () => {
    deleteEventModal.classList.remove('active');
    eventIdToDelete = null;
});


    // INITIALIZE
    // INITIALIZE
getMemberCount();
renderEventLists();
setupEventViewListener();
setupEventDeleteListener();

});