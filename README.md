
## Run Locally in the VSCODE Terminal 

FRONTEND RUN

1. call the folder first to run the frontend
   "PS D:\Projects\TnP_Project> cd frontend-react"
   Then install and run node.js
**Prerequisites:**  Node.js
1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Generate the Gemini API Key from Google studio ai by clicking create new api key then copy the key in the .evn and save the file.
4. Run the app:
   `npm run dev`
then click on port by ctrl + click (with mouse)

BACKEND RUN (JAVA & PYTHON)

Next Terminal for JAVA & PYTHON separated two terminal
1. call the folder first to run the backend java for java 
   'PS D:\Projects\TnP_Project> cd backend-java'
2. Then Run the maven
   'PS D:\Projects\TnP_Project>backend-java> mvn install'
   'PS D:\Projects\TnP_Project>backend-java> mvn spring-boot:run'
3. call the folder first to run the ml-engine-python
   'PS D:\Projects\TnP_Project> cd ml-engine-python'
4. Create python environment first .venv
   write this in terminal
   'python -m venv .venv'
   '.venv\Scripts\activate'
   Then install all requirements pip
5. Then run
   '(.venv) PS D:\Projects\TnP_Project\ml-engine-python> python app.py'
NOTE: First Run the backend then frontend this is the correct order.
   
   
