let add_btn = document.querySelector(".add-btn");
let remove_btn = document.querySelector(".remove-btn");
let modalCont = document.querySelector(".modal-cont");
let mainCont = document.querySelector(".main-cont");
let textareaCont = document.querySelector(".textarea-cont");
let allPriorityColors = document.querySelectorAll(".priority-color");
let toolBoxColors = document.querySelectorAll(".color");

let colors = ["blue", "red", "green", "yellow", "black"];
let modalPriorityColor = colors[colors.length - 1];

let addFlag = false;
let removeFlag = false;

let lockClass = "fa-lock";
let unlockClass = "fa-lock-open";

let ticketsArr = [];

if (localStorage.getItem("jira_ticket")) {
    //retrieve and display tickets
    ticketsArr = JSON.parse(localStorage.getItem("jira_tickets"));
    ticketsArr.forEach((ticketObj) => {
        createTicket(ticketObj.ticketcolor, ticketObj.ticketTask, ticketObj.ticketID);
    })
}


for (let  i = 0; i < toolBoxColors.length; i++) {
    toolBoxColors[i].addEventListener("click", (e) => {
        let currentToolBoxColor = toolBoxColors[i].classList[0];

        let filteredTickets = ticketsArr.filter((ticketObj, idx) => {
            return currentToolBoxColor === ticketObj.ticketcolor;
        })

        //remove previous tickets from all ticket cont
        let allTicketCont = document.querySelectorAll(".ticket-cont");
        for (let i = 0; i<allTicketCont.length; i++){
            allTicketCont[i].remove();
        }

        //Display new filtered tickets
        filteredTickets.forEach((ticketObj, idx) => {
            createTicket(ticketObj.ticketcolor, ticketObj.ticketTask, ticketObj.ticketID);  
        })
    })

    toolBoxColors[i].addEventListener("dblclick", (e) => {
        let allTicketCont = document.querySelectorAll(".ticket-cont");
        for (let i = 0; i < allTicketCont.length; i++){
            allTicketCont[i].remove();
        }

        ticketsArr.forEach((ticketObj, idx)=> {
            createTicket(ticketObj.ticketcolor, ticketObj.ticketTask, ticketObj.ticketID);
        })
    })
}

//Listener for modal priority coloring
allPriorityColors.forEach((colorElem, idx) => {
    colorElem.addEventListener("click", (e) => {
        allPriorityColors.forEach((priorityColorElem, idx) => {
            priorityColorElem.classList.remove("border");
        })
        colorElem.classList.add("border");
    
        modalPriorityColor = colorElem.classList[0];
    })
    
})

add_btn.addEventListener("click", (e) => {
    //Display modal
    //Generate ticket
    
    //Add Flag, true -> modal display
    //Add Flag, false -> modal none

    addFlag = !addFlag;
    if (addFlag) {
        modalCont.style.display = "flex";
    }
    else {
        modalCont.style.display = "none";
    }

})

remove_btn.addEventListener("click", (e) => {
    removeFlag = !removeFlag;
})

modalCont.addEventListener("keydown", (e) => {
    let key = e.key;
    if (key === "Enter") {
        createTicket(modalPriorityColor, textareaCont.value);
        setModalToDefault();
        addFlag = false;
    }
})

//function to create ticket 
function createTicket(ticketcolor, ticketTask, ticketID) {
    let id = ticketID || shortid();
    let ticketCont = document.createElement("div");
    ticketCont.setAttribute("class", "ticket-cont");
    ticketCont.innerHTML = `
        <div class="ticket-color ${ticketcolor}"></div>
        <div class="ticket-id">#${id}</div>
        <div class="task-area">${ticketTask}</div>
        <div class="ticket-lock">
            <i class="fa-solid fa-lock"></i>
        </div>
    `;
    mainCont.appendChild(ticketCont);

    //create object of ticket and add to array
    if (!ticketID) {
        ticketsArr.push({ ticketcolor, ticketTask, ticketID: id });
        localStorage.setItem("jira_tickets", JSON.stringify(ticketsArr));
    }
   
    handleRemoval(ticketCont,id);
    handleLock(ticketCont,id);
    handleColor(ticketCont,id);
}

//function to handle the removal of tickets from data as well as site
function handleRemoval(ticket,id) {
    ticket.addEventListener("click", (e) => {
        if (!removeFlag) return;

        let idx = getTicketIdx(id);

        //DB removal
        ticketsArr.splice(idx, 1);
        let strTicketsArr = JSON.stringify(ticketsArr);
        localStorage.setItem("jira_tickets", strTicketsArr);

        ticket.remove();// UI removal
    })
    
    
}

//This function is used for the purpose of editing on a ticket or not (by using lock on a ticket )
function handleLock(ticket,id) {
    let ticketLockElem = ticket.querySelector(".ticket-lock");
    let ticketLock = ticketLockElem.children[0];
    let ticketTaskArea = ticket.querySelector(".task-area");
    ticketLock.addEventListener("click", (e) => {
        let ticketIdx = getTicketIdx(id);

        if (ticketLock.classList.contains(lockClass)) {
            ticketLock.classList.remove(lockClass);
            ticketLock.classList.add(unlockClass);
            ticketTaskArea.setAttribute("contenteditable", "true");
        } else {
            ticketLock.classList.remove(unlockClass);
            ticketLock.classList.add(lockClass);
            ticketTaskArea.setAttribute("contenteditable", "false");
        }

        //Modify data in localStorage (Ticket Task)
        ticketsArr[ticketIdx].ticketTask = ticketTaskArea.innerText;
        localStorage.setItem("jira_tickets", JSON.stringify(ticketsArr));
    })
}

//function handle the color of ticket 
function handleColor(ticket,id) {
    let ticketColor = ticket.querySelector(".ticket-color");
    ticketColor.addEventListener("click", (e) => {
        //Get ticketId from the tickets array
        let ticketIdx = getTicketIdx(id);

        let currentTicketColor = ticketColor.classList[1];
        let currentTicketColorIdx = colors.findIndex((color) => {
            return currentTicketColor === color;
        })
        currentTicketColorIdx++;

        let newTicketColorIdx = currentTicketColorIdx % colors.length;
        let newTicketColor = colors[newTicketColorIdx];
        ticketColor.classList.remove(currentTicketColor);
        ticketColor.classList.add(newTicketColor);

        //Modify data in local storage (priority color change)
        ticketsArr[ticketIdx].ticketcolor = newTicketColor;
        localStorage.setItem("jira_tickets", JSON.stringify(ticketsArr));
    })
}

function getTicketIdx(id) {
    let ticketIdx = ticketsArr.findIndex((ticketObj) => {
        return ticketObj.ticketID === id;
    })
        return ticketIdx;
}

function setModalToDefault() {
    modalCont.style.display = "none"; 
    textareaCont.value = "";
    modalPriorityColor = colors[colors.length - 1];
    allPriorityColors.forEach((priorityColorElem, idx) => {
        priorityColorElem.classList.remove("border");
    })
    allPriorityColors[allPriorityColors.length - 1].classList.add("border");

}