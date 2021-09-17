import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useHistory } from 'react-router-dom'
import './style.css'

const Login = () => {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    const history = useHistory()

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            let loginData = await axios.post(`http://localhost:4000/login`, { email, password })
            console.log(loginData)
            if (loginData.data.roleType === "superAdmin") {
                window.localStorage.setItem("app_token", loginData.data.token)
                window.localStorage.setItem("userName", loginData.data.userName)
                window.localStorage.setItem("roleType", loginData.data.roleType)
                history.push("/call-card")
            }
            if (loginData.data.roleType === "condoOwner" && loginData.data.approved === "yes") {
                window.localStorage.setItem("app_token", loginData.data.token)
                window.localStorage.setItem("userName", loginData.data.userName)
                window.localStorage.setItem("roleType", loginData.data.roleType)
                history.push("/call-card")
            }
        } catch (error) {
            console.log(error)
        }
    }
    return (
        <>
            <div className="login-container">
                <div className="login-card text-center">
                    <h3 className="text-center text-primary">Nice to see you back!</h3>
                    <h4 className="text-center mt-0 text-danger">Login Now!</h4>
                    <br />
                    <form onSubmit={(e) => {
                        handleSubmit(e)
                    }}>

                        <input required value={email} onChange={e => setEmail(e.target.value)} className="form-control" placeholder="Email" type="text" />
                        <br />
                        <input required value={password} onChange={e => setPassword(e.target.value)} className="form-control" placeholder="Password" type="password" />
                        <br />
                        <input type="submit" value="Login" className="login-btn" />

                    </form>
                </div>
            </div>
        </>
    )
}

export default Login
