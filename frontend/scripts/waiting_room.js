roomCode = sessionStorage.getItem("roomCode") || ""
userID = sessionStorage.getItem("userID") || ""
let socket

function ConnectWebSocket() {
    socket = new WebSocket(`ws://127.0.0.1:8000/ws/${roomCode}`)
    socket.onopen = () => { console.log("Connected to room:", roomCode) }

    socket.onmessage = (event) => {
        message = JSON.parse(event.data)
        if (message.type !== "room_update") { return }
        room = message.data
        document.getElementById("totalUsers").textContent = "Total Participants - " + room.users.length

        if (room.poll.started && !room.poll.ended) {
            sessionStorage.setItem("roomCode", roomCode)
            sessionStorage.setItem("userID", userID)
            window.location.replace("http://127.0.0.1:5500/frontend/voting.html")
        }
    }
    socket.onclose = () => { console.log("WebSocket disconnected") }
}

async function InitWaitingRoom() {
    roomCodeDiv = document.getElementsByClassName("roomCodeDiv")[0];
    document.getElementById("roomCodeID").textContent = "Room Code - " + roomCode;
    roomCodeDiv.setAttribute("id", roomCode);
    ConnectWebSocket();
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

InitWaitingRoom()