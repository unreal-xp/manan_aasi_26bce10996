roomCode = sessionStorage.getItem("roomCode") || "";

async function InitPoll() {
    optionsList = document.getElementById("optionsList")
    roomCodeDiv = document.getElementsByClassName("roomCodeDiv")[0]
    questionTextH2 = document.getElementById("questionText");

    roomCodeIDElement = document.getElementById("roomCodeID").textContent = "Room Code - " + roomCode;
    roomCodeDiv.setAttribute("id", roomCode)

    const roomCodeResponse = await fetch(`http://127.0.0.1:8000/api/${roomCode}/getInfo`, {
        method: "GET",
    })
    const roomCodeIntermediate = await roomCodeResponse.json();
    questionTextH2.textContent = roomCodeIntermediate.poll.question;
    console.log(roomCodeIntermediate)

    for (const option of roomCodeIntermediate.poll.options) {
        optionDiv = document.createElement("div");
        optionDiv.setAttribute("id", option.id);

        newOptionH3 = document.createElement("h3");
        newOptionH3.textContent = option.value;

        newOptionDeleteButton = document.createElement("button");
        newOptionDeleteButton.textContent = "Delete"

        optionDiv.appendChild(newOptionH3);
        optionDiv.appendChild(newOptionDeleteButton);
        optionDiv.appendChild(document.createElement("br"));

        optionsList.appendChild(optionDiv)
    }
    GetTotalUsers()
}

async function GetTotalUsers() {
    const response = await fetch(`http://127.0.0.1:8000/api/${roomCode}/get/users`, {
        method: "GET",
    })
    const roomData = await response.json()
    document.getElementById("totalUsers").textContent = "Total Participants - " + roomData.totalUsers;
}

InitPoll();