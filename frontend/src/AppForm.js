import React, { useState } from "react";
import axios from 'axios';


const AppForm = () => {
    const [houseAge, setHouseAge] = useState(null);
    const [totalRooms, setTotalRooms] = useState(null);
    const [totalBedRooms, setTotalBedRooms] = useState(null);
    const [population, setPopulation] = useState(null);
    const [predictedPrice, setPredictedPrice] = useState(null);
    const [apiError, setApiError] = useState(null);
    const [deployment, setDeployment] = useState('hard-code');


    function updateHouseAge(event) {
        const new_value = Number(event.target.value);
        setHouseAge(new_value ? new_value : houseAge);
    }

    function updateRooms(event) {
        const new_value = Number(event.target.value);
        setTotalRooms(new_value ? new_value : totalRooms);
    }

    function updateBedRooms(event) {
        const new_value = Number(event.target.value);
        setTotalBedRooms(new_value ? new_value : totalBedRooms);
    }

    function updatePopulation(event) {
        const new_value = Number(event.target.value);
        setPopulation(new_value ? new_value : population);
    }

    function updateDeployment(event) {
        const new_value = event.target.value;
        setDeployment(new_value);
    }

    async function handleReset(event) {
        setHouseAge(null);
        setPopulation(null);
        setPredictedPrice(null)
        setTotalBedRooms(null)
        setTotalRooms(null)
        setApiError(null)
        setDeployment('hard-code')
    }

    async function handleSubmit(event) {
        event.preventDefault();
        let request_data = {
            "housing_median_age": houseAge,
            "total_rooms": totalRooms,
            "total_bedrooms": totalBedRooms,
            "population": population
        }
        console.log("Request Data, ", request_data);
        let post_url;
        if (deployment === 'hard-code') {
            post_url = `${process.env.REACT_APP_BACKEND_URL}/prediction`
        } else {
            post_url = `${process.env.REACT_APP_BACKEND_URL}/tf_serving_prediction`
        }
        try {
            const response = await axios.post(post_url, request_data);
            console.log("Response data, ", response);
            setPredictedPrice(response.data.price)
            setApiError(null)
        }
        catch (err) {
            setPredictedPrice(null)
            setApiError(err.message)
        }
    }

    return (
        <div className="container-fluid h-100 bg-light text-dark">
            <div className="row justify-content-center align-items-center">
                <h1>My ML Application Form</h1>
            </div>
            <hr />
            <div className="row justify-content-center align-items-center h-100">
                <div className="col col-sm-6 col-md-6 col-lg-4 col-xl-3">
                    <form>
                        <div className="form-group">
                            <label htmlFor="InputHouseAge">House Age</label>
                            <input type="text" className="form-control" id="InputHouseAge" placeholder="Enter house age in integer" onChange={updateHouseAge} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="InputTotalRooms">Total Rooms</label>
                            <input type="text" className="form-control" id="InputTotalRooms" placeholder="Enter total rooms in integer" onChange={updateRooms} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="InputTotalBedRooms">Total Bed Rooms</label>
                            <input type="text" className="form-control" id="InputTotalBedRooms" placeholder="Enter total bed rooms in integer" onChange={updateBedRooms} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="InputPopulation">Population</label>
                            <input type="text" className="form-control" id="InputPopulation" placeholder="Enter population in integer" onChange={updatePopulation} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="ModelDeployment">Model Deployment</label>
                            <select className="form-control" id="ModelDeployment" value={deployment} onChange={updateDeployment}>
                                <option value='hard-code'>Hard Code</option>
                                <option value='tf-serving'>TF Serving</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <div className="container">
                                <div className="row">
                                    <div className="col">
                                        <button className="col-6 btn btn-primary btn-sm" onClick={handleSubmit}>Submit</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="form-group">
                            <div className="container">
                                <div className="row">
                                    <div className="col">
                                        <button className="col-6 btn btn-danger btn-sm" onClick={handleReset}>Reset</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                    <hr />
                    {predictedPrice &&
                        <h2 className="justify-content-center">
                            Predicted Price <span className="badge badge-info">{predictedPrice}</span>
                        </h2>
                    }
                    {apiError &&
                        <h2 className="justify-content-center">
                            <span className="badge badge-danger">{apiError}</span>
                        </h2>
                    }
                </div>
            </div>
        </div >
    );
};

export default AppForm;