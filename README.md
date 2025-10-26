### **How to run front-end**
- inside the project root directory(...\UniVoyage\, run the following commands:
  ```bash
  cd frontend
  npm install
  npm run dev
  ```
- this should provide you with a localhost link (usually http://localhost:5173/) to access the front-end application in your web browser.

- make sure the back-end server is also running to enable full functionality of the application.
- to run back-end, you should do following steps:
  - open another terminal window
  - navigate to the project root directory(...\UniVoyage\)
  - run the following commands:
    ```bash
    cd backend
    ./mvnw spring-boot:run
    ```
    
 - running this command will start the Spring Boot server, which by default listens on http://localhost:8080/.
 - also this runs migrations to set up the database schema automatically.
 - to check if back-end is running properly, you can open a web browser and navigate to http://localhost:8080/. If everything is set up correctly, you should see a simple login page, this is now default because Spring Boot settings haven't been changed.