roomCode = sessionStorage.getItem("roomCode") || "";
userID = sessionStorage.getItem("userID") || "";

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
    questionTextH2.textContent = "Question : " + roomCodeIntermediate.poll.question;

    for (const option of roomCodeIntermediate.poll.options) {
        newOptionH3 = document.createElement("h3");
        newOptionH3.textContent = `${option.value} -> ${option.votes} Votes`;
        optionsList.appendChild(newOptionH3);
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

InitPoll()