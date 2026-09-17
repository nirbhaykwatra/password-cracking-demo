# Password Cracking Demo

This is a web app which demonstrates the concepts involved in password storage as well as practical examples of password cracking.

## Lesson Breakdown

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
        - FOCUS: Using a list of precomputed hashes to crack hashed passwords.
    4. Credential Stuffing
        - FOCUS: Using a list of leaked credentials to log into a particular website or service.
    5. Social Engineering
        - FOCUS: Attempting to guess a password based on interactions with the person who created the password.
    - DEMO: all of the above
5. Password Storage Safety
    1. Repeated Hashing
    2. Salting
6. Password Management
    1. How to choose a good password? Hint: use a random password
    2. How to store passwords? Hint: use a password manager
