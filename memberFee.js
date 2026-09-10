import { database } from './firebaseconfig';

import {
  collection,
  addDoc,
  onSnapshot,
  doc,
  deleteDoc,
  getDocs,
  updateDoc
} from 'firebase/firestore';


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
  const isPaid = student.feePaid === true;

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

        <!-- PAYMENT STATUS -->
        <div class="student-payment-status">

          <input
            type="checkbox"
            class="payment-checkbox"
            data-id="${docId}"
            id ="payment-status-text"
            ${isPaid ? 'checked' : ''}
          >

          <span class="payment-status-label">
            Student Payment Status
          </span>

          <span class="payment-status-text"  data-id= "${docId}">
            ${isPaid ? 'Paid' : 'Not Paid'}
          </span>

        </div>


        <!-- REMOVE STUDENT BUTTON -->
        <button
          class="remove-student"
          data-id="${docId}"
        >
          🗑
        </button>


        <!-- MULTIPLE REMOVE CHECKBOX -->
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
// DELETE MODAL BUTTONS
// ============================================================

removeStudentModal.addEventListener('click', async (event) => {
  if (event.target.id === 'cancel-student-removal') {
    removeStudentModal.classList.remove('active');
    selectedStudentId = null;
  }

  if (event.target.id === 'confirm-student-removal') {
    if (!selectedStudentId) return;
    try {
      await deleteDoc(
        doc(database, 'users', selectedStudentId)
      );
      console.log(
        `Deleted student document: ${selectedStudentId}`
      );
      removeStudentModal.classList.remove('active');
      selectedStudentId = null;
    } catch (error) {

      console.error(
        'Error deleting student:',
        error
      );
    }
  }
});


// ============================================================
// ADD STUDENT
// ============================================================

addStudentForm.addEventListener('submit', async (event) => {

  event.preventDefault();

  const studentID =
    studentIDInput.value.trim();

  const studentFirstName =
    studentFirstNameInput.value.trim();

  const studentLastName =
    studentLastNameInput.value.trim();
  const studentGrade =
    Number(studentGradeInput.value);


  try {

    await addDoc(
      collection(database, 'users'),
      {

        studentID: studentID,

        firstName: studentFirstName,

        lastName: studentLastName,

        grade: studentGrade,

        hours: 0,

        points: 0,

        feePaid: false

      }
    );


    addStudentForm.reset();
    closeModal();
  } catch (error) {
    console.error(
      'Error adding student:',
      error.message
    );
  }
});


// ============================================================
// ADD STUDENT MODAL
// ============================================================

const closeModal = () => {
  addStudentModal.classList.remove('active');
  studentIDInput.value = '';
  studentFirstNameInput.value = '';
  studentLastNameInput.value = '';
  studentGradeInput.value = '';

};


cancelStudentAddButton.addEventListener(
  'click',
  closeModal
);


addStudentButton.addEventListener(
  'click',
  () => {
    addStudentModal.classList.add('active');
  }
);


closeStudentModal.addEventListener(
  'click',
  closeModal
);


// ============================================================
// SEARCH STUDENTS
// ============================================================

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


// ============================================================
// MULTIPLE STUDENT REMOVE MODE
// ============================================================

removeMultipleStudentsButton.addEventListener(
  'click',
  () => {
    removeMode = !removeMode;
    const checkboxes =
      document.querySelectorAll(
        '.remove-checkboxes'
      );


    if (removeMode) {

      removeMultipleStudentsButton.innerText =
        'Remove Mode Active, Click to exit.';

      confirmRemovalBtn.classList.add('active');

      checkboxes.forEach((checkbox) => {

        checkbox.classList.add('active');

      });


    } else {

      removeMultipleStudentsButton.innerText =
        'Remove Students [Multiple]';

      confirmRemovalBtn.classList.remove('active');


      checkboxes.forEach((checkbox) => {

        checkbox.classList.remove('active');

        checkbox.checked = false;

      });


      studentRemovalArray = [];

    }
  }
);


// ============================================================
// SELECT STUDENTS FOR MULTIPLE REMOVAL
// ============================================================

studentList.addEventListener(
  'change',
  (event) => {
    if (
      !event.target.classList.contains(
        'remove-checkboxes'
      )
    ) {
      return;
    }


    const checkbox = event.target;
    const studentId = checkbox.dataset.id;


    if (checkbox.checked) {
      if (
        !studentRemovalArray.includes(studentId)
      ) {
        studentRemovalArray.push(studentId);
      }
    } else {

      studentRemovalArray =
        studentRemovalArray.filter(
          (id) => id !== studentId
        );

    }
    console.log(
      'Students selected for removal:',
      studentRemovalArray
    );

  }
);


// ============================================================
// CONFIRM MULTIPLE STUDENT REMOVAL
// ============================================================

confirmRemovalBtn.addEventListener(
  'click',
  async () => {
    if (studentRemovalArray.length === 0) {
      console.log(
        'No students selected for removal.'
      );
      return;
    }


    try {
      const deletePromises =
        studentRemovalArray.map(
          (studentId) => {

            return deleteDoc(
              doc(
                database,
                'users',
                studentId
              )
            );
          }
        );


      await Promise.all(deletePromises);


      console.log(
        `Deleted ${studentRemovalArray.length} students.`
      );
      studentRemovalArray = [];
      removeMode = false;

      removeMultipleStudentsButton.innerText =
        'Remove Students [Multiple]';

      confirmRemovalBtn.classList.remove('active');


    } catch (error) {

      console.error(
        'Error removing students:',
        error
      );
    }
  }
);


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

// ============================================================
// UPDATE PAYMENT STATUS
// ============================================================

studentList.addEventListener('change', async (event) => {
  // 1. Target the checkbox by class instead of an ID
  if (!event.target.classList.contains('payment-checkbox')) {
    return;
  }

  const checkbox = event.target;
  const studentID = checkbox.dataset.id;
  

  if (!studentID) {
    console.error("Student ID missing from checkbox data attributes.");
    return;
  }

  const studentDocRef = doc(database, "users", studentID);
  

  const isPaid = checkbox.checked; 

  try {
    await updateDoc(studentDocRef, {
      feePaid: isPaid
    });
    console.log(`Database updated successfully! Paid status set to: ${isPaid}`);
  
  } catch (error) {
    console.error(`Error updating student payment status:`, error);
    checkbox.checked = !isPaid; 
  }
});
