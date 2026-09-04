roomCode = sessionStorage.getItem("roomCode") || ""
userID = sessionStorage.getItem("userID") || ""

let socket

function ConnectWebSocket() {
    socket = new WebSocket(`ws://127.0.0.1:8000/ws/${roomCode}`)
    socket.onopen = () => {console.log("WebSocket connected:", roomCode)}

    socket.onmessage = (event) => {
        message = JSON.parse(event.data)
        if (message.type == "room_update") {
            console.log("Room updated:", message.data)
            UpdateVotingPage(message.data)
        }
    }

    socket.onclose = () => { console.log("WebSocket disconnected") }
    socket.onerror = (error) => { console.error("WebSocket error:", error) }
}

function UpdateVotingPage(room) {
    document.getElementById("questionText").textContent = "Question : " + room.poll.question
    ShowOptions(room.poll.options)
    document.getElementById("totalUsers").textContent = "Total Participants - " + room.users.length
}

function ShowOptions(options) {
    optionsList.innerHTML = ""

    for (const option of options) {
        optionDiv = document.createElement("div")
        optionDiv.className = "optionSetDiv"

        label = document.createElement("label")
        label.className = "labelOptionBig"

        radio = document.createElement("input")

        radio.type = "radio"
        radio.id = option.id
        radio.name = "votes"
        radio.className = "radioButtonClassOption"
        radio.value = option.value

        span = document.createElement("span")
        span.className = "optionSpan"
        span.textContent = option.value

        label.appendChild(radio)
        label.appendChild(span)

        optionDiv.appendChild(label)

        optionsList.appendChild(optionDiv)
        optionsList.appendChild(document.createElement("br"))
    }
}

async function InitPoll() {
    optionsList = document.getElementById("optionsList")
    roomCodeDiv = document.getElementsByClassName("roomCodeDiv")[0]
    questionTextH2 = document.getElementById("questionText")

    document.getElementById("roomCodeID").textContent = "Room Code - " + roomCode
    roomCodeDiv.setAttribute("id", roomCode)
    const response = await fetch(`http://127.0.0.1:8000/api/${roomCode}/getInfo`)

    const room = await response.json()
    UpdateVotingPage(room)
    ConnectWebSocket()
}

async function SubmitPollOption() {
    optionID = document.querySelector('input[name="votes"]:checked').id
    submitButton = document.getElementById("SubmitOption")
    console.log(optionID)
    console.log(userID)
    console.log(roomCode)

    const pollOptionFetch = await fetch(`http://127.0.0.1:8000/api/${roomCode}/vote/${encodeURIComponent(optionID)}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            userID: userID
        })
    })
    const pollResponse = await pollOptionFetch.json()

    for (const element of document.querySelectorAll('input[name="votes"]')) {
        element.disabled = true
    }

    if (pollResponse.message == "Vote Added") {
        window.alert("VOTE ADDED")
        submitButton.remove()
    } else {
        window.alert(pollResponse.error)
    }
}

InitPoll()