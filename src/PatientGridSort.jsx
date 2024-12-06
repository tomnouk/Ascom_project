import React, { useEffect, useState } from "react";
import { useTable, useSortBy } from "react-table";
import axios from "axios";
import "./style.css";

const PatientGridSort = () => {
	const [data, setData] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [selectedPatient, setSelectedPatient] = useState(null);
	const [showSortMenu, setShowSortMenu] = useState(null);
	const [sortOption, setSortOption] = useState({});
	const [isEditDialogOpen, setEditDialogOpen] = useState(false);
	const [editData, setEditData] = useState({
		familyName: "",
		givenName: "",
		sex: ""
	});
	const [searchTerm, setSearchTerm] = useState("");

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
		setSelectedPatient(null);

		setEditData({
			id: patient.id,
			familyName: patient.familyName,
			givenName: patient.givenName,
			sex: patient.sex,
		});
		setEditDialogOpen(true);
	};

	const closeEditDialog = () => {
		setEditDialogOpen(false);
	};

	const openPatientDetails = (patient) => {
		setEditDialogOpen(false);

		setSelectedPatient(patient);
	};

	const handleEditChange = (e) => {
		const { name, value } = e.target;
		setEditData({ ...editData, [name]: value });
	};

	const saveEditData = async () => {
		const username = "test";
		const password = "TestMePlease!";
		const encodedCredentials = btoa(`${username}:${password}`);

		try {
			const response = await axios.post(
				"https://mobile.digistat.it/CandidateApi/Patient/Update",
				editData,
				{
					headers: {
						"Content-Type": "application/json",
						Authorization: `Basic ${encodedCredentials}`,
					},
				}
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
							onClick={() => openPatientDetails(row.original)}
						>
							{parameters.length} parameters
						</button>
					);
				},
			},
			{
				Header: "Alarm",
				accessor: "alarm",
				Cell: ({ row }) => {
					const parameters = row.original.parameters || [];
					const hasAlarm = parameters.some((param) => param.alarm === true);
					return hasAlarm ? "🔴" : "No alarm";
				},
			},
			{
				Header: "Edit",
				accessor: "edit",
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

	const filteredData = React.useMemo(() => {
		const searchLower = searchTerm.trim().toLowerCase();
		const searchWords = searchLower.split(" ");
		return data.filter((patient) => {
			return searchWords.every((word) =>
				patient.familyName.toLowerCase().includes(word) ||
				patient.givenName.toLowerCase().includes(word) ||
				formatDate(patient.birthDate).includes(word) ||
				patient.sex.toLowerCase().includes(word)
			);
		});
	}, [data, searchTerm]);

	const tableInstance = useTable({ columns, data: filteredData }, useSortBy);
	const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
		tableInstance;

	if (loading) {
		return <p className="loading">Loading data...</p>;
	}

	if (error) {
		return <p className="error">Error: {error}</p>;
	}
	
	console.log(sortOption);

	const handleSortChange = (columnId, desc) => {
		if (columnId === "alarm") {
			const sortedData = [...data].sort((a, b) => {
				const aHasAlarm = hasAlarm(a);
				const bHasAlarm = hasAlarm(b);
				if (desc) {
					return bHasAlarm - aHasAlarm;
				} else {
					return aHasAlarm - bHasAlarm;
				}
			});
			setData(sortedData);
		} else if (columnId === "parameters") {
			const sortedData = [...data].sort((a, b) => {
				const aParams = a.parameters ? a.parameters.length : 0;
				const bParams = b.parameters ? b.parameters.length : 0;
				if (desc) {
					return bParams - aParams;
				} else {
					return aParams - bParams;
				}
			});
			setData(sortedData);
		} else {
			tableInstance.toggleSortBy(columnId, desc);
		}
		setSortOption({ columnId, desc });
		setShowSortMenu(null);
	};

	const hasAlarm = (patient) => {
		return patient.parameters && patient.parameters.some((param) => param.alarm === true);
	};

	const clearSearch = () => {
		setSearchTerm("");
	};

	return (
		<div className="PatientGrid">
			<div className="search-bar">
				<input
					type="text"
					placeholder="Search by name, or birth date"
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
				/>
				{searchTerm && (
					<button className="clear-button" onClick={clearSearch}>
						&times;
					</button>
				)}
			</div>
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
												column.id !== "edit" && setShowSortMenu(column.id)
											}
											onMouseLeave={() =>
												column.id !== "edit" && setShowSortMenu(null)
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
													{(column.id === "parameters") && (
														<>
														<button onClick={() => handleSortChange(column.id, false)}>
															Sort By Asc
														</button>
														<button onClick={() => handleSortChange(column.id, true)}>
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
						{rows.length > 0 ? (
							rows.map((row) => {
								prepareRow(row);
								return (
									<tr {...row.getRowProps()}>
										{row.cells.map((cell) => (
											<td {...cell.getCellProps()}>{cell.render("Cell")}</td>
										))}
									</tr>
								);
							})
						) : (
							<tr>
								{columns.map((column, index) => (
									<td key={index}>&nbsp;</td>
								))}
							</tr>
						)}
					</tbody>
				</table>
			</div>

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
						&times;
					</button>
				</div>
			)}

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