import { database } from './firebaseconfig';
import { getDocs, doc, collection, addDoc, snapshotEqual} from 'firebase/firestore';

const addStudentButton = document.getElementById('add-student-button');


const renderStudentList = async() =>{
    let html ='';
    
    const snapshot = await getDocs(collection(database, "users"));
    const studentList = document.getElementById('student-info-container');
    snapshot.forEach((doc)=>{
        const student = doc.data();
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

        <div class="student-stat">
            Hours: ${student.hours}
        
        </div>

        <div class="student-stat">
            Points:${student.points}
        </div>

    </div>

</div>

        `;
        
    })
    console.log("studentList:", studentList);
    studentList.innerHTML = html;
} 

document.addEventListener('DOMContentLoaded', renderStudentList);
const addStudentForm =  document.getElementById('add-student-form');

addStudentForm.addEventListener('submit', async(event)=>{
    event.preventDefault();
    const studentID = document.getElementById('student-id').value.trim();
    const studentFirstName = document.getElementById('first-name').value.trim();
    const studentLastName = document.getElementById('last-name').value.trim();
    const studentGrade = Number(document.getElementById('grade').value);

    try{ const newStudent = await addDoc(
        collection(database, "users"), {
            studentID: studentID,
            firstName: studentFirstName,
            lastName: studentLastName,
            grade: studentGrade,

            hours: 0,
            points: 0,
            feePaid: false,
        }
    )   

    addStudentForm.reset();
    closeModal();
    renderStudentList();
    }catch(error){
        console.log(error.message);
    }
})

const addStudentModal = document.getElementById('add-student-modal');
const closeStudentModal = document.getElementById('modal-close-btn');
const submitStudentAddButton = document.getElementById('modal-submit-btn');
const cancelStudentAddButton = document.getElementById('modal-cancel-btn');

const studentID = document.getElementById('student-id');
const studentFirstName = document.getElementById('first-name');
const studentLastName = document.getElementById('last-name');
const studentGrade = document.getElementById('grade');


const closeModal = ()=>{
    addStudentModal.classList.remove('active');
    studentID.value = '';
    studentFirstName.value ='';
    studentLastName.value = '';
    studentGrade.value = '';
}

cancelStudentAddButton.addEventListener('click',()=>{
    closeModal();
})

addStudentButton.addEventListener('click',()=>{
    addStudentModal.classList.add('active');
})

closeStudentModal.addEventListener('click',()=>{
    closeModal();
})

