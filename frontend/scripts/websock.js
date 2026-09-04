let socket
let reconnectTimer

function ConnectWebSocket(roomCode, onRoomUpdate) {
    socket = new WebSocket(`ws://127.0.0.1:8000/ws/${roomCode}`)
    socket.onopen = () => {
        console.log("WebSocket connected")
        clearTimeout(reconnectTimer)
    }

    socket.onmessage = (event) => {
        message = JSON.parse(event.data)
        if (message.type === "room_update") {
            onRoomUpdate(message.data)
        } else if (message.type === "room_closed") {
            window.alert("The room has been closed.")
            window.location.replace("http://127.0.0.1:5500/frontend/home.html")
        }
    }

    socket.onclose = () => {
        console.log("WebSocket disconnected")
        reconnectTimer = setTimeout(() => { ConnectWebSocket(roomCode, onRoomUpdate) }, 2000)
    }

    socket.onerror = (error) => {
        console.error("WebSocket error:", error)
        socket.close()
    }
}