import axios from 'axios';

const Login =  () => {
  const handleClick =async ()=>{
    console.log("Login button clicked")
    const resp = await axios.get('http://localhost:8000/api/auth/login');
    console.log(resp.data)
  }
  return (
    <div>
      <button onClick={handleClick}>Login</button>
      
    </div>
  )
}

export default Login
