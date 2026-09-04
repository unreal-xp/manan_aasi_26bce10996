# Live Polling Website
A simple project made for the shortlisting round of Software Development Club.

# Features
- Creation of Poll
- Addition of multiple options (upto 6, only one correct)
- Shows realtime bar for picked options to both users and admin.
- Simple and intuitive.

# Technologies Used
- Python (backend)
    - FastAPI
    - Websockets
    - Pydantics (Database)
- No Database (Time Constraints)
- Pure HTML + CSS + Javascript

# Architecture
- Works via API requests and WebSockets through FastAPI in Python.
- It is then integrated in the webpages using the corresponding scripts.
- `websock.js` is responsible for the main live communications between the `room` dictionary entity and the website.
- When a user makes a room, a new 8 character UUID is generated and assigned to a new `room` object.
- This UUID can then be shared with participants that can join the room. They will have to wait until the admin starts the poll. They are automatically connected to the poll as soon as the poll starts.
- During poll, the Admin can see the votes put in, but not names by any of the user (not implemented for names).
- At the end, the admin can decide when the poll needs to end. It then sends a request to end the poll to the API, and that is then shared to all users connected to that `room`.
- The results page show what is correct and what isn't.
- The admin then needs to delete the room. This request then deletes the room object, and that is then shared to all users. They are then redirected to the home page.

# Setup
- Clone the repository
- Download the required packages using
```python
pip install -r "backend/requirements.txt"
```
- If possible, use LiveServer (if using VSCode)
- Run the python environment
- In the terminal, while in the `backend` folder, run `uvicorn main:app --reload` for local running of API.

# About Hosting
Sadly, this is one big restriction of my project.

It looks like without an actual payment method, or a complete re-engineering of my project from scratch to not use Python's FastAPI, I cannot host it on sites like Vercel or similar.

I currently do not have a proper payment method setup for these kind of services.

Forgive me for this. Sadly you will have to just locally deploy it.

# About
This project was honestly not easy to make.

I am not experienced in web development, and have barely made any websites. It was my first time using FastAPI, Websockets, and integrating it into a live working website.

There are a lot of rookie mistakes I might have made along the way. 

Any issues that you find are welcomed in the GitHub's `Issues` tab.

For usecase of AI - 
- AI was used for understanding what structure I should make for a proper website.
- It was used to understand concepts that were hard to understand through traditional documentations.
- It was NOT used for direct copy-pasting code. It was only used for understanding how to work with the things I am not familiar with.

I am more familiar with softwares that do not relate with web at all. Mainly desktop applications. So this was my first attempt at all this.
