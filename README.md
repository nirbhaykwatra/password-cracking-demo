# Password Cracking Demo

This is a web app which demonstrates the concepts involved in password storage as well as practical examples of password cracking.

## Demo Breakdown

1. What is a password? Why do we need them?
2. How are passwords stored?
    1. What are databases?
    - DEMO: Storing passwords in plain text in a database
3. Password Storage Concepts
    1. What is encryption? How does it work?
        - DEMO: Encrypt password with a key
    2. What is hashing?
        - DEMO: Hash password with MD5
4. Password Cracking Methods
    1. Brute Force
        - FOCUS: Password length, charset variability (using lowercase, UPPERCASE, letters, digits, symbols)
    2. Dictionary
        - FOCUS: Using existing list of common passwords, using different rulesets while trying passwords (leetspeak, using numbers in place of letters, etc.)
    3. Rainbow Table
        - FOCUS: Using a list of precomputed hashes to crack hashed passwords. Use weak MD5 hashes and hash top 10k or 100k common passwords as wordlist. Emphasize the importance of salting passwords, showcasing that salting renders rainbow tables completely useless.
    4. Credential Stuffing
        - FOCUS: Using a list of leaked credentials to log into a particular website or service. Show the two-stage process of getting leaked credentials and then creating combo lists by decrypting the hashed leaked credentials using hashcat.
    5. Social Engineering
        - FOCUS: Attempting to guess a password based on interactions with the person who created the password.
    - DEMO: all of the above
5. Password Storage Safety
    1. Repeated Hashing
    2. Salting
6. Password Management
    1. How to choose a good password? Hint: use a random password
    2. How to store passwords? Hint: use a password manager

## System Design

### Join code instead of session ID in the URL
A short memorable code (`TIGER-42`) is much easier for kids to type than a UUID. You generate it server-side on session creation.

### Students don't have "accounts" in the traditional sense
Each time you run the demo you create a new session and students sign up fresh. Old sessions can be archived or deleted. This also means email uniqueness should be **scoped per session**, not globally — two students in different classes can share an email.

### Instructor accounts are separate from student accounts
Keep them in a separate `instructors` table so there's no ambiguity. Instructors always authenticate with bcrypt regardless of the active demo stage.

### The dashboard becomes session-scoped
An instructor's dashboard shows only their active session — its students, their stored passwords (for the demo), and the stage controls.

### App Flow
**Instructor flow:**
1. Instructor logs in to their account
2. They create a new session — the app generates a short join code like `TIGER-42`
3. They write the join code on the board
4. They control the active stage from their dashboard — it only affects their session

**Student flow:**
1. Students go to `/join` and enter the join code
2. The join code is stored in their browser (a cookie or session storage)
3. They go to `/signup` — the sign-up form uses the join code to look up the session and its active stage
4. Their user account is created scoped to that session


### Database Schema (PostgreSQL)
#### Tables
```
instructors        — the teacher accounts
sessions           — a class session created by an instructor
users              — student accounts, now scoped to a session
```


#### Columns
```
instructors
  id  
  name  
  email  
  password (bcrypt always)  
  createdAt

classSessions
  id  
  code (unique, short e.g. "TIGER-42")  
  instructorId → instructors.id  
  createdAt

sites
  id  
  name ("ShopZone")  
  slug ("shopzone")  
  securityStage (fixed per site)

users
  id
  name
  email
  password
  sessionId → classSessions.id
  siteId    → sites.id
  unique(email, siteId, sessionId)
```
