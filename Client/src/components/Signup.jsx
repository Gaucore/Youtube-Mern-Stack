import React, { useState } from 'react'
import '../App.css'
import axios from 'axios'

export default function Signup() {
  const [channelName, setChannelName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [logo, setLogo] = useState(null)
  const [imageUrl, setImageUrl] = useState('')

  const submitHandler=(e)=>{
      e.preventDefault()
      const formData=new FormData()
      formData.append('channelName',channelName)
      formData.append('email',email)
      formData.append('password',password)
      formData.append('phone',phone)
      formData.append('logo',logo)
      console.log(channelName,email,password,phone)

      axios.post("https://youtube-mern-stack-2.onrender.com/user/signup",formData)
      .then((response)=>{
        console.log(response)
      })
      .catch((err)=>{
        console.log(err)
      })

  }

  const filehandler=(e)=>{
    console.log(e.target.files[0])
    setLogo(e.target.files[0])
    setImageUrl(URL.createObjectURL(e.target.files[0]))
  }
  return (
    <div className='main-wrapper'>
      <div className='wrapper-header'>
        <img className="logo" src={"https://cdn.iconscout.com/icon/free/png-256/free-youtube-logo-icon-download-in-svg-png-gif-file-formats--social-media-70-flat-icons-color-pack-logos-432560.png"}/>
        <h2 className='c-name'>Our Tube</h2>
      </div>

       <form  className='form-wrapper' onSubmit={submitHandler}>
       <input required type="type" placeholder='Channel Name 'value={channelName} onChange={(e)=>{
          setChannelName(e.target.value)}} />
        <input required type="email" placeholder='Email ' value={email} onChange={(e)=>{
          setEmail(e.target.value)
        }} />
        <input required type="password" placeholder='Password ' value={password}  onChange={(e)=>{
          setPassword(e.target.value)
        }}  />
        <input required type="type" placeholder='Phone Number ' value={phone} onChange={(e)=>{
          setPhone(e.target.value)
        }}  />
        <input required type="file" onChange={filehandler}  />
        <img  className="preview-image" alt="logo-image" src={imageUrl} />
        <button type="submit">Sumbit</button>
       </form>

    </div>
  )
}
