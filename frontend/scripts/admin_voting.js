roomCode = sessionStorage.getItem("roomCode") || ""
userID = sessionStorage.getItem("userID") || ""

let socket

function ConnectWebSocket() {
    socket = new WebSocket(`ws://127.0.0.1:8000/ws/${roomCode}`)

    socket.onopen = () => {
        console.log("WebSocket connected")
        clearTimeout(reconnectTimer)
    }

    socket.onmessage = (event) => {
        message = JSON.parse(event.data)
        if (message.type === "room_update") { UpdatePage(message.data) }

        else if (message.type === "room_closed") {
            window.alert("The room has been closed.")
            window.location.replace("http://127.0.0.1:5500/frontend/home.html")
        }
    }

    socket.onclose = () => {
        console.log("WebSocket disconnected")
        reconnectTimer = setTimeout(() => { ConnectWebSocket() }, 2000)
    }

    socket.onerror = (error) => {
        console.error("WebSocket error:", error)
        socket.close()
    }
}

function UpdatePage(room) {
    questionTextH2.textContent = "Question : " + room.poll.question
    ShowVotes(room.poll.options)
    document.getElementById("totalUsers").textContent = "Total Participants - " + room.users.length
}

function InitPoll() {
    optionsList = document.getElementById("optionsList");
    roomCodeDiv = document.getElementsByClassName("roomCodeDiv")[0];
    questionTextH2 = document.getElementById("questionText");
    document.getElementById("roomCodeID").textContent = "Room Code - " + roomCode;
    roomCodeDiv.setAttribute("id", roomCode);
    ConnectWebSocket();
}

function ShowVotes(options) {
    optionsList.innerHTML = ""
    const maxVotes = Math.max(1, ...options.map(option => option.votes))

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

InitPoll()