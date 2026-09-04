roomCode = ""

async function CreatePoll() {
    const username = document.getElementById("userName").value;
    if (username == "") {
        window.alert("Username Cannot Be Empty")
        return
    }

    const roomCodeResponse = await fetch(`http://127.0.0.1:8000/api/room/create`, {
        method: "GET",
    })
    const roomCodeIntermediate = await roomCodeResponse.json();
    roomCode = roomCodeIntermediate.roomCode;

    if (roomCode != "") {
        const roomCreateResponse = await fetch(`http://127.0.0.1:8000/api/${roomCode}/create`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                userName: username
            })
        })
        const roomCreateData = await roomCreateResponse.json();

        if (roomCreateData.message == "Created Room Successfully") {
            sessionStorage.setItem("roomCode", roomCode);
            window.location.replace("http://127.0.0.1:5500/frontend/create_poll.html");
        }
    }
}

async function SetPollQuestion() {

    if (roomCode == "") {
        roomCode = document.getElementsByClassName("roomCodeDiv")[0].id
    }

    questionInput = document.getElementById("questionInput").value;

    if (questionInput == "") {
        return "";
    }

    questionTextH2 = document.getElementById("questionText");

    const pollQuestionFetch = await fetch(`http://127.0.0.1:8000/api/${roomCode}/poll/question`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            question: questionInput
        })
    })
    const pollResponse = await pollQuestionFetch.json();

    if (pollResponse.message == "Created Question Successfully") {
        questionTextH2.textContent = "Question : " + questionInput;
        questionInput = document.getElementById("questionInput").value = "";
    }
}

async function CreateOption() {
    if (roomCode == "") {
        roomCode = document.getElementsByClassName("roomCodeDiv")[0].id
    }

    optionInput = document.getElementById("optionValueInput").value;
    optionChecked = document.getElementById("optionCorrectCheckbox").checked == true;
    optionsList = document.getElementById("optionsList")

    if (optionInput == "") {
        return "";
    }

    const pollOptionFetch = await fetch(`http://127.0.0.1:8000/api/${roomCode}/poll/addoption`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            value: optionInput,
            correct: optionChecked
        })
    })
    const pollResponse = await pollOptionFetch.json();

    if (pollResponse.message == "Option Added") {
        optionDiv = document.createElement("div");
        optionDiv.setAttribute("id", pollResponse.optionID);
        optionDiv.setAttribute("class", 'singularOption');

        newOptionH3 = document.createElement("label");
        newOptionH3.setAttribute('class', "labelOption")
        newOptionH3.textContent = optionInput;

        newOptionDeleteButton = document.createElement("button");
        newOptionDeleteButton.setAttribute("id", pollResponse.id + "-Button")
        newOptionDeleteButton.setAttribute("class", "buttonSmaller")
        newOptionDeleteButton.textContent = "Delete"
        newOptionDeleteButton.onclick = async () => {
            DeleteOption(pollResponse.optionID)
        };

        optionDiv.appendChild(newOptionH3);
        optionDiv.appendChild(newOptionDeleteButton);
        optionDiv.appendChild(document.createElement("br"));

        optionsList.appendChild(optionDiv)

        document.getElementById("optionCorrectCheckbox").checked = false
        document.getElementById("optionValueInput").value = ""
    } else if (pollResponse.message == "Option Cant Be Added, >6") {
        window.alert("Cannot add more than 6 options!")
    } else if (pollResponse.message == "Option Cant Be Added, Already Correct Options Chosen") {
        window.alert("Cannot add more than one correct option!")
    }
}

async function DeleteOption(uid) {
    delOption = document.getElementById(uid)
    const pollOptionFetch = await fetch(`http://127.0.0.1:8000/api/${roomCode}/poll/removeoption`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            uid: uid
        })
    })
    const pollResponse = await pollOptionFetch.json();

    if (pollResponse.message == "Option Removed") {
        delOption.remove()
    } else {
        window.alert(pollResponse.error)
    }
}

async function StartPoll() {
    if (roomCode == "") {
        roomCode = document.getElementsByClassName("roomCodeDiv")[0].id
    }

    const response = await fetch(`http://127.0.0.1:8000/api/${roomCode}/start`, {
        method: "POST",
    })
    const roomData = await response.json()
    if (roomData.message == "Poll Started") {
        sessionStorage.setItem("roomCode", roomCode);
        window.location.replace("http://127.0.0.1:5500/frontend/admin_voting.html");
    }
}

async function EndPoll() {
    if (roomCode == "") {
        roomCode = document.getElementsByClassName("roomCodeDiv")[0].id
    }

    const response = await fetch(`http://127.0.0.1:8000/api/${roomCode}/end`, {
        method: "POST",
    })
    const roomData = await response.json()
    if (roomData.message == "Poll Ended") {
        window.alert("Poll Ended!")
        document.getElementById("winningAnswer").textContent = "Winning Option Is -> "
    }
}

async function ReleasePoll() {
    if (roomCode == "") {
        roomCode = document.getElementsByClassName("roomCodeDiv")[0].id
    }
}