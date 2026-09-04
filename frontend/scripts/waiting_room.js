roomCode = sessionStorage.getItem("roomCode") || "";
userID = sessionStorage.getItem("userID") || "";

async function GetTotalUsers() {
    const response = await fetch(`http://127.0.0.1:8000/api/${roomCode}/get/users`, {
        method: "GET",
    })
    const roomData = await response.json()
    document.getElementById("totalUsers").textContent = "Total Participants - " + roomData.totalUsers;
}

async function InitWaitingRoom() {
    roomCodeDiv = document.getElementsByClassName("roomCodeDiv")[0]

    document.getElementById("roomCodeID").textContent = "Room Code - " + roomCode;
    roomCodeDiv.setAttribute("id", roomCode)
    await GetTotalUsers()
}

async function MoveToPolling() {
    const roomCodeResponse = await fetch(`http://127.0.0.1:8000/api/${roomCode}/getInfo`, {
        method: "GET",
    })
    const roomCodeIntermediate = await roomCodeResponse.json();

    if (roomCodeIntermediate.poll.started && !roomCodeIntermediate.poll.ended) {
        sessionStorage.setItem("roomCode", roomCode);
        sessionStorage.setItem("userID", userID);
        window.location.replace("http://127.0.0.1:5500/frontend/voting.html");
    } else if (!roomCodeIntermediate.poll.started) {
        window.alert("Not Yet Started!")
    } else if (roomCodeIntermediate.poll.ended) {
        window.alert("Poll Ended!")
    } else {
        window.alert("Error")
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
        window.location.replace(`http://127.0.0.1:5500/frontend/home.html`);
    }
}

InitWaitingRoom()