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
