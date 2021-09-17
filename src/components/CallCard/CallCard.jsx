import React, { useState, useRef, useEffect } from "react";
import * as tf from "@tensorflow/tfjs";
import * as facemesh from "@tensorflow-models/face-landmarks-detection";
import Webcam from "react-webcam";
import { drawMesh } from "../CallCard/utilities";
import './style.css';
import axios from "axios";
import { Link, useHistory } from 'react-router-dom';

function CallCard() {
    const [unitList, setUnitList] = useState([])
    const [searchTerm, setSearchTerm] = useState("")
    const [searchResults, setSearchResults] = useState([])
    const [faceArray, setFaceArray] = useState([])
    const inputElement = useRef("")

    const getUnitsData = async () => {
        capture()
        let units = await axios.get("http://localhost:4000/units", {
            headers: {
                "Authorization": window.localStorage.getItem("app_token")
            }
        })
        setUnitList([...units.data])
    }

    const handleSearch = (searchTerm) => {
        setSearchTerm(searchTerm)
        if (searchTerm !== "") {
            const newUnitList = unitList.filter((unit) => {
                return (Object.values(unit).join(" ").toLowerCase().includes(searchTerm.toLowerCase()))
            })
            setSearchResults(newUnitList)
        }
        else {
            setSearchResults(unitList)
        }
    }

    const getSearchTerm = () => {
        handleSearch(inputElement.current.value)
    }


    const history = useHistory()

    const [image, setImage] = useState('');
    const webcamRef = useRef(null);
    const canvasRef = useRef(null);

    const capture = React.useCallback(() => {
        const imageSrc = webcamRef.current.getScreenshot();
        console.log(imageSrc)
        setImage(imageSrc);
        downloadImage(imageSrc);
    }, [webcamRef]);

    async function downloadImage(imageSrc) {
        const image = await fetch(imageSrc);
        const imageBlob = await image.blob();
        const file = new File([imageBlob], "myFile.png", { type: imageBlob.type });
        uploadImageToDir(file);
    }

    const uploadImageToDir = (photo) => {
        const formData = new FormData();
        formData.append("myImg", photo);
        fetch("http://localhost:5000/uploadForm", {
            method: "POST",
            body: formData,
        })
            .then((res) => res.json())
            .then((res) => console.log(res));
        console.log(JSON.stringify({ myImg: photo }))
    };

    //  Load posenet
    const runFacemesh = async () => {
        const net = await facemesh.load(facemesh.SupportedPackages.mediapipeFacemesh);
        setInterval(() => {
            detect(net);
        }, 1000);
    };

    const detect = async (net) => {
        if (
            typeof webcamRef.current !== "undefined" &&
            webcamRef.current !== null &&
            webcamRef.current.video.readyState === 4
        ) {
            // Get Video Properties
            const video = webcamRef.current.video;
            const videoWidth = webcamRef.current.video.videoWidth;
            const videoHeight = webcamRef.current.video.videoHeight;

            // Set video width
            webcamRef.current.video.width = videoWidth;
            webcamRef.current.video.height = videoHeight;

            // Set canvas width
            canvasRef.current.width = videoWidth;
            canvasRef.current.height = videoHeight;
            const face = await net.estimateFaces({ input: video });
            setFaceArray(face)
            // console.log(face);

            // Get canvas context
            const ctx = canvasRef.current.getContext("2d");
            requestAnimationFrame(() => { drawMesh(face, ctx) });
            
            if (face.length !== 0) {
                // capture()
                // const entryPointAudio = document.createElement("audio")
                // entryPointAudio.setAttribute("src", `${process.env.PUBLIC_URL}/assets/audios/entry-point.mp3`)
                // entryPointAudio.loop = true
            }
        }
    };

    useEffect(() => { runFacemesh() }, []);

    // console.log(faceArray)

    return (
        <>
            {/* <button onClick={() => {
                window.localStorage.removeItem("userName")
                window.localStorage.removeItem("roleType")
                window.localStorage.removeItem("app_token")
                history.push("/")
            }}>Logout</button> */}
            <div className="html-container">
                <div className="html-card">

                    <div className="company">
                        <div className="logo-div">
                            <img src={`${process.env.PUBLIC_URL}/assets/images/logo.png`} alt="logo" logo-here />
                        </div>
                        <div className="company-detail">
                            <div className="address">
                                <h2 className="street-add">102 Bay Street</h2>
                                <hr />
                                <p className="full-add">Toronto, CA M4B 1B3 | +1 234 567 8022</p>
                            </div>
                        </div>
                    </div>

                    <div className="video-calling-screen">

                        <Webcam
                            className='video-screen'
                            ref={webcamRef}
                            style={{
                                position: "absolute",
                                marginLeft: "auto",
                                marginRight: "auto",
                                left: 0,
                                right: 0,
                                zindex: 9,
                                width: 470,
                                height: 300,
                            }}
                        />

                        <canvas
                            className='face-canvas'
                            ref={canvasRef}
                            style={{
                                position: "absolute",
                                marginLeft: "auto",
                                marginRight: "auto",
                                left: 0,
                                right: 0,
                                textAlign: "center",
                                zindex: 9,
                                width: 470,
                                height: 300
                            }}
                        />
                    </div>
                    {faceArray.length !== 0 ? <audio src='./assets/audios/entry-point.mp3' autoPlay loop /> : ""}
                    <div className="unlock-buttons">
                        <div className="call-unit-div">
                            {/* <button href="#sidebar" className="call-unit btn" onClick={getUnitsData} data-bs-toggle="offcanvas" role="button" aria-controls="sidebar">
                                <i className="fas fa-people-arrows fa-2x"></i><br />
                                <p className="btn-text">Call Unit</p>
                            </button> */}
                            <button type="button" class="call-unit btn" data-bs-toggle="modal" data-bs-target="#exampleModal" onClick={getUnitsData} >
                                <i className="fas fa-people-arrows fa-2x"></i><br />
                                <p className="btn-text">Call Unit</p>
                            </button>
                        </div>
                        <div className="virtual-key-div">
                            <button className="virtual-key btn" onClick={(e) => {
                                e.preventDefault();
                                capture();
                            }}>
                                <i className="fas fa-key fa-2x"></i><br />
                                <p className="btn-text">Virtual Key</p>
                            </button>
                        </div>
                        <div className="door-pin-div">
                            <button className="door-pin btn" onClick={(e) => {
                                e.preventDefault();
                                capture();
                            }}>
                                <i className="fas fa-lock fa-2x"></i><br />
                                <p className="btn-text">Door Pin</p>
                            </button>
                        </div>
                        <div className="delivery-div">
                            <button className="delivery btn" onClick={(e) => {
                                e.preventDefault();
                                capture();
                            }}>
                                <i className="fas fa-truck fa-2x"></i><br />
                                <p className="btn-text">Delivery</p>
                            </button>
                        </div>
                    </div >
                </div>
            </div>

            {/* Offcanvas */}
            {/* <div className="offcanvas offcanvas-end" tabIndex="-1" id="sidebar" aria-labelledby="sidebar-label">
                <div className="offcanvas-header">
                    <h5 className="offcanvas-title" id="sidebar-label">Units List</h5>
                    <button type="button" className="btn-close" data-bs-dismiss="offcanvas" ariaa-label="close"></button>
                </div>
                <div className="offcanvas-body">
                    <input type="text" className="search-box" placeholder="Search for a unit no. or tenant name & hit enter..." value={searchTerm} onChange={getSearchTerm} ref={inputElement} />

                    {
                        searchTerm.length < 1 ? unitList.map((unit) => {
                            return (
                                <div className="unit-row">
                                    <div className="unit-text">
                                        <h5 className="text-white">{unit.unitNumber}</h5>
                                        <h5 className="text-white">{unit.tenantName}</h5>
                                    </div>
                                    <div className="unit-video-call">
                                        <a target="_blank" href="https://gic-video-calling-app.netlify.app/">
                                            <i className="fas fa-video fa-2x video-call-icon"></i>
                                        </a>
                                    </div>
                                </div>
                            )
                        }) : searchResults.map((unit) => {
                            return (
                                <div className="unit-row">
                                    <div className="unit-text">
                                        <h5 className="text-white">{unit.unitNumber}</h5>
                                        <h5 className="text-white">{unit.tenantName}</h5>
                                    </div>
                                    <div className="unit-video-call">
                                        <a target="_blank" href="https://gic-video-calling-app.netlify.app/">
                                            <i className="fas fa-video fa-2x video-call-icon"></i>
                                        </a>
                                    </div>
                                </div>
                            )
                        })
                    }
                    {
                        (searchResults.length <= 0 && searchTerm !== "") ? "No results found..." : ""
                    }
                </div>
            </div> */}

            {/* <!-- Modal --> */}
            <div class="modal fade" id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="exampleModalLabel">Units List</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <input type="text" className="search-box" placeholder="Search for a unit no. or tenant name & hit enter..." value={searchTerm} onChange={getSearchTerm} ref={inputElement} />

                            {
                                searchTerm.length < 1 ? unitList.map((unit) => {
                                    return (
                                        <div className="unit-row">
                                            <div className="unit-text">
                                                <h5 className="text-white">{unit.unitNumber}</h5>
                                                <h5 className="text-white">{unit.tenantName}</h5>
                                            </div>
                                            <div className="unit-video-call">
                                                <a target="_blank" href="https://gic-video-calling-app.netlify.app/">
                                                    <i className="fas fa-video fa-2x video-call-icon"></i>
                                                </a>
                                            </div>
                                        </div>
                                    )
                                }) : searchResults.map((unit) => {
                                    return (
                                        <div className="unit-row">
                                            <div className="unit-text">
                                                <h5 className="text-white">{unit.unitNumber}</h5>
                                                <h5 className="text-white">{unit.tenantName}</h5>
                                            </div>
                                            <div className="unit-video-call">
                                                <a target="_blank" href="https://gic-video-calling-app.netlify.app/">
                                                    <i className="fas fa-video fa-2x video-call-icon"></i>
                                                </a>
                                            </div>
                                        </div>
                                    )
                                })
                            }
                            {
                                (searchResults.length <= 0 && searchTerm !== "") ? "No results found..." : ""
                            }
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default CallCard;