roomCode = sessionStorage.getItem("roomCode") || "";
userID = sessionStorage.getItem("userID") || "";

async function InitPoll() {
    optionsList = document.getElementById("optionsList")
    roomCodeDiv = document.getElementsByClassName("roomCodeDiv")[0]
    questionTextH2 = document.getElementById("questionText");

    roomCodeIDElement = document.getElementById("roomCodeID").textContent = "Room Code - " + roomCode;
    roomCodeDiv.setAttribute("id", roomCode)

    const roomCodeResponse = await fetch(`http://127.0.0.1:8000/api/${roomCode}/getInfo`, {
        method: "GET",
    })
    const roomCodeIntermediate = await roomCodeResponse.json();
    questionTextH2.textContent = "Question : " + roomCodeIntermediate.poll.question;

    for (const option of roomCodeIntermediate.poll.options) {

        optionDiv = document.createElement('div')
        optionDiv.setAttribute('class', 'optionSetDiv')
        label = document.createElement('label');
        label.setAttribute('class', 'labelOptionBig')

        newOptionH3 = document.createElement("input");
        newOptionH3.setAttribute("type", "radio");
        newOptionH3.setAttribute("id", option.id);
        newOptionH3.setAttribute("name", "votes");
        newOptionH3.setAttribute("class", "radioButtonClassOption")
        newOptionH3.value = option.value;

        span = document.createElement("span")
        span.setAttribute('class', "optionSpan")
        span.innerHTML = option.value;

        label.appendChild(newOptionH3);
        label.append(span)
        optionDiv.append(label)
        optionsList.appendChild(optionDiv);
        optionsList.appendChild(document.createElement("br"));
    }
    GetTotalUsers()
}

async function GetTotalUsers() {
    const response = await fetch(`http://127.0.0.1:8000/api/${roomCode}/get/users`, {
        method: "GET",
    })
    const roomData = await response.json()
    document.getElementById("totalUsers").textContent = "Total Participants - " + roomData.totalUsers;
}

async function SubmitPollOption() {

    optionID = document.querySelector('input[name="votes"]:checked').id;
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
    const pollResponse = await pollOptionFetch.json();

    for (const element of document.querySelectorAll('input[name="votes"]')) {
        element.disabled = true
    }

    if (pollResponse.message = "Vote Added") {
        window.alert("VOTE ADDED")
        submitButton.remove()
    } else {
        window.alert(pollResponse.error)
    }
}

InitPoll();