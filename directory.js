import { database } from './firebaseconfig'; 
import { collection, addDoc, onSnapshot, getDoc, doc, deleteDoc, getDocs } from 'firebase/firestore'; 
const addStudentButton = document.getElementById('add-student-button');
const studentList = document.getElementById('student-info-container'); // Moved out for clean access
const removeStudentModal = document.getElementById('remove-student-modal');

const renderStudentList = () => {
  if (!studentList) return;

  onSnapshot(collection(database, "users"), (snapshot) => {
    let html = ''; // 🔑 FIXED: Clears old items on every refresh to prevent duplicates

    snapshot.forEach((doc) => {
      const student = doc.data();
      const docId = doc.id; // 🔑 Get the unique Firestore document ID

      html += `
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
            <div class="student-stat">Hours: ${student.hours}</div>
            <div class="student-stat">Points: ${student.points}</div>
            
            <!-- 🔑 FIXED: Changed id to a class, and attached the Firestore ID to a data attribute -->
            <button class="remove-student" data-id="${docId}" style="background:red;">🗑️</button>
          </div>
        </div>
      `;
    });
    studentList.innerHTML = html;
  });
}

// 🔑 FIXED: Event Delegation handles dynamically created delete buttons instantly!
const setupDeleteListener = () => {
  if (!studentList) return;

  studentList.addEventListener('click', (event) => {
    // Check if the clicked element (or its closest parent) is a remove button
    const deleteButton = event.target.closest('.remove-student');
    const userId = deleteButton.dataset.id;

    if (deleteButton) {
      const studentDocId = deleteButton.getAttribute('data-id');
      console.log("Opening delete modal for document ID:", studentDocId);
      
      // Open your modal
      removeStudentModal.classList.add('active');
      
      removeStudentModal.addEventListener('click', async(event)=>{
        
        if (event.target.id === 'cancel-student-removal'){
            removeStudentModal.classList.remove('active');
        } else if (event.target.id === 'confirm-student-removal'){
            await deleteDoc(doc(database, "users", userId));
             removeStudentModal.classList.remove('active');
            renderStudentList();
           
        }

      })
      // Pro-Tip: You can attach 'studentDocId' to your modal's submit button 
      // so your app knows exactly which document to delete from Firestore!
    }
  });
};

// Initialize everything cleanly on load
document.addEventListener('DOMContentLoaded', () => {
  renderStudentList();
  setupDeleteListener();
});

const addStudentForm = document.getElementById('add-student-form');
addStudentForm.addEventListener('submit', async(event)=>{
  event.preventDefault();
  const studentID = document.getElementById('student-id').value.trim();
  const studentFirstName = document.getElementById('first-name').value.trim();
  const studentLastName = document.getElementById('last-name').value.trim();
  const studentGrade = Number(document.getElementById('grade').value);

  try {
    await addDoc(collection(database, "users"), {
      studentID: studentID,
      firstName: studentFirstName,
      lastName: studentLastName,
      grade: studentGrade,
      hours: 0,
      points: 0,
      feePaid: false,
    });
    addStudentForm.reset();
    closeModal();
  } catch(error) {
    console.log(error.message);
  }
});

// --- Modal Management Elements ---
const addStudentModal = document.getElementById('add-student-modal');
const closeStudentModal = document.getElementById('modal-close-btn');
const cancelStudentAddButton = document.getElementById('modal-cancel-btn');

const studentID = document.getElementById('student-id');
const studentFirstName = document.getElementById('first-name');
const studentLastName = document.getElementById('last-name');
const studentGrade = document.getElementById('grade');

const closeModal = () => {
  addStudentModal.classList.remove('active');
  studentID.value = '';
  studentFirstName.value = '';
  studentLastName.value = '';
  studentGrade.value = '';
}

cancelStudentAddButton.addEventListener('click', () => { closeModal(); });
addStudentButton.addEventListener('click', () => { addStudentModal.classList.add('active'); });
closeStudentModal.addEventListener('click', () => { closeModal(); });




// search students function

const searchbar = document.getElementById('search-bar');

searchbar.addEventListener('input', async(event)=>{
  const key = event.target.value;

  const querySnapshot = await getDocs(
    collection(database, "users")
  );

  const renderArray = querySnapshot.docs.map(doc=>({id: doc.id, ...doc.data()}));

  const liveRenderArray = renderArray.reduce((acc, user)=>{
    const cleanKey = key.replace(/\s+/g, '');
    const userFirstName = user.firstName.toLowerCase();
    const userLastName = user.lastName.toLowerCase();
    const userFirstAndLastName = `${userFirstName}${userLastName}`
    if ((userFirstName.includes(cleanKey)) || (userLastName.includes(cleanKey)) || (user.studentID.includes(Number(cleanKey))) || (userFirstAndLastName.includes(cleanKey))){
      acc.push(user);
    }

    return acc;
  }, []) 

  let html =''
  liveRenderArray.forEach((student)=>{
    const docId = student.id; // 🔑 Get the unique Firestore document ID
    

      html += `
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
            <div class="student-stat">Hours: ${student.hours}</div>
            <div class="student-stat">Points: ${student.points}</div>
            
            <!-- 🔑 FIXED: Changed id to a class, and attached the Firestore ID to a data attribute -->
            <button class="remove-student" data-id="${docId}" style="background:red;">🗑️</button>
          </div>
        </div>
      `;
  })
  studentList.innerHTML = html;
})
