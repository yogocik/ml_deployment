import React, { useState } from "react";
import axios from 'axios';
import * as tf from '@tensorflow/tfjs';

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

    async function predict_with_tfjs(data) {

        // Preprocessing the data (Only value scaling)
        let scaler = { 
            "housing_median_age": {
                "min": 1,
                "max": 52
            },
            "total_rooms": {
                "min": 2,
                "max": 39320
            },
            "total_bedrooms": {
                "min": 1,
                "max": 6445
            },
            "population": {
                "min": 5,
                "max": 35682
            }
        }

        const scale_value = (value, max_scale, min_scale) => {
            return (value - min_scale) / (max_scale - min_scale)
        }
        
        console.log("ORIGINAL DATA VALUES : ", 
        Object.keys(data).map(function(key){
            return data[key];
        }))

        for (let [key, val] of Object.entries(data)) {
            data[key] = scale_value(val, 
                                    scaler[key]['max'], 
                                    scaler[key]['min'])
        }

        // Assign or take only data values
        let data_values = Object.keys(data).map(function(key){
            return data[key];
        });
        console.log("CONVERTED DATA VALUES : ", data_values)

        // Preparing or loading TFJS GraphModel stored in remote repository
        const modelUrl  = `${process.env.REACT_APP_TFJS_MODEL_GCS_PUBLIC_URL}`;
        console.log("MODEL URL : ", modelUrl)
        const model = await tf.loadGraphModel(modelUrl);
        console.log("Model : ", model)
        
        // Convert the input data into tensor
        let tensor_data = tf.tensor(data_values).reshape([-1,4]);
        console.log("TF DATA ORIGINAL : ", tf.tensor(data_values))
        console.log("TF DATA RESHAPE : ", tensor_data)

        // Predict the tensor data
        let result = model.predict(tensor_data, {verbose: true})
        console.log("TF JS PREDICTION RESULT: ", result.dataSync())

        // Update UI state with prediction result
        setPredictedPrice(result.dataSync()[0])         
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
        } else if (deployment === 'tf-serving') {
            post_url = `${process.env.REACT_APP_BACKEND_URL}/tf_serving_prediction`
        }
        try {
            if (deployment !== 'tf-js'){
                const response = await axios.post(post_url, request_data);
                console.log("Response data, ", response);
                setPredictedPrice(response.data.price)
            } else {
                await predict_with_tfjs(request_data)
            }
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
                                <option value='tf-js'>TF JS</option>
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



// const myHeaders = new Headers({
        //     "Access-Control-Allow-Origin": "*",
        //     "Content-Type": "application/json,application/octet-stream",
        //     "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        //     "Accept-Encoding": "gzip, deflate, br",
        //     "Cache-Control": "public, max-age=3600"
        //   });
        //   `${process.env.REACT_APP_BACKEND_URL}/models/model.json`
        // const fetch = require('node-fetch')
        // https://storage.googleapis.com/nanovest-data-public-asset/model/model.json
        // const handler = tf.io.fileSystem("./public/models/ann_js/model.json");
        // {
        //     requestInit : {
        //         headers: {
        //             "Access-Control-Allow-Origin": "*",
        //             "Content-Type": "application/json,application/octet-stream",
        //             "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        //             "Accept-Encoding": "gzip, deflate, br",
        //             "Cache-Control": "public, max-age=3600"
        //           },
        //           cache: 'reload'
        //         // mode: 'no-cors'
        //     }
        //     // fetchFunc : fetch    
        // }


            // useEffect(() => {
    //     const loadModel = async () => {
    //       const model = await tf.loadGraphModel(modelData);;
    //       setTFJSModel(model);
    //     };
    //     loadModel();
    //   }, []);
    // import * as tf from '@tensorflow/tfjs-node'
// import fetch from 'node-fetch';
// const fetch = require('node-fetch')
// window.fetch = fetch
// import modelData from './models/ann_js/model.json';
// global.fetch = require('node-fetch');