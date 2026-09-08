import { database } from './firebaseconfig';
import { getDoc, doc, collection, addDoc} from 'firebase/firestore';

const addStudentButton = document.getElementById('add-student-button');
const studentList = document.querySelector('#student-info-container');
document.addEventListener('DOMContentLoaded', renderStudentList());

const renderStudentList = () =>{
    let html ='';
    
    const userCollection = collection(database, "users");

    userCollection.forEach((doc)=>{
        html += `
        <div class="student-info-bar">

    <div class="student-main-info">
        <div class="student-name">
            ${doc.firstName} ${doc.lastName}
        </div>

        <div class="student-basic-info">
            <span>ID: ${doc.studentID}</span>
            <span>Grade: ${doc.studentGrade}</span>
        </div>
    </div>


    <div class="student-stats">

        <div class="student-stat">
            Hours: ${doc.hours}
        </div>

        <div class="student-stat">
            Points:${doc.points}
        </div>

    </div>

</div>
        `;
    })

    studentList.innerHTML = html;
} 

const addStudentForm =  document.getElementById('add-student-form');

addStudentForm.addEventListener('submit', async(event)=>{
    event.preventDefault();
    const studentID = document.getElementById('student-id');
    const studentFirstName = document.getElementById('first-name');
    const studentLastName = document.getElementById('last-name');
    const studentGrade = document.getElementById('grade');

    try{ const newStudent = await addDoc(
        collection(database, "users"), {
            studentID: studentID,
            fistName: studentFirstName,
            lastName: studentLastName,
            grade: studentGrade,

            hours: 0,
            points: 0,
            feedPaid: false,
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

submitStudentAddButton.addEventListener('click',()=>{
    addStudent();
    closeModal();
    
})