roomCode = sessionStorage.getItem("roomCode") || ""
userID = sessionStorage.getItem("userID") || ""
userPickedOption = sessionStorage.getItem("userPickedOption") || ""

function UpdatePage(room) {
    questionTextH2.textContent = "Question : " + room.poll.question
    if (room.poll.started && room.poll.started) {
        showResults = true
    } else {
        showResults = false
    }
    ShowVotes(room.poll.options, showResults)
    document.getElementById("totalUsers").textContent = "Total Participants - " + room.users.length
}

function InitPoll() {
    optionsList = document.getElementById("optionsList");
    roomCodeDiv = document.getElementsByClassName("roomCodeDiv")[0];
    questionTextH2 = document.getElementById("questionText");
    document.getElementById("roomCodeID").textContent = "Room Code - " + roomCode;
    roomCodeDiv.setAttribute("id", roomCode);
    ConnectWebSocket(roomCode, UpdatePage);
}

function ShowVotes(options, showResults) {
    optionsList.innerHTML = ""
    const maxVotes = Math.max(1, ...options.map(option => option.votes))

    for (const option of options) {

        row = document.createElement("div")
        row.className = "voteRow"
        bar = document.createElement("div")
        bar.className = "voteBarNormal"
        if (option.id == userPickedOption) {
            bar.className = "voteBarPicked"
        }
        if (showResults) {
            if (option.isCorrect) {
                bar.className = "voteBarCorrect"
            }
        }
        percent = (option.votes / maxVotes) * 100

        bar.style.width = percent + "%"

        label = document.createElement("span")
        label.className = "voteLabel"
        if (showResults && option.id == userPickedOption && option.isCorrect) {
            label.textContent = `${option.value} -> ${option.votes} Votes (Your Answer Was Correct!)`
        } else if (userPickedOption == "" && option.isCorrect) {
            label.textContent = `${option.value} -> ${option.votes} Votes (Correct Option)`
        } else {
            label.textContent = `${option.value} -> ${option.votes} Votes`
        }

        row.appendChild(bar)
        row.appendChild(label)
        optionsList.appendChild(row)
    }
}

async function LeaveRoom() {
    console.log(roomCode)
    console.log(userID)
    const response = await fetch(`http://127.0.0.1:8000/api/${roomCode}/leave`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            userID: userID
        })
    })
    const roomData = await response.json()

    if (roomData['message'] == "User Left") {
        window.location.replace(`http://127.0.0.1:5500/frontend/home.html`)
    }
}

InitPoll()