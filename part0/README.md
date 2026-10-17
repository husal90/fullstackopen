# Part 0 – Exercises 0.4–0.6

Exercises 0.1–0.3 are reading only and are not submitted to GitHub.

## 0.4: New note diagram

```mermaid
sequenceDiagram
    participant browser
    participant server

    Note right of browser: User types a note into the text field and clicks Save

    browser->>server: POST https://studies.cs.helsinki.fi/exampleapp/new_note
    activate server
    Note right of server: The server creates a new note object (content + date) from the form data and adds it to the notes array
    server-->>browser: HTTP 302 redirect, Location: /exampleapp/notes
    deactivate server

    Note right of browser: The browser follows the redirect and reloads the Notes page

    browser->>server: GET https://studies.cs.helsinki.fi/exampleapp/notes
    activate server
    server-->>browser: HTML document
    deactivate server

    browser->>server: GET https://studies.cs.helsinki.fi/exampleapp/main.css
    activate server
    server-->>browser: the css file
    deactivate server

    browser->>server: GET https://studies.cs.helsinki.fi/exampleapp/main.js
    activate server
    server-->>browser: the JavaScript file
    deactivate server

    Note right of browser: The browser starts executing the JavaScript code that fetches the JSON from the server

    browser->>server: GET https://studies.cs.helsinki.fi/exampleapp/data.json
    activate server
    server-->>browser: [{ "content": "HTML is easy", "date": "2023-1-1" }, ... , { "content": "my new note", "date": "..." }]
    deactivate server

    Note right of browser: The browser executes the callback function that renders the notes, now including the new one
```

## 0.5: Single page app diagram

```mermaid
sequenceDiagram
    participant browser
    participant server

    browser->>server: GET https://studies.cs.helsinki.fi/exampleapp/spa
    activate server
    server-->>browser: HTML document
    deactivate server

    browser->>server: GET https://studies.cs.helsinki.fi/exampleapp/main.css
    activate server
    server-->>browser: the css file
    deactivate server

    browser->>server: GET https://studies.cs.helsinki.fi/exampleapp/spa.js
    activate server
    server-->>browser: the JavaScript file
    deactivate server

    Note right of browser: The browser starts executing the JavaScript code that fetches the JSON from the server

    browser->>server: GET https://studies.cs.helsinki.fi/exampleapp/data.json
    activate server
    server-->>browser: [{ "content": "HTML is easy", "date": "2023-1-1" }, ... ]
    deactivate server

    Note right of browser: The browser executes the callback function that renders the notes
```

## 0.6: New note in Single page app diagram

```mermaid
sequenceDiagram
    participant browser
    participant server

    Note right of browser: User types a note into the text field and clicks Save

    Note right of browser: The form's submit event handler prevents the default form submission (no page reload)
    Note right of browser: The handler creates a note object, adds it to the local notes list and re-renders the list on the page

    browser->>server: POST https://studies.cs.helsinki.fi/exampleapp/new_note_spa
    Note right of browser: Request header Content-Type: application/json, body {"content": "my new note", "date": "..."}
    activate server
    Note right of server: The server saves the new note
    server-->>browser: HTTP 201 Created {"message":"note created"}
    deactivate server

    Note right of browser: The page is not reloaded and no further requests are made
```
