import { database } from './firebaseconfig';
import {
    collection,
    addDoc,
    onSnapshot,
    getDocs,
    doc,
    getDoc,
    deleteDoc,
    updateDoc,
    increment
} from 'firebase/firestore';
document.addEventListener('DOMContentLoaded', () => {

    // DOM ELEMENTS
    const eventAttendeeList = document.getElementById('event-attendee-list');
const eventTypeInput = document.getElementById('event-type');
    const addEventButton = document.getElementById('add-event-button');
    const addEventModal = document.getElementById('add-event-modal');
    const addEventForm = document.getElementById('add-event-form');
    const closeEventModalButton = document.getElementById('event-modal-close-btn');
    const cancelEventModalButton = document.getElementById('event-modal-cancel-btn');
    const serviceEventList = document.getElementById('service-event-list');
    const meetingEventList = document.getElementById('meeting-event-list');
const attendeeSearch = document.getElementById('attendee-search');
const selectAllAttendees = document.getElementById('select-all-attendees');
const clearAttendees = document.getElementById('clear-attendees');
const selectedAttendeeCount = document.getElementById('selected-attendee-count');



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


    // ATTENDEE SELECTOR

const renderAttendeeList = async () => {
    const snapshot = await getDocs(collection(database, 'users'));

    let html = '';

    snapshot.forEach((studentDoc) => {
        const student = studentDoc.data();

        html += `
            <div
                class="event-student-option"
                data-search="${student.firstName.toLowerCase()}${student.lastName.toLowerCase()}${String(student.studentID)}"
            >
                <label class="event-student-main">
                    <input
                        type="checkbox"
                        class="event-student-checkbox"
                        data-id="${studentDoc.id}"
                        data-name="${student.firstName} ${student.lastName}"
                    >

                    <div>
                        <div class="event-student-name">
                            ${student.firstName} ${student.lastName}
                        </div>

                        <div class="event-student-id">
                            ID: ${student.studentID}
                        </div>
                    </div>
                </label>

                <div class="service-hours-container">
                    <input
                        type="number"
                        class="service-hours-input"
                        data-id="${studentDoc.id}"
                        min="0.5"
                        step="0.5"
                        value="1"
                    >

                    <span>hrs</span>
                </div>
            </div>
        `;
    });

    eventAttendeeList.innerHTML = html;
};


const updateSelectedCount = () => {
    const selected = document.querySelectorAll(
        '.event-student-checkbox:checked'
    ).length;

    selectedAttendeeCount.innerText = `${selected} selected`;
};


const updateAttendeeRows = () => {
    const studentRows = document.querySelectorAll('.event-student-option');

    studentRows.forEach((row) => {
        const checkbox = row.querySelector('.event-student-checkbox');

        row.classList.toggle('selected', checkbox.checked);
        row.classList.toggle(
            'service-mode',
            eventTypeInput.value === 'service'
        );
    });

    updateSelectedCount();
};


eventAttendeeList.addEventListener('change', (event) => {
    if (!event.target.classList.contains('event-student-checkbox')) return;

    updateAttendeeRows();
});


eventTypeInput.addEventListener('change', () => {
    updateAttendeeRows();
});


attendeeSearch.addEventListener('input', (event) => {
    const key = event.target.value.toLowerCase().replace(/\s+/g, '');

    const studentRows = document.querySelectorAll('.event-student-option');

    studentRows.forEach((row) => {
        const studentSearch = row.dataset.search;

        if (studentSearch.includes(key)) {
            row.style.display = 'flex';
        } else {
            row.style.display = 'none';
        }
    });
});


selectAllAttendees.addEventListener('click', () => {
    const checkboxes = document.querySelectorAll('.event-student-checkbox');

    checkboxes.forEach((checkbox) => {
        checkbox.checked = true;
    });

    updateAttendeeRows();
});


clearAttendees.addEventListener('click', () => {
    const checkboxes = document.querySelectorAll('.event-student-checkbox');

    checkboxes.forEach((checkbox) => {
        checkbox.checked = false;
    });

    updateAttendeeRows();
});



    // ADD EVENT
    // ADD EVENT

addEventForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const eventName = document.getElementById('event-name').value.trim();
    const eventDate = document.getElementById('event-date').value;
    const eventTime = document.getElementById('event-time').value;
    const eventType = document.getElementById('event-type').value.toLowerCase();
    const eventLocation = document.getElementById('event-location').value.trim();
    const eventDescription = document.getElementById('event-description').value.trim();

    const selectedStudents = document.querySelectorAll(
        '.event-student-checkbox:checked'
    );

    const attendees = [];


    // BUILD ATTENDEE ARRAY
    selectedStudents.forEach((checkbox) => {
        const studentID = checkbox.dataset.id;
        const studentName = checkbox.dataset.name;

        let hoursAttended = 0;
        let pointsEarned = 0;


        // MEETING = 0.5 POINTS, 0 HOURS
        if (eventType === 'meeting') {
            pointsEarned = 0.5;
            hoursAttended = 0;
        }


        // SERVICE = HOURS AND POINTS ARE THE SAME
        if (eventType === 'service') {
            const hoursInput = document.querySelector(
                `.service-hours-input[data-id="${studentID}"]`
            );

            hoursAttended = Number(hoursInput.value);
            pointsEarned = hoursAttended;
        }


        attendees.push({
            studentID,
            studentName,
            hoursAttended,
            pointsEarned
        });
    });


    try {

        // CREATE EVENT
        await addDoc(collection(database, 'events'), {
            eventName,
            eventDate,
            eventTime,
            eventType,
            eventLocation,
            eventDescription,
            attendees,
            volunteerTotal: attendees.length
        });


        // UPDATE EACH STUDENT
        for (const attendee of attendees) {
            const studentRef = doc(
                database,
                'users',
                attendee.studentID
            );

            await updateDoc(studentRef, {
                points: increment(attendee.pointsEarned),
                hours: increment(attendee.hoursAttended)
            });
        }


        addEventForm.reset();

        attendeeSearch.value = '';

        document.querySelectorAll('.event-student-option').forEach((row) => {
            row.style.display = 'flex';
        });

        clearAttendees.click();

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


//update student points/hours from event entry

const renderEventStudentList = async () => {
    const snapshot = await getDocs(collection(database, 'users'));

    let html = '';

    snapshot.forEach((studentDoc) => {
        const student = studentDoc.data();

        html += `
            <div class="event-student-option">
                <div class="event-student-main">
                    <input
                        type="checkbox"
                        class="event-student-checkbox"
                        data-id="${studentDoc.id}"
                        data-name="${student.firstName} ${student.lastName}"
                    >

                    <div>
                        <div class="event-student-name">
                            ${student.firstName} ${student.lastName}
                        </div>

                        <div class="event-student-id">
                            ID: ${student.studentID}
                        </div>
                    </div>
                </div>

                <div class="service-hours-container">
                    <label>Hours</label>

                    <input
                        type="number"
                        class="service-hours-input"
                        data-id="${studentDoc.id}"
                        min="0.5"
                        step="0.5"
                        value="0.5"
                    >
                </div>
            </div>
        `;
    });

    eventAttendeeList.innerHTML = html;

    updateAttendanceInputType();
};

const updateAttendanceInputType = () => {
    const serviceHourInputs = document.querySelectorAll('.service-hours-container');

    serviceHourInputs.forEach((container) => {
        if (eventTypeInput.value === 'service') {
            container.style.display = 'flex';
        } else {
            container.style.display = 'none';
        }
    });
};

eventTypeInput.addEventListener('change', updateAttendanceInputType); 

    // INITIALIZE
    // INITIALIZE
getMemberCount();
renderEventLists();
setupEventViewListener();
setupEventDeleteListener();
renderEventStudentList();
renderAttendeeList();
});