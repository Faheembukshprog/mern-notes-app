import api from "../api/axios"

export const Singup = async(username, email,password)=>{
    let payload = {
       username : username ,
       email : email ,
       password : password
    }
                                                                                
        try{
              const response =  await api.post("/auth/signup",payload)
               console.log(response.status)
            return response.data
        }
        catch (e){
            if (e.response) {
            return e.response.data
        }
    
  
    }
}

export const signin = async (email , password)=>{
        let payload = {
     
       email : email ,
       password : password
    }

        try{
              const response =  await api.post("/auth/login",payload)
              const token = response.data?.data?.token
              if (token) {
                window.localStorage.setItem("token", token)
              }
            return response.data
        }
        catch (e){
            if (e.response) {
            return e.response.data
              }
              }
    
}