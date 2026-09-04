roomCode = sessionStorage.getItem("roomCode") || ""
userID = sessionStorage.getItem("userID") || ""

function UpdatePage(room) {
    document.getElementById("totalUsers").textContent = "Total Participants - " + room.users.length
    if (room.poll.started && !room.poll.ended) { window.location.replace("http://127.0.0.1:5500/frontend/voting.html") }
}

async function InitWaitingRoom() {
    roomCodeDiv = document.getElementsByClassName("roomCodeDiv")[0]
    document.getElementById("roomCodeID").textContent = "Room Code - " + roomCode
    roomCodeDiv.setAttribute("id", roomCode)
    ConnectWebSocket(roomCode, UpdatePage)
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