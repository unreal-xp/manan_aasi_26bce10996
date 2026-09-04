roomCode = sessionStorage.getItem("roomCode") || ""
userID = sessionStorage.getItem("userID") || ""

function UpdatePage(room) {
    questionTextH2.textContent = "Question : " + room.poll.question
    ShowVotes(room.poll.options)
    if (room.poll.started && room.poll.ended) {
        document.getElementById("endPoll").remove()
    }
    document.getElementById("totalUsers").textContent = "Total Participants - " + room.users.length
}

function InitPoll() {
    optionsList = document.getElementById("optionsList")
    roomCodeDiv = document.getElementsByClassName("roomCodeDiv")[0]
    questionTextH2 = document.getElementById("questionText")
    document.getElementById("roomCodeID").textContent = "Room Code - " + roomCode
    roomCodeDiv.setAttribute("id", roomCode)
    ConnectWebSocket(roomCode, UpdatePage)
}

function ShowVotes(options) {
    optionsList.innerHTML = ""
    const maxVotes = Math.max(1, ...options.map(option => option.votes))

    for (const option of options) {

        row = document.createElement("div")
        row.className = "voteRow"
        bar = document.createElement("div")
        bar.className = "voteBarNormal"
        if (option.isCorrect) {
            bar.className = "voteBarCorrect"
        }
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

async function DeleteRoom() {
    const confirmed = window.confirm("Are you sure you want to delete this room?")
    if (!confirmed) { return }
    const response = await fetch(`http://127.0.0.1:8000/api/${roomCode}/delete`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            userID: userID
        })
    }
    )
    const data = await response.json()
    if (data.message === "Room Deleted") {
        sessionStorage.removeItem("roomCode")
        sessionStorage.removeItem("userID")
        window.location.replace("http://127.0.0.1:5500/frontend/home.html")
        return
    }
    window.alert(data.error || "Failed to delete room.")
}

InitPoll()