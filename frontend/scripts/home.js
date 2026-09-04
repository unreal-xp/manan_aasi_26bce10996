async function JoinRoom() {

    roomName = document.getElementById("roomName");
    userName = document.getElementById("userName");

    if (roomName.value == "" || userName.value == "") {
        window.alert("Fields cannot be empty!")
        return
    }

    const response = await fetch(`http://127.0.0.1:8000/api/${roomName.value}/join`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            userName: userName.value
        })
    })
    const roomData = await response.json()

    if (roomData.code == 0) {
        sessionStorage.setItem("roomCode", roomData.roomCode);
        sessionStorage.setItem("userID", roomData.user.id);
        window.location.replace("http://127.0.0.1:5500/frontend/waiting_room.html");
    } else {
        window.alert("Room Does Not Exist!")
    }
}