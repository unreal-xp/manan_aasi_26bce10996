roomCode = sessionStorage.getItem("roomCode") || ""
userID = sessionStorage.getItem("userID") || ""

function UpdateAdminPoll(room) {
    document.getElementById("questionText").textContent = "Question : " + room.poll.question
    document.getElementById("totalUsers").textContent = "Total Participants - " + room.users.length
    ShowAdminOptions(room.poll.options)
}

function ShowAdminOptions(options) {
    optionsList.innerHTML = ""

    for (const option of options) {
        optionDiv = document.createElement("div")
        optionDiv.id = option.id
        optionDiv.className = "singularOption"

        newOptionH3 = document.createElement("label")
        newOptionH3.className = "labelOption"
        newOptionH3.textContent = option.value

        newOptionDeleteButton = document.createElement("button")
        newOptionDeleteButton.className = "buttonSmaller"
        newOptionDeleteButton.textContent = "Delete"

        newOptionDeleteButton.onclick = async () => {
            await DeleteOption(option.id)
        }

        optionDiv.appendChild(newOptionH3)
        optionDiv.appendChild(newOptionDeleteButton)
        optionDiv.appendChild(document.createElement("br"))
        optionsList.appendChild(optionDiv)
    }
}

async function InitPoll() {
    optionsList = document.getElementById("optionsList");
    roomCodeDiv = document.getElementsByClassName("roomCodeDiv")[0];

    roomCodeDiv.setAttribute("id", roomCode);
    document.getElementById("roomCodeID").textContent = "Room Code - " + roomCode;

    response = await fetch(`http://127.0.0.1:8000/api/${roomCode}/getInfo`);
    room = await response.json();

    UpdateAdminPoll(room);
    ConnectWebSocket(roomCode, UpdateAdminPoll);
}

async function DeleteOption(uid) {
    delOption = document.getElementById(uid)
    const pollOptionFetch = await fetch(`http://127.0.0.1:8000/api/${roomCode}/poll/removeoption`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            uid: uid
        })
    })
    const pollResponse = await pollOptionFetch.json()

    if (pollResponse.message == "Option Removed") {
        delOption.remove()
    } else {
        window.alert(pollResponse.error)
    }
}

InitPoll()