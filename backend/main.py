from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import uuid

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    admin: bool = False
    voted: bool = False
    votedOptionID: str = ""

class Option(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    value: str
    isCorrect: bool = False
    votes: int = 0

class Poll(BaseModel):
    question: str = ""
    options: list[Option] = Field(default_factory=list)
    pickedCorrect: bool = False
    started: bool = False
    ended: bool = False

class Room(BaseModel):
    code: str
    users: list[User] = Field(default_factory=list)
    poll: Poll = Field(default_factory=Poll)

# OTHER PYDANTICS

class RoomCreateJoinCodeRequest(BaseModel):
    userName: str

class UserIDRequest(BaseModel):
    userID: str

class QuestionRequest(BaseModel):
    question: str

class AddOptionRequest(BaseModel):
    value: str
    correct: bool = False

class RemoveOptionRequest(BaseModel):
    uid: str


# ROOMS AND WEBSOCKET CONNECTIONS

rooms = {
    "A1B2C3": {
        "question": "What is your favourite language?",
        "options": [
            {
                "id": 1,
                "data": "C++",
                "votes": 0
            },
            {
                "id": 2,
                "data": "C",
                "votes": 0
            },
            {
                "id": 3,
                "data": "Python",
                "votes": 0
            },
        ],
        "users": []
    }
}

connections = {}

@app.get("/")
def BaseLink():
    return {"Welcome To Live Polling App!"}


# ---
# CREATE ROOM
# ---

@app.get("/api/room/create")
def CreateRoomCode():
    roomCode = uuid.uuid1().hex.upper()[:8]
    return {"roomCode": roomCode}

@app.post("/api/{roomCode}/create")
def CreateRoom(roomCode:str, request:RoomCreateJoinCodeRequest):

    roomCode = roomCode.upper()

    adminUser = User(
        name=request.userName,
        admin=True
    )

    room = Room(
        code=roomCode,
        users=[adminUser]
    )

    rooms[roomCode] = room

    return {
        'message': "Created Room Successfully",
        'roomCode': roomCode,
    }

# ---
# GET INFO ABOUT ROOM
# ---

@app.get("/api/{roomCode}/getInfo")
def GetRoomInfo(roomCode:str):

    roomCode = roomCode.upper()

    if (roomCode not in rooms): return {'error': "Room Not Found"}
    return rooms[roomCode]

# ---
# OPTION RELATED
# ---

@app.post("/api/{roomCode}/poll/question")
def ChangeQuestion(roomCode:str, request:QuestionRequest):

    roomCode = roomCode.upper()

    if (roomCode not in rooms): return {'error': "Room Not Found!"}

    rooms[roomCode].poll.question = request.question

    return {'message': "Created Question Successfully"}

@app.post("/api/{roomCode}/poll/addoption")
def AddOption(roomCode:str, request:AddOptionRequest):

    roomCode = roomCode.upper()

    if (roomCode not in rooms): return {'error': "Room Not Found"}

    room = rooms[roomCode]
    poll = room.poll

    if (len(poll.options) >= 6): return {'message': "Option Cant Be Added, >6"}

    if (request.correct and poll.pickedCorrect): return {'message': "Option Cant Be Added, Already Correct Options Chosen"}

    option = Option(
        value=request.value,
        isCorrect=request.correct
    )

    poll.options.append(option)

    if (request.correct): poll.pickedCorrect = True

    print(rooms)

    return {
        'message': "Option Added",
        'optionID': option.id,
    }

@app.post("/api/{roomCode}/poll/removeoption")
def RemoveOption(roomCode:str, request:RemoveOptionRequest):

    roomCode = roomCode.upper()

    if (roomCode not in rooms): return {'error': "Room Not Found"}

    room = rooms[roomCode]
    poll = room.poll

    option = next((option for option in poll.options if option.id == request.uid), None)
    if (option == None): return {'error': "Option Not Found"} 

    poll.options.remove(option)

    if option.isCorrect:
        poll.pickedCorrect = False

    return {
        'message': "Option Removed",
        'optionID': request.uid
    }

# ---
# JOIN AND LEAVE ROOM
# ---

@app.post("/api/{roomCode}/join")
def JoinRoom(roomCode:str, request:RoomCreateJoinCodeRequest):
    roomCode = roomCode.upper()

    if (roomCode not in rooms): return {"error": "Room Not Found", "code": -1}

    room = rooms[roomCode]

    user = User(name=request.userName)

    room.users.append(user)

    return {
        "message" : "Joined Room",
        "roomCode": roomCode,
        "user": user,
        "code": 0,
    }

@app.post("/api/{roomCode}/leave")
def LeaveRoom(roomCode:str, request:UserIDRequest):
    roomCode = roomCode.upper()

    if (roomCode not in rooms): return {"error": "Room Not Found", "code": -1}

    room = rooms[roomCode]

    userRem = next((user for user in room.users if user.id == request.userID), None)
    if (userRem == None): return {'error': "User Not Found"} 

    room.users.remove(userRem)

    return {
        'message': "User Left",
        'userID': request.userID
    }

@app.post("/api/{roomCode}/start")
def StartPoll(roomCode:str):
    roomCode = roomCode.upper()

    if (roomCode not in rooms): return {"error": "Room Not Found", "code": -1}

    rooms[roomCode].poll.started = True

    return {'message': "Poll Started"}

@app.post("/api/{roomCode}/end")
def EndPoll(roomCode:str):
    roomCode = roomCode.upper()

    if (roomCode not in rooms): return {"error": "Room Not Found", "code": -1}

    rooms[roomCode].poll.started = True
    rooms[roomCode].poll.ended = True

    return {'message': "Poll Ended"}

@app.get("/api/{roomCode}/poll")
def GetPoll(roomCode:str):
    roomCode = roomCode.upper()
    if (roomCode not in rooms): return {"error": "Room Not Found", "code": -1}
    return rooms[roomCode]

@app.get("/api/{roomCode}/get/users")
def GetTotalUsers(roomCode:str):
    roomCode = roomCode.upper()
    if (roomCode not in rooms): return {"error": "Room Not Found", "code": -1}
    return {"totalUsers": len(rooms[roomCode].users)}

@app.post("/api/{roomCode}/vote/{optionID}")
def AddVote(roomCode:str, optionID:str, request:UserIDRequest):
    roomCode = roomCode.upper()
    if (roomCode not in rooms): return {"error": "Room Not Found", "code": -1}

    room = rooms[roomCode]
    option = next((option for option in room.poll.options if option.id == optionID), None)
    if (option == None): return {"error": "Invalid Option"}

    user = next((user for user in room.users if user.id == request.userID), None)
    if user == None: return {"error": "Invalid User"}
    if user.voted: return {"error": "User Already Voted"}
    if not room.poll.started: return {"error": "Poll Has Not Started"}
    if room.poll.ended: return {"error": "Poll Has Ended"}

    option.votes += 1
    user.voted = True
    user.votedOptionID = optionID

    return {"message": "Vote Added"}