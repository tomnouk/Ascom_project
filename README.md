# Ascom_project

# **Patien-Grid**
React application for displaying, searching, sorting, and editing patient data fetched from an API.

## **Key Features**
- **Search**: Search for patients by name, birth date, or sex.
- **Sort**: Sort data by different columns (e.g., name, sex, birth date, or alarm).
- **Edit**: Edit patient details directly in the app.
- **Patient Details**: View additional patient information, including parameters and alarm status.

#### **Prerequisites**
Before running the application, ensure you have the following installed on your machine:

- Node.js (version 14 or higher)
- npm or yarn


#### **Installation and Setup**
**1** : Clone the repository:
```bash
git clone https://github.com/your-repo/patient-management-app.git
cd patient-management-app
```
**2** : Install dependencies:
```bash
npm install
```
**3** : Start the development server:
```bash
npm start
```

#### **Libraries and Resources Used**
- **React**: JavaScript library for building the user interface.
- **React-Table**: Library for building customizable tables with sorting functionality.
- **Axios**: Promise-based HTTP client for making API requests.
- **React Hooks**: For managing component state and side effects (e.g., useState, useEffect).
  
#### **API Endpoints**
- **GET**: https://mobile.digistat.it/CandidateApi/Patient/GetList
  Fetches the list of patients.
- **POST** : https://mobile.digistat.it/CandidateApi/Patient/Update
  Updates patient details.

*(If the API endpoint changes or requires different credentials, update them in the fetchData function within the PatientGridSort component.)*


