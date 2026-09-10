import { database } from './firebaseconfig';
import { collection, addDoc, onSnapshot, getDocs, doc, getDoc } from 'firebase/firestore';

document.addEventListener('DOMContentLoaded', () => {

    // DOM ELEMENTS
    const addEventButton = document.getElementById('add-event-button');
    const addEventModal = document.getElementById('add-event-modal');
    const addEventForm = document.getElementById('add-event-form');
    const closeEventModalButton = document.getElementById('event-modal-close-btn');
    const cancelEventModalButton = document.getElementById('event-modal-cancel-btn');
    const serviceEventList = document.getElementById('service-event-list');
    const meetingEventList = document.getElementById('meeting-event-list');


    // MODAL
    const openEventModal = () => {
        addEventModal.classList.add('active');
    };

    const closeEventModal = () => {
        addEventModal.classList.remove('active');
    };

    addEventButton.addEventListener('click', ()=>{
        console.log('add event button event listener working');
        addEventModal.classList.add('active');
        openEventModal();
    });
    closeEventModalButton.addEventListener('click', ()=>{
        console.log('closeEventModalButton working ');
        closeEventModal();
    });
    cancelEventModalButton.addEventListener('click', closeEventModal());


    // DATE FORMATTER
    const formatEventDate = (dateString) => {
        const [year, month, day] = dateString.split('-');

        const date = new Date(
            Number(year),
            Number(month) - 1,
            Number(day)
        );

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

                    <div class="event-attendance">
                        ${event.volunteerTotal} attendees
                    </div>
                </div>

                <div class="event-actions">
                    <span class="event-type-badge meeting">Meeting</span>

                    <button
                        type="button"
                        class="view-event1-button"
                        data-id="${eventID}"
                    >
                        View Event
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

                    <button
                        type="button"
                        class="view-event1-button"
                        data-id="${eventID}"
                    >
                        View Event
                    </button>
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

    //search events 
    const serviceEventSearch = document.getElementById('service-search-bar');
    const meetingEventSearch = document.getElementById('meeting-search-bar');


    serviceEventSearch.addEventListener('input', async(event)=>{
        const key = event.target.value;

        const cleanKey = key.toLowerCase().replace(/\s+/g, '');

        try {
            const querySnapshot = await getDocs(
                collection(database, "events")
            );

            const fullEventsArray = querySnapshot.docs.map((eventDoc)=>({
                id: eventDoc.id,
                ...eventDoc.data()
            }));

            const serviceArray = fullEventsArray.filter(event=>{return event.eventType === 'service'})
            const liveRenderServiceArray = serviceArray.filter((event)=>{
                const eventName = event.eventName.toLowerCase().replaceAll(' ', '');
                return(
                    eventName.includes(cleanKey)
                );
            });

            let html = ''
            liveRenderServiceArray.forEach((event)=>{
                html += createServiceEventHTML(
                    event, 
                    event.id
                );
            });

            serviceEventList.innerHTML= html;
        }catch(error){
            console.log(error);
        }
    }
) 

// view event modal

let memberCount = 0;

const getMemberCount = async () => {
    const snapshot = await getDocs(collection(database, 'users'));
    memberCount = snapshot.docs.length;
};

const meetingEventDetailModal = document.getElementById('meeting-modal');

const meetingTitle = document.getElementById('meeting-title');
const meetingDate = document.getElementById('meeting-date');
const meetingTime = document.getElementById('meeting-time');
const meetingLocation = document.getElementById('meeting-location');
const meetingAttendance = document.getElementById('meeting-attendance');
const meetingDescription = document.getElementById('meeting-description');
const meetingSummaryAttendance = document.getElementById('summary-attendance');
const meetingSummaryAbsence = document.getElementById('sumary-absence');
const meetingSummaryPercentage = document.getElementById('summary-attendance-percentage');


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

        if (actualEventData.eventType === 'meeting') {
            meetingEventDetailModal.classList.add('active');

            // We'll populate the modal here next
        }

        else if (actualEventData.eventType === 'service') {
            // We'll open/populate service modal here next
        }

    } catch (error) {
        console.error('Error retrieving event:', error);
    }
};


const setupEventViewListener = () => {
    meetingEventList.addEventListener('click', openSelectedEvent);
    serviceEventList.addEventListener('click', openSelectedEvent);
};

    // INITIALIZE
    renderEventLists();
    setupEventViewListener();
    getMemberCount();

});

 