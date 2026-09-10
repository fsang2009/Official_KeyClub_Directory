import { database } from './firebaseconfig';

import {
  collection,
  addDoc,
  onSnapshot,
  doc,
  deleteDoc,
  getDocs
} from 'firebase/firestore';


document.addEventListener('DOMContentLoaded', ()=>{

// ============================================================
// ELEMENTS
// ============================================================

const addStudentButton = document.getElementById('add-student-button');

const studentList = document.getElementById('student-info-container');

const removeStudentModal = document.getElementById(
  'remove-student-modal'
);

const addStudentForm = document.getElementById('add-student-form');

const addStudentModal = document.getElementById('add-student-modal');

const closeStudentModal = document.getElementById('modal-close-btn');

const cancelStudentAddButton = document.getElementById(
  'modal-cancel-btn'
);

const studentIDInput = document.getElementById('student-id');
const studentFirstNameInput = document.getElementById('first-name');
const studentLastNameInput = document.getElementById('last-name');
const studentGradeInput = document.getElementById('grade');

const searchbar = document.getElementById('search-bar');

const removeMultipleStudentsButton = document.getElementById(
  'remove-multiple-students-button'
);

const confirmRemovalBtn = document.getElementById(
  'confirm-remove-multiple'
);


// ============================================================
// VARIABLES
// ============================================================

let selectedStudentId = null;

let removeMode = false;

let studentRemovalArray = [];


// ============================================================
// STUDENT HTML
// ============================================================

const createStudentHTML = (student, docId) => {
  return `
    <div class="student-info-bar">

      <div class="student-main-info">

        <div class="student-name">
          ${student.firstName} ${student.lastName}
        </div>

        <div class="student-basic-info">
          <span>ID: ${student.studentID}</span>
          <span>Grade: ${student.grade}</span>
        </div>

      </div>

      <div class="student-stats">

        <div class="student-stat">
          Hours: ${student.hours}
        </div>

        <div class="student-stat">
          Points: ${student.points}
        </div>

        <button
          class="remove-student"
          data-id="${docId}"
          style="background: red;"
        >
          🗑
        </button>

        <input
          type="checkbox"
          data-id="${docId}"
          class="remove-checkboxes ${removeMode ? 'active' : ''}"
        >

      </div>

    </div>
  `;
};


// ============================================================
// RENDER STUDENTS
// ============================================================

const renderStudentList = () => {

  if (!studentList) return;

  onSnapshot(collection(database, 'users'), (snapshot) => {

    let html = '';

    snapshot.forEach((studentDoc) => {

      const student = studentDoc.data();

      const docId = studentDoc.id;

      html += createStudentHTML(student, docId);

    });

    studentList.innerHTML = html;
  });
};


// ============================================================
// SINGLE STUDENT DELETE
// ============================================================

const setupDeleteListener = () => {

  if (!studentList) return;
  studentList.addEventListener('click', (event) => {
    const deleteButton = event.target.closest('.remove-student');
    if (!deleteButton) return;

    selectedStudentId = deleteButton.dataset.id;

    console.log(
      'Opening delete modal for document ID:',
      selectedStudentId
    );

    removeStudentModal.classList.add('active');
  });
};





// ============================================================
// SEARCH STUDENTS
// ============================================================
/*
searchbar.addEventListener('input', async (event) => {

  const key = event.target.value;

  const cleanKey =
    key
      .toLowerCase()
      .replace(/\s+/g, '');


  try {
    const querySnapshot = await getDocs(
      collection(database, 'users')
    );


    const renderArray =
      querySnapshot.docs.map((studentDoc) => ({
        id: studentDoc.id,
        ...studentDoc.data()
      }));


    const liveRenderArray =
      renderArray.filter((user) => {

        const userFirstName =
          String(user.firstName || '')
            .toLowerCase();
        const userLastName =
          String(user.lastName || '')
            .toLowerCase();
        const userStudentID =
          String(user.studentID || '')
            .toLowerCase();
        const userFirstAndLastName =
          `${userFirstName}${userLastName}`;
        return (
          userFirstName.includes(cleanKey) ||
          userLastName.includes(cleanKey) ||
          userStudentID.includes(cleanKey) ||
          userFirstAndLastName.includes(cleanKey)
        );
      });


    let html = '';


    liveRenderArray.forEach((student) => {

      html += createStudentHTML(
        student,
        student.id
      );

    });


    studentList.innerHTML = html;


  } catch (error) {

    console.error(
      'Error searching students:',
      error
    );

  }

});

*/



// ============================================================
// EVENT ADDING
// ============================================================

const addEventButton = document.getElementById('add-event-button');
const addEventModal = document.getElementById('add-event-modal');
const closeEventModalButton = document.getElementById('event-modal-close-btn');
const cancelEventModalButton = document.getElementById('event-modal-cancel-btn');


const viewEventModal = ()=>{
    addEventModal.classList.add('active');
}

addEventButton.addEventListener('click',()=>{
    console.log('add event working');
    viewEventModal();
})

const closeEventModal = ()=>{
    addEventModal.classList.remove('active');
}


closeEventModalButton.addEventListener('click',()=>{closeEventModal()});
cancelEventModalButton.addEventListener('click',()=>{closeEventModal()});

addEventModal.addEventListener('submit', async(event)=>{
    event.preventDefault();
    const eventName = document.getElementById('event-name').value;
    const eventDate = document.getElementById('event-date').value;
    const eventTime = document.getElementById('event-time').value;
    const eventType = document.getElementById('event-type').value;
    const eventDescription = document.getElementById('event-description').value;

    const collectionRef = collection(database, "events");
    try{
        await addDoc(collectionRef,{
            eventName: eventName,
            eventDate: eventDate,
            eventTime: eventTime,
            eventType: eventType,
            eventDescription: eventDescription
        } );

        event.target.reset();
        closeEventModal();
    
    } catch(error){
        console.log(error);
    }



})



// ============================================================
// INITIALIZE
// ============================================================

document.addEventListener(
  'DOMContentLoaded',
  () => {
    renderStudentList();
    setupDeleteListener();
  }
);
})