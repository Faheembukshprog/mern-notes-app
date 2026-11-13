import React, { useState } from 'react'
import {useFormik} from 'formik'
import * as Yup from 'yup'
import { Link } from 'react-router-dom'
import { signup } from '../services/authsservice'

function Signup() {

    const [message ,setMessage] =  useState()
    const [status ,setstatus] =  useState()

    const formik =  useFormik(
        {
            initialValues : { username : "" , email : "",password : ""},
            
            validationSchema : Yup.object({
                username : Yup.string().required("Username is required"),
                email : Yup.string().required("Email is required").email("Wrong email Format"),
                password : Yup.string().required("Password is required").min(7,"minimuim 7 characters")
                
            }),
            onSubmit :  async (values, { setSubmitting })=>{
                try {
                    const res = await signup(values.username, values.email, values.password)
                    setMessage(res.message)
                    setstatus(res.success)
                } catch (error) {
                    setMessage(error.message)
                    setstatus(false)
                } finally {
                    setSubmitting(false)
                }
            }
        }
    )

  return  <div>
    
         <div className=' flex justify-center  items-center'>
             <form onSubmit={formik.handleSubmit}>
                    <input type="text" name='username'  onChange={formik.handleChange}
                        className='flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm m-4'
                            placeholder='Enter Username'
                    />
                    <br />
                    <input type="email" name='email'
                     placeholder='Enter Email'
                      className='flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm m-4'
                    onChange={formik.handleChange} />
                    
                    <br />
                    <input type="password" name='password'
                     placeholder='Enter password'
                      className='flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm m-4'
                    onChange={formik.handleChange} />

                     
                    <br />
                    <button
                     className= { !formik.isValid ? 
                        'bg-gray-400 text-black-400 rounded-lg text-sm px-5 py-2' 
                        : 'bg-green-800 text-white rounded-lg text-sm px-5 py-2'}
                    type='submit' disabled={formik.isSubmitting} >{formik.isSubmitting ? 'Creating account…' : 'Signup'}</button>
          </form>
            
          
            
         </div>

          <div className=' mx-89'> 
             { formik.touched.username  && formik.errors.username  
                &&  ( <p className='text-red-600 '> ** {formik.errors.username}</p>) }
        
         {formik.touched.email  && formik.errors.email  &&
                        ( <p className='text-red-600 '> ** {formik.errors.email}</p>) }
        {formik.touched.password && formik.errors.password  &&
                        ( <p className='text-red-600'> ** {formik.errors.password}</p>) }
          </div>
        {
            message && <p className={status ? 'text-green-600  font-bold  mx-89' :  'text-red-600  font-bold  mx-89'} >
                {message}</p>
        }
        <p className='mt-4 text-center text-sm text-slate-600'>
            Already registered? <Link to='/login' className='font-medium text-blue-700 hover:underline'>Sign in</Link>
        </p>
 </div>

}

export default Signup
