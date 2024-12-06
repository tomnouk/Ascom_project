import React, { useEffect, useState } from "react";
import { useTable, useSortBy } from "react-table";
import axios from "axios";
import "./style.css";

const PatientGridSort = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null); // Sélection du patient
  const [showSortMenu, setShowSortMenu] = useState(null);
  const [sortOption, setSortOption] = useState({});
  const [isEditDialogOpen, setEditDialogOpen] = useState(false);
  const [editData, setEditData] = useState({
    familyName: "",
    givenName: "",
    sex: ""
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB");
  };

  useEffect(() => {
    const fetchData = async () => {
      const username = "test";
      const password = "TestMePlease!";
      const encodedCredentials = btoa(`${username}:${password}`);

      try {
        const response = await axios.get(
          "https://mobile.digistat.it/CandidateApi/Patient/GetList",
          {
            headers: {
              Authorization: `Basic ${encodedCredentials}`,
            },
          }
        );
        console.log("Data retrieved:", response.data);
        setData(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Unable to fetch data.");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const openEditDialog = (patient) => {
    setEditData({
      id: patient.id, // Assurez-vous d’avoir l'ID pour l'update
      familyName: patient.familyName,
      givenName: patient.givenName,
      sex: patient.sex,
    });
    setEditDialogOpen(true);
  };

  const closeEditDialog = () => {
    setEditDialogOpen(false);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData({ ...editData, [name]: value });
  };

  const saveEditData = async () => {
    try {
      const response = await axios.post(
        "https://mobile.digistat.it/CandidateApi/Patient/Update",
        editData
      );

      if (response.status === 200) {
        alert("Patient data updated successfully!");
        setData((prevData) =>
          prevData.map((patient) =>
            patient.id === editData.id ? { ...patient, ...editData } : patient
          )
        );
        closeEditDialog();
      } else {
        alert("Failed to update patient data.");
      }
    } catch (error) {
      console.error("Error updating patient data:", error);
      alert("An error occurred while updating the patient data.");
    }
  };

  const columns = React.useMemo(
    () => [
      { Header: "Family Name", accessor: "familyName" },
      { Header: "Given Name", accessor: "givenName" },
      {
        Header: "Sex",
        accessor: "sex",
        Cell: ({ value }) => (value === "M" ? "M" : "F"),
      },
      {
        Header: "Birth Date",
        accessor: "birthDate",
        Cell: ({ value }) => formatDate(value),
      },
      {
        Header: "Parameters",
        accessor: "parameters",
        Cell: ({ row }) => {
          const parameters = row.original.parameters || [];
          return (
            <button
              className="parameters-button"
              onClick={() => setSelectedPatient(row.original)} // Sélectionner un patient pour voir les détails
            >
              {parameters.length} parameters
            </button>
          );
        },
      },
      {
        Header: "Alarm",
        Cell: ({ row }) => {
          const parameters = row.original.parameters || [];
          const hasAlarm = parameters.some((param) => param.alarm === true);
          return hasAlarm ? "🔴" : "No alarm";
        },
      },
      {
        Header: "Actions",
        Cell: ({ row }) => (
          <button
            className="parameters-button"
            onClick={() => openEditDialog(row.original)}
          >
            Edit
          </button>
        ),
      },
    ],
    []
  );

  const tableInstance = useTable({ columns, data }, useSortBy);
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    tableInstance;

  if (loading) {
    return <p className="loading">Loading data...</p>;
  }

  if (error) {
    return <p className="error">Error: {error}</p>;
  }

  const handleSortChange = (columnId, desc) => {
    tableInstance.toggleSortBy(columnId, desc);
    setSortOption({ columnId, desc });
    setShowSortMenu(null);
  };

  return (
    <div className="PatientGrid">
      <h1>Patient Grid</h1>
      <div className="table-container">
        <table {...getTableProps()}>
          <thead>
            {headerGroups.map((headerGroup) => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column) => (
                  <th {...column.getHeaderProps()}>
                    <div
                      style={{ position: "relative" }}
                      onMouseEnter={() =>
                        setShowSortMenu(column.id)
                      }
                      onMouseLeave={() =>
                        setShowSortMenu(null)
                      }
                    >
                      {column.render("Header")}
                      {showSortMenu === column.id && (
                        <div className="sort-menu show">
                          {column.id === "sex" && (
                            <>
                              <button onClick={() => handleSortChange(column.id, true)}>
                                Sex M
                              </button>
                              <button onClick={() => handleSortChange(column.id, false)}>
                                Sex F
                              </button>
                            </>
                          )}
                          {column.id === "birthDate" && (
                            <>
                              <button onClick={() => handleSortChange(column.id, true)}>
                                Born earliest
                              </button>
                              <button onClick={() => handleSortChange(column.id, false)}>
                                Born latest
                              </button>
                            </>
                          )}
                          {column.id === "alarm" && (
                            <>
                              <button onClick={() => handleSortChange(column.id, true)}>
                                Alarm
                              </button>
                              <button onClick={() => handleSortChange(column.id, false)}>
                                No alarm
                              </button>
                            </>
                          )}
                          {(column.id === "familyName" || column.id === "givenName") && (
                            <>
                              <button onClick={() => handleSortChange(column.id, false)}>
                                Sort A-Z
                              </button>
                              <button onClick={() => handleSortChange(column.id, true)}>
                                Sort Z-A
                              </button>
                            </>
                          )}
                          {column.id !== "sex" && column.id !== "birthDate" && column.id !== "alarm" && column.id !== "familyName" && column.id !== "givenName" && (
                            <>
                              <button onClick={() => handleSortChange(column.id, true)}>
                                Sort By Asc
                              </button>
                              <button onClick={() => handleSortChange(column.id, false)}>
                                Sort By Desc
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()}>
            {rows.map((row) => {
              prepareRow(row);
              return (
                <tr {...row.getRowProps()}>
                  {row.cells.map((cell) => (
                    <td {...cell.getCellProps()}>{cell.render("Cell")}</td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Détails du patient */}
      {selectedPatient && (
        <div className="patient-details">
          <h2>Patient Details</h2>
          <p><strong>Family Name:</strong> {selectedPatient.familyName}</p>
          <p><strong>Given Name:</strong> {selectedPatient.givenName}</p>
          <p><strong>Sex:</strong> {selectedPatient.sex}</p>
          <p><strong>Birth Date:</strong> {formatDate(selectedPatient.birthDate)}</p>

          <h3>Parameters</h3>
          <table className="parameters-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Value</th>
                <th>Alarm</th>
              </tr>
            </thead>
            <tbody>
              {selectedPatient.parameters && selectedPatient.parameters.map((param, index) => (
                <tr key={index}>
                  <td>{param.id}</td>
                  <td>{param.name}</td>
                  <td>{param.value}</td>
                  <td>{param.alarm ? "🔴" : "No alarm"}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <button className="closeButton" onClick={() => setSelectedPatient(null)}>
            &times; Close
          </button>
        </div>
      )}

      {/* Modal pour modifier le patient */}
      {isEditDialogOpen && (
        <div className="patient-details">
          <h2>Edit Patient</h2>
          <form>
            <label>
              Family Name:
              <input
                type="text"
                name="familyName"
                value={editData.familyName}
                onChange={handleEditChange}
              />
            </label>
            <label>
              Given Name:
              <input
                type="text"
                name="givenName"
                value={editData.givenName}
                onChange={handleEditChange}
              />
            </label>
            <label>
              Sex:
              <select name="sex" value={editData.sex} onChange={handleEditChange}>
                <option value="M">Male</option>
                <option value="F">Female</option>
              </select>
            </label>
            <button type="button" onClick={saveEditData}>
              Save
            </button>
            <button type="button" onClick={closeEditDialog}>
              Cancel
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default PatientGridSort;
