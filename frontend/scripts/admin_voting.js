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

    ShowVotes(roomCodeIntermediate.poll.options)

    GetTotalUsers()
}

function ShowVotes(options) {
    optionsList.innerHTML = ""

    maxVotes = Math.max(1, ...options.map(o => o.votes))

    for (const option of options) {
        row = document.createElement("div")
        row.className = "voteRow"

        bar = document.createElement("div")
        bar.className = "voteBar"
        percent = (option.votes / maxVotes) * 100
        bar.style.width = percent + "%"

        label = document.createElement("span")
        label.className = "voteLabel"
        label.textContent = `${option.value} -> ${option.votes} Votes`

        row.appendChild(bar)
        row.appendChild(label)
        optionsList.appendChild(row)
    }
}

async function GetTotalUsers() {
    const response = await fetch(`http://127.0.0.1:8000/api/${roomCode}/get/users`, {
        method: "GET",
    })
    const roomData = await response.json()
    document.getElementById("totalUsers").textContent = "Total Participants - " + roomData.totalUsers;
}

InitPoll()