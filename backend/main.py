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

rooms: dict[str, Room] = {
    "TEST67": Room(
            code="TEST67",
            poll=Poll(
                question="What is your favourite language?",
                options=[
                    Option(id="1", value="C++"),
                    Option(id="2", value="C"),
                    Option(id="3", value="Python"),
                ],
            started=True
        )
    )
}

connections : dict[str, list[WebSocket]] = {}

# ---
# WEBSOCKETS (fun, pain, misery, suffering)
# ---
async def BroadcastRoom(roomCode: str):
    if roomCode not in connections: return
    room = rooms[roomCode]

    message = {
        "type": "room_update",
        "data": room.model_dump()
    }

    disconnected = []

    for websocket in connections[roomCode]:
        try:
            await websocket.send_json(message)
        except Exception:
            disconnected.append(websocket)

    for websocket in disconnected:
        connections[roomCode].remove(websocket)

@app.websocket("/ws/{roomCode}")
async def WebSocketEndpoint(websocket: WebSocket, roomCode: str):
    roomCode = roomCode.upper()

    if roomCode not in rooms:
        await websocket.close(code=1008)
        return
    await websocket.accept()

    if roomCode not in connections: connections[roomCode] = []
    connections[roomCode].append(websocket)
    try:
        await websocket.send_json({
            "type": "room_update",
            "data": rooms[roomCode].model_dump()
        })
        while True:
            await websocket.receive_text()

    except WebSocketDisconnect:
        if roomCode in connections:
            if websocket in connections[roomCode]:
                connections[roomCode].remove(websocket)
            if len(connections[roomCode]) == 0:
                del connections[roomCode]

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
        'user': adminUser,
    }

# ---
# DELETE ROOM
# ---

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
async def ChangeQuestion(roomCode:str, request:QuestionRequest):

    roomCode = roomCode.upper()

    if (roomCode not in rooms): return {'error': "Room Not Found!"}

    rooms[roomCode].poll.question = request.question

    await BroadcastRoom(roomCode)

    return {'message': "Created Question Successfully"}

@app.post("/api/{roomCode}/poll/addoption")
async def AddOption(roomCode:str, request:AddOptionRequest):

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

    await BroadcastRoom(roomCode)

    return {
        'message': "Option Added",
        'optionID': option.id,
    }

@app.post("/api/{roomCode}/poll/removeoption")
async def RemoveOption(roomCode:str, request:RemoveOptionRequest):

    roomCode = roomCode.upper()

    if (roomCode not in rooms): return {'error': "Room Not Found"}

    room = rooms[roomCode]
    poll = room.poll

    option = next((option for option in poll.options if option.id == request.uid), None)
    if (option == None): return {'error': "Option Not Found"} 

    poll.options.remove(option)

    if option.isCorrect:
        poll.pickedCorrect = False

    await BroadcastRoom(roomCode)

    return {
        'message': "Option Removed",
        'optionID': request.uid
    }

# ---
# JOIN AND LEAVE ROOM
# ---

@app.post("/api/{roomCode}/join")
async def JoinRoom(roomCode:str, request:RoomCreateJoinCodeRequest):
    roomCode = roomCode.upper()

    if (roomCode not in rooms): return {"error": "Room Not Found", "code": -1}

    room = rooms[roomCode]

    user = User(name=request.userName)

    room.users.append(user)

    await BroadcastRoom(roomCode)

    return {
        "message" : "Joined Room",
        "roomCode": roomCode,
        "user": user,
        "code": 0,
    }

@app.post("/api/{roomCode}/leave")
async def LeaveRoom(roomCode:str, request:UserIDRequest):
    roomCode = roomCode.upper()

    if (roomCode not in rooms): return {"error": "Room Not Found", "code": -1}

    room = rooms[roomCode]

    userRem = next((user for user in room.users if user.id == request.userID), None)
    if (userRem == None): return {'error': "User Not Found"} 

    room.users.remove(userRem)

    await BroadcastRoom(roomCode)

    return {
        'message': "User Left",
        'userID': request.userID
    }

# ---
# JOIN AND LEAVE POLL
# ---

@app.post("/api/{roomCode}/start")
async def StartPoll(roomCode:str):
    roomCode = roomCode.upper()

    if (roomCode not in rooms): return {"error": "Room Not Found", "code": -1}

    rooms[roomCode].poll.started = True

    await BroadcastRoom(roomCode)

    return {'message': "Poll Started"}

@app.post("/api/{roomCode}/end")
async def EndPoll(roomCode:str):
    roomCode = roomCode.upper()

    if (roomCode not in rooms): return {"error": "Room Not Found", "code": -1}

    rooms[roomCode].poll.started = True
    rooms[roomCode].poll.ended = True

    await BroadcastRoom(roomCode)

    return {'message': "Poll Ended"}

@app.get("/api/{roomCode}/poll")
def GetPoll(roomCode:str):
    roomCode = roomCode.upper()
    if (roomCode not in rooms): return {"error": "Room Not Found", "code": -1}
    return rooms[roomCode]

@app.get("/api/{roomCode}/get/users")
async def GetTotalUsers(roomCode:str):
    roomCode = roomCode.upper()
    if (roomCode not in rooms): return {"error": "Room Not Found", "code": -1}

    await BroadcastRoom(roomCode)

    return {"totalUsers": len(rooms[roomCode].users)}

# ---
# ADD VOTE
# ---

@app.post("/api/{roomCode}/vote/{optionID}")
async def AddVote(roomCode:str, optionID:str, request:UserIDRequest):
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

    await BroadcastRoom(roomCode)

    return {"message": "Vote Added"}